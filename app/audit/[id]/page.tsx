import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AuditResultsClient from '@/components/AuditResults';
import { AuditResult } from '@/lib/types';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const audit = await getAudit(params.id);
  if (!audit) return { title: 'Audit not found — SpendScope' };

  const savings = audit.totalMonthlySavings;
  const title = savings > 0
    ? `$${savings}/mo in AI savings found — SpendScope Audit`
    : 'AI Spend Audit — SpendScope';
  const description = savings > 0
    ? `This team could save $${savings}/month ($${audit.totalAnnualSavings}/year) on AI tools. See the full breakdown.`
    : 'This team\'s AI tool stack is well-optimized. See the full audit breakdown.';

  const ogUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/og?savings=${savings}&annual=${audit.totalAnnualSavings}&spend=${audit.totalMonthlySpend}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogUrl],
    },
  };
}

async function getAudit(id: string): Promise<AuditResult | null> {
  try {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      input: data.input,
      results: data.results,
      totalMonthlySpend: data.total_monthly_spend,
      totalMonthlySavings: data.total_monthly_savings,
      totalAnnualSavings: data.total_annual_savings,
      summary: data.summary,
      createdAt: data.created_at,
      isOptimal: data.total_monthly_savings < 10,
    };
  } catch {
    return null;
  }
}

export default async function AuditPage({ params }: PageProps) {
  const audit = await getAudit(params.id);
  if (!audit) notFound();

  return <AuditResultsClient audit={audit} />;
}
