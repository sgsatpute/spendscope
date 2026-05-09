import { NextRequest, NextResponse } from 'next/server';
import { runAudit } from '@/lib/auditEngine';
import { AuditInput } from '@/lib/types';
import { supabase } from '@/lib/supabase';

// Rate limit: simple in-memory store (use Upstash Redis in production)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= maxRequests) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: AuditInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.tools || body.tools.length === 0) {
    return NextResponse.json({ error: 'No tools provided' }, { status: 400 });
  }

  // Honeypot: if body contains __hp field, silently accept but ignore
  if ((body as Record<string, unknown>).__hp) {
    return NextResponse.json({ id: 'honeypot_' + Date.now() });
  }

  const audit = runAudit(body);

  // Store in Supabase (non-blocking – don't fail request if storage fails)
  try {
    await supabase.from('audits').insert({
      id: audit.id,
      input: audit.input,
      results: audit.results,
      total_monthly_spend: audit.totalMonthlySpend,
      total_monthly_savings: audit.totalMonthlySavings,
      total_annual_savings: audit.totalAnnualSavings,
      created_at: audit.createdAt,
    });
  } catch (e) {
    console.error('Supabase insert failed:', e);
  }

  return NextResponse.json(audit);
}
