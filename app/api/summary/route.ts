import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AuditResult } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(audit: AuditResult): string {
  const toolSummaries = audit.results.map((r) => {
    return `- ${r.toolName} (${r.plan}, ${r.seats} seat(s), $${r.currentMonthlySpend}/mo): ${r.recommendation.description} — saves $${r.savingsMonthly}/mo`;
  }).join('\n');

  return `You are a no-nonsense financial analyst advising a startup on AI tool spend optimization.

The user's team has ${audit.input.teamSize} people. Primary use case: ${audit.input.useCase}.
Current total monthly AI spend: $${audit.totalMonthlySpend}.
Identified monthly savings: $${audit.totalMonthlySavings} ($${audit.totalAnnualSavings} annualized).

Per-tool findings:
${toolSummaries}

Write a concise, personalized 80-100 word audit summary. Tone: direct, financially literate, helpful — like a CFO who cares. Avoid corporate jargon. Do not use bullet points. Start with the most important finding. End with a specific action the reader should take first. Do not mention Credex. Plain text only.`;
}

function fallbackSummary(audit: AuditResult): string {
  if (audit.isOptimal) {
    return `Your team of ${audit.input.teamSize} is spending $${audit.totalMonthlySpend}/month on AI tools and you're already well-optimized. No immediate changes recommended — your current stack aligns with your ${audit.input.useCase} use case. Keep an eye on usage as your team grows, and revisit plan tiers at the next renewal cycle.`;
  }
  const topResult = [...audit.results].sort((a, b) => b.savingsMonthly - a.savingsMonthly)[0];
  return `Your team's AI stack has an estimated $${audit.totalMonthlySavings}/month in savings available — $${audit.totalAnnualSavings}/year. The biggest opportunity is ${topResult.toolName}: ${topResult.recommendation.description} saves $${topResult.savingsMonthly}/month. Start there. Review remaining tools at your next billing cycle.`;
}

export async function POST(req: NextRequest) {
  let audit: AuditResult;
  try {
    audit = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: buildPrompt(audit) }],
    });

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    return NextResponse.json({ summary: text });
  } catch (e) {
    console.error('Anthropic API error:', e);
    // Graceful fallback
    return NextResponse.json({ summary: fallbackSummary(audit), fallback: true });
  }
}
