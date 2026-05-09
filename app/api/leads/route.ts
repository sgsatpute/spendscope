import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { LeadCapture } from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY);

const HIGH_SAVINGS_THRESHOLD = 500;

function buildEmailHtml(lead: LeadCapture): string {
  const isHighSavings = lead.totalMonthlySavings >= HIGH_SAVINGS_THRESHOLD;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your SpendScope Audit</title></head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 16px; color: #0D0D0D;">
  <h1 style="font-size: 28px; margin-bottom: 8px;">Your AI Spend Audit</h1>
  <p style="color: #9B9B9B; margin-top: 0;">From SpendScope by Credex</p>
  
  <div style="background: #0D0D0D; color: white; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <p style="margin: 0 0 4px 0; font-size: 14px; opacity: 0.7;">Potential monthly savings</p>
    <p style="font-size: 40px; font-weight: 700; margin: 0;">$${lead.totalMonthlySavings.toLocaleString()}</p>
    <p style="font-size: 16px; opacity: 0.7; margin: 4px 0 0 0;">$${(lead.totalMonthlySavings * 12).toLocaleString()} per year</p>
  </div>

  <p>Your full audit is saved at:</p>
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/audit/${lead.auditId}" style="color: #FF4D1C;">
    ${process.env.NEXT_PUBLIC_APP_URL}/audit/${lead.auditId}
  </a>

  ${isHighSavings ? `
  <div style="border: 2px solid #FF4D1C; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <h2 style="margin-top: 0; color: #FF4D1C;">Capture more of these savings</h2>
    <p>With $${lead.totalMonthlySavings}/month in identified savings, you qualify for a free Credex consultation. Credex sources discounted AI infrastructure credits from companies that over-purchased — same tools, lower price.</p>
    <a href="https://credex.rocks/consult?ref=spendscope&aid=${lead.auditId}" style="display: inline-block; background: #FF4D1C; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Book a free consultation →</a>
  </div>
  ` : ''}

  <hr style="border: none; border-top: 1px solid #E5E0D8; margin: 24px 0;">
  <p style="font-size: 12px; color: #9B9B9B;">
    SpendScope by Credex · credex.rocks<br>
    You're receiving this because you submitted an audit at spendscope.app.
  </p>
</body>
</html>
  `;
}

export async function POST(req: NextRequest) {
  let lead: LeadCapture;
  try {
    lead = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!lead.email || !lead.email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  // Honeypot check
  if ((lead as Record<string, unknown>).__hp) {
    return NextResponse.json({ success: true });
  }

  // Store lead
  try {
    await supabase.from('leads').insert({
      email: lead.email,
      company_name: lead.companyName,
      role: lead.role,
      team_size: lead.teamSize,
      audit_id: lead.auditId,
      total_monthly_savings: lead.totalMonthlySavings,
    });
  } catch (e) {
    console.error('Lead storage error:', e);
  }

  // Send confirmation email
  try {
    await resend.emails.send({
      from: 'SpendScope <audit@spendscope.app>',
      to: lead.email,
      subject: `Your AI spend audit — $${lead.totalMonthlySavings}/mo savings identified`,
      html: buildEmailHtml(lead),
    });
  } catch (e) {
    console.error('Email send error:', e);
    // Don't fail the request — just log
  }

  return NextResponse.json({ success: true });
}
