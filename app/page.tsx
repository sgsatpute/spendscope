'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToolId, UseCase, ToolEntry, TOOL_NAMES, PLAN_OPTIONS } from '@/lib/types';

const STORAGE_KEY = 'spendscope_form_v1';

interface FormState {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

const DEFAULT_FORM: FormState = {
  tools: [],
  teamSize: 5,
  useCase: 'mixed',
};

const TOOL_IDS: ToolId[] = [
  'cursor', 'github_copilot', 'claude', 'chatgpt',
  'anthropic_api', 'openai_api', 'gemini', 'windsurf',
];

const USE_CASES: { value: UseCase; label: string; emoji: string }[] = [
  { value: 'coding', label: 'Coding / Engineering', emoji: '⌨️' },
  { value: 'writing', label: 'Writing / Content', emoji: '✍️' },
  { value: 'data', label: 'Data / Analytics', emoji: '📊' },
  { value: 'research', label: 'Research', emoji: '🔍' },
  { value: 'mixed', label: 'Mixed / General', emoji: '🔀' },
];

export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [selectedTools, setSelectedTools] = useState<Set<ToolId>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Persist form state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm(parsed.form || DEFAULT_FORM);
        setSelectedTools(new Set(parsed.selectedTools || []));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, selectedTools: [...selectedTools] }));
  }, [form, selectedTools]);

  function toggleTool(toolId: ToolId) {
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
        setForm((f) => ({ ...f, tools: f.tools.filter((t) => t.toolId !== toolId) }));
      } else {
        next.add(toolId);
        setForm((f) => ({
          ...f,
          tools: [
            ...f.tools,
            { toolId, plan: PLAN_OPTIONS[toolId][1] || PLAN_OPTIONS[toolId][0], monthlySpend: 0, seats: 1 },
          ],
        }));
      }
      return next;
    });
  }

  function updateTool(toolId: ToolId, field: keyof ToolEntry, value: string | number) {
    setForm((f) => ({
      ...f,
      tools: f.tools.map((t) => (t.toolId === toolId ? { ...t, [field]: value } : t)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedTools.size === 0) {
      setError('Please select at least one AI tool.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/audit/${data.id}`);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const totalMonthly = form.tools.reduce((s, t) => s + (Number(t.monthlySpend) || 0), 0);

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-paper)' }}>
      {/* Nav */}
      <nav className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-paper)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>
            Spend<span style={{ color: 'var(--color-accent)' }}>Scope</span>
          </span>
          <span className="text-sm" style={{ color: 'var(--color-muted)' }}>by Credex</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center stagger">
        <div
          className="inline-block text-xs font-mono px-3 py-1 rounded-full mb-6 uppercase tracking-widest"
          style={{ background: '#FF4D1C22', color: 'var(--color-accent)' }}
        >
          Free AI Spend Audit
        </div>
        <h1 className="text-5xl md:text-6xl mb-4" style={{ fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
          You're probably<br />
          <em style={{ color: 'var(--color-accent)' }}>overpaying</em> for AI.
        </h1>
        <p className="text-lg mb-2" style={{ color: 'var(--color-muted)' }}>
          Most startups have no idea. This tool audits your stack in 2 minutes —
          free, no login required.
        </p>
        <p className="text-sm" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>
          Pricing benchmarked against official vendor pages. Updated weekly.
        </p>
      </section>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 pb-24">
        {/* Step 1: Team context */}
        <section className="mb-10">
          <h2 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            1. Tell us about your team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium block mb-2" style={{ color: 'var(--color-muted)' }}>
                Team size (total headcount)
              </span>
              <input
                type="number"
                min={1}
                max={10000}
                value={form.teamSize}
                onChange={(e) => setForm((f) => ({ ...f, teamSize: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  focusRingColor: 'var(--color-accent)',
                }}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium block mb-2" style={{ color: 'var(--color-muted)' }}>
                Primary AI use case
              </span>
              <select
                value={form.useCase}
                onChange={(e) => setForm((f) => ({ ...f, useCase: e.target.value as UseCase }))}
                className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                {USE_CASES.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.emoji} {u.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {/* Step 2: Tool selection */}
        <section className="mb-10">
          <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            2. Which AI tools does your team pay for?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            Select all that apply. We'll audit each one.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TOOL_IDS.map((id) => {
              const active = selectedTools.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleTool(id)}
                  className="p-4 rounded-xl border text-left transition-all text-sm font-medium"
                  style={{
                    background: active ? 'var(--color-ink)' : 'var(--color-surface)',
                    borderColor: active ? 'var(--color-ink)' : 'var(--color-border)',
                    color: active ? '#fff' : 'var(--color-ink)',
                    transform: active ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {TOOL_NAMES[id]}
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3: Per-tool details */}
        {selectedTools.size > 0 && (
          <section className="mb-10 stagger">
            <h2 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              3. Fill in the details
            </h2>
            <div className="space-y-4">
              {form.tools.map((tool) => (
                <div
                  key={tool.toolId}
                  className="p-5 rounded-2xl border"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold">{TOOL_NAMES[tool.toolId]}</span>
                    <button
                      type="button"
                      onClick={() => toggleTool(tool.toolId)}
                      className="text-xs px-2 py-1 rounded"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="block">
                      <span className="text-xs mb-1 block" style={{ color: 'var(--color-muted)' }}>Plan</span>
                      <select
                        value={tool.plan}
                        onChange={(e) => updateTool(tool.toolId, 'plan', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ background: 'var(--color-paper)', borderColor: 'var(--color-border)' }}
                      >
                        {PLAN_OPTIONS[tool.toolId].map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs mb-1 block" style={{ color: 'var(--color-muted)' }}>Monthly spend ($)</span>
                      <input
                        type="number"
                        min={0}
                        value={tool.monthlySpend || ''}
                        placeholder="0"
                        onChange={(e) => updateTool(tool.toolId, 'monthlySpend', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ background: 'var(--color-paper)', borderColor: 'var(--color-border)' }}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs mb-1 block" style={{ color: 'var(--color-muted)' }}>Seats / users</span>
                      <input
                        type="number"
                        min={1}
                        value={tool.seats || ''}
                        placeholder="1"
                        onChange={(e) => updateTool(tool.toolId, 'seats', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ background: 'var(--color-paper)', borderColor: 'var(--color-border)' }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Summary + submit */}
        {selectedTools.size > 0 && (
          <section className="stagger">
            <div
              className="flex items-center justify-between p-4 rounded-xl mb-6"
              style={{ background: 'var(--color-ink)', color: '#fff' }}
            >
              <span className="font-display text-lg">Total monthly AI spend</span>
              <span className="font-display text-2xl">${totalMonthly.toLocaleString()}</span>
            </div>

            {error && (
              <p className="text-sm mb-4 text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all"
              style={{
                background: loading ? 'var(--color-muted)' : 'var(--color-accent)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Running audit…' : 'Run my free audit →'}
            </button>
            <p className="text-center text-xs mt-3" style={{ color: 'var(--color-muted)' }}>
              No email required. Results are instant.
            </p>
          </section>
        )}

        {selectedTools.size === 0 && (
          <div
            className="text-center py-12 rounded-2xl border-2 border-dashed"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p style={{ color: 'var(--color-muted)' }}>
              Select at least one tool above to continue
            </p>
          </div>
        )}
      </form>

      {/* Social proof */}
      <section
        className="border-t py-8"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap gap-6 justify-center text-sm" style={{ color: 'var(--color-muted)' }}>
          <span>✓ No login required</span>
          <span>✓ Pricing data updated weekly</span>
          <span>✓ Used by 500+ founders</span>
          <span>✓ Built by Credex</span>
        </div>
      </section>
    </main>
  );
}
