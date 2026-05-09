'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuditResult, ToolAuditResult } from '@/lib/types';
import { ACTION_LABELS, ACTION_COLORS, formatCurrencyFull } from '@/lib/utils';

const HIGH_SAVINGS_THRESHOLD = 500;
const LOW_SAVINGS_THRESHOLD = 100;

interface Props {
  audit: AuditResult;
}

export default function AuditResultsClient({ audit }: Props) {
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHighSavings = audit.totalMonthlySavings >= HIGH_SAVINGS_THRESHOLD;
  const isAlreadyGood = audit.totalMonthlySavings < LOW_SAVINGS_THRESHOLD;

  // Fetch AI summary
  useEffect(() => {
    fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(audit),
    })
      .then((r) => r.json())
      .then((d) => setSummary(d.summary || ''))
      .catch(() => setSummary(''))
      .finally(() => setSummaryLoading(false));
  }, [audit]);

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLeadLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          companyName: company,
          role,
          auditId: audit.id,
          totalMonthlySavings: audit.totalMonthlySavings,
        }),
      });
      setLeadSubmitted(true);
    } catch {}
    setLeadLoading(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-paper)' }}>
      {/* Nav */}
      <nav className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-paper)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-display font-bold" style={{ color: 'var(--color-ink)', textDecoration: 'none' }}>
            Spend<span style={{ color: 'var(--color-accent)' }}>Scope</span>
          </Link>
          <div className="flex gap-3">
            <button
              onClick={copyLink}
              className="text-sm px-4 py-2 rounded-lg border transition-all"
              style={{ borderColor: 'var(--color-border)', background: copied ? 'var(--color-ink)' : 'transparent', color: copied ? '#fff' : 'var(--color-ink)' }}
            >
              {copied ? '✓ Copied!' : 'Share link'}
            </button>
            <Link
              href="/"
              className="text-sm px-4 py-2 rounded-lg text-white"
              style={{ background: 'var(--color-accent)', textDecoration: 'none' }}
            >
              New audit
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero savings block */}
        <div className="stagger">
          <div
            className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden"
            style={{ background: 'var(--color-ink)' }}
          >
            {/* Background texture */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 80% 20%, #FF4D1C 0%, transparent 50%)',
              }}
            />
            <div className="relative">
              <p className="text-sm uppercase tracking-widest opacity-60 mb-2 font-mono">
                AI Spend Audit · {new Date(audit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              {isAlreadyGood ? (
                <>
                  <h1 className="text-4xl md:text-5xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    You're spending well.
                  </h1>
                  <p className="opacity-70 text-lg">
                    ${audit.totalMonthlySpend.toLocaleString()}/mo across {audit.input.tools.length} tool{audit.input.tools.length !== 1 ? 's' : ''} — no major waste detected.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    <span style={{ color: '#FF4D1C' }}>{formatCurrencyFull(audit.totalMonthlySavings)}</span> / month<br />
                    left on the table.
                  </h1>
                  <p className="text-xl opacity-80">
                    {formatCurrencyFull(audit.totalAnnualSavings)} per year · {audit.input.tools.length} tool{audit.input.tools.length !== 1 ? 's' : ''} audited
                  </p>
                </>
              )}
            </div>
          </div>

          {/* AI Summary */}
          <div
            className="rounded-2xl p-6 mb-8 border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                AI Analysis
              </span>
              {summaryLoading && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f3f4f6', color: 'var(--color-muted)' }}>
                  Generating…
                </span>
              )}
            </div>
            {summaryLoading ? (
              <div className="space-y-2">
                <div className="h-4 rounded animate-pulse" style={{ background: '#f3f4f6', width: '90%' }} />
                <div className="h-4 rounded animate-pulse" style={{ background: '#f3f4f6', width: '75%' }} />
                <div className="h-4 rounded animate-pulse" style={{ background: '#f3f4f6', width: '85%' }} />
              </div>
            ) : (
              <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink)' }}>{summary}</p>
            )}
          </div>
        </div>

        {/* Per-tool breakdown */}
        <section className="mb-10">
          <h2 className="text-2xl mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            Per-tool breakdown
          </h2>
          <div className="space-y-3 stagger">
            {audit.results.map((result) => (
              <ToolCard key={result.toolId} result={result} />
            ))}
          </div>
        </section>

        {/* Credex CTA for high savings */}
        {isHighSavings && (
          <section
            className="rounded-2xl p-8 mb-10 border-2"
            style={{ borderColor: 'var(--color-accent)', background: '#FFF5F2' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="text-3xl flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-accent)', color: '#fff', fontSize: '20px' }}
              >
                ⚡
              </div>
              <div>
                <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Capture even more of this with Credex
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
                  You've identified {formatCurrencyFull(audit.totalMonthlySavings)}/mo in plan optimizations.
                  Credex sources discounted AI infrastructure credits — Cursor, Claude, ChatGPT Enterprise —
                  from companies that over-purchased. Same product, typically 15–30% below retail.
                  At your spend level, it's worth a 20-minute conversation.
                </p>
                <a
                  href={`https://credex.rocks/consult?ref=spendscope&aid=${audit.id}&savings=${audit.totalMonthlySavings}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ background: 'var(--color-accent)', textDecoration: 'none' }}
                >
                  Book a free Credex consultation →
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Email capture */}
        <section
          className="rounded-2xl p-8 mb-10 border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {leadSubmitted ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-3">✓</div>
              <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Audit saved to your inbox
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                {isHighSavings
                  ? "We'll also follow up about how Credex can help you capture more of these savings."
                  : "We'll notify you when new optimizations apply to your stack."}
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                {isAlreadyGood
                  ? 'Get notified when new optimizations apply to your stack'
                  : 'Get this report in your inbox'}
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
                {isAlreadyGood
                  ? "Your current stack is well-optimized. We'll email you when pricing changes or better alternatives emerge for your tools."
                  : 'Your full audit breakdown + a permanent link. No spam, ever.'}
              </p>
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                {/* Honeypot */}
                <input type="text" name="__hp" className="hidden" tabIndex={-1} autoComplete="off" />
                <input
                  type="email"
                  placeholder="Work email *"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-base"
                  style={{ background: 'var(--color-paper)', borderColor: 'var(--color-border)' }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Company (optional)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="px-4 py-3 rounded-xl border text-base"
                    style={{ background: 'var(--color-paper)', borderColor: 'var(--color-border)' }}
                  />
                  <input
                    type="text"
                    placeholder="Your role (optional)"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="px-4 py-3 rounded-xl border text-base"
                    style={{ background: 'var(--color-paper)', borderColor: 'var(--color-border)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={leadLoading}
                  className="w-full py-3 rounded-xl text-white font-semibold"
                  style={{ background: 'var(--color-ink)', cursor: leadLoading ? 'not-allowed' : 'pointer' }}
                >
                  {leadLoading ? 'Sending…' : 'Send me the report →'}
                </button>
              </form>
            </>
          )}
        </section>

        {/* Share */}
        <section className="text-center mb-10">
          <p className="text-sm mb-3" style={{ color: 'var(--color-muted)' }}>
            Share this audit with your team or on social media
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={copyLink}
              className="px-5 py-2 rounded-xl border font-medium text-sm transition-all"
              style={{ borderColor: 'var(--color-border)', background: copied ? 'var(--color-ink)' : 'transparent', color: copied ? '#fff' : 'var(--color-ink)' }}
            >
              {copied ? '✓ Link copied!' : '🔗 Copy link'}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=Just audited our AI tool spend with %40spendscope — found %24${audit.totalMonthlySavings}%2Fmo in savings 💸&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl border font-medium text-sm"
              style={{ borderColor: 'var(--color-border)', textDecoration: 'none', color: 'var(--color-ink)' }}
            >
              Share on X
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs" style={{ color: 'var(--color-muted)' }}>
          SpendScope by <a href="https://credex.rocks" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Credex</a> ·
          Pricing data verified weekly ·{' '}
          <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Run a new audit</Link>
        </footer>
      </div>
    </main>
  );
}

function ToolCard({ result }: { result: ToolAuditResult }) {
  const actionColor = ACTION_COLORS[result.recommendation.action];
  const actionLabel = ACTION_LABELS[result.recommendation.action];
  const hasSavings = result.savingsMonthly > 0;

  return (
    <div
      className="rounded-2xl p-5 border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold">{result.toolName}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: `${actionColor}22`, color: actionColor }}
            >
              {actionLabel}
            </span>
          </div>
          <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
            {result.plan} · {result.seats} seat{result.seats !== 1 ? 's' : ''} · ${result.currentMonthlySpend.toLocaleString()}/mo
          </span>
        </div>
        {hasSavings && (
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-semibold" style={{ color: 'var(--color-success)' }}>
              −{formatCurrencyFull(result.savingsMonthly)}/mo
            </div>
            <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
              −{formatCurrencyFull(result.savingsAnnual)}/yr
            </div>
          </div>
        )}
      </div>
      <div
        className="rounded-xl p-3 text-sm"
        style={{ background: 'var(--color-paper)', color: 'var(--color-ink)' }}
      >
        <strong>{result.recommendation.description}</strong>
        <p className="mt-1" style={{ color: 'var(--color-muted)' }}>{result.recommendation.reason}</p>
      </div>
    </div>
  );
}
