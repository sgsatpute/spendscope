# Metrics

## North Star Metric

**Audits with report captured** (email submitted or PDF exported after completing an audit)

This is the metric, not "audits completed."

**Why**: A completed audit with no email capture is a visitor who got value and left. That's fine for goodwill, but it doesn't grow the business. An email capture means the user found the audit valuable enough to want to keep it — they're the warm lead Credex needs. "Report captured" is the action that separates browsers from real prospects.

"Audits completed" is a leading indicator but gameable (someone could complete 10 audits with random data). "Credex consultations booked" is a lagging indicator that's too downstream to optimize week-to-week. "Report captured" sits at the right level — meaningful signal, high enough volume to measure early.

---

## 3 Input Metrics That Drive the North Star

### 1. Audit completion rate
**Definition**: (Audits completed) / (Users who select at least one tool)
**Why it matters**: This is the form UX metric. If users drop off before hitting "Run audit," the form is too long, too confusing, or too low-trust. Target: >65%. Below 50% triggers a form redesign.

### 2. Email capture rate (conditional)
**Definition**: (Emails captured) / (Audits completed where savings > $0)
**Why it matters**: This measures how compelling the results page is. If users see a $500/mo savings finding and *don't* enter their email, either they don't trust the number or the CTA is weak. Target: >20%. This was ~15% in the user interview prototypes — needs improvement.

### 3. High-savings audit rate
**Definition**: (Audits showing >$500/mo savings) / (Total audits)
**Why it matters**: Not all audits are created equal from Credex's perspective. A user finding $50/mo in savings is a nice-to-have. A user finding $2k/mo in savings is a likely Credex customer. This ratio tells us if SpendScope is attracting the right user (larger teams, heavier spend) or the wrong one (solo devs, free plan users).

---

## What I'd Instrument First

1. **Funnel events** (in order of priority):
   - `tool_selected` (which tools, how many)
   - `audit_submitted`
   - `audit_results_viewed` (with savings amount bucketed: $0, $1–100, $100–500, $500+)
   - `email_captured`
   - `credex_cta_clicked`
   - `share_link_copied`

2. **Form drop-off point**: Which field causes the most abandonment? Add a `form_abandoned` event that fires on page exit with the last-focused field.

3. **Tool distribution**: Which tools are most commonly entered? This tells Credex which tools have the most market saturation and where pricing intelligence is most valuable.

**Tooling**: PostHog (open source, free self-hosted tier, product analytics built for B2B tools).

---

## What Number Triggers a Pivot Decision

**Email capture rate < 10% for 2 consecutive weeks** after 200+ completed audits.

This would mean the tool is generating interest (people are completing audits) but not converting (the results are either unbelievable, uncompelling, or the ask is too early). At that point, rethink one of:
- The email ask (position, timing, copy)
- The results page (are savings numbers credible? too low? too high?)
- The target user (are we attracting people with no spend, making every audit show $0 savings?)

**Credex consultations booked: 0 for 3 weeks** after 50+ email captures.

This would mean the leads are cold — either the wrong audience is converting, the email follow-up is weak, or the Credex offer isn't landing. The fix is either tightening the audience filter (only surface Credex CTA above $500/mo, currently $500 — consider raising to $1k) or improving the consultation booking flow.

---

## Anti-metrics (things that look good but aren't)

- **Total page views**: Irrelevant without audit completions. A viral HN post that drives 10k views and 50 audits is worse than a targeted DM campaign that drives 200 views and 80 audits.
- **DAU / MAU**: This is a tool people use once a quarter during budget reviews, not daily. DAU is meaningless. Better: "Return audits" (same email submits a second audit more than 90 days later) — that's the renewal metric.
- **Twitter impressions from shared audits**: Vanity unless it converts to audits completed. Track `source=twitter` UTM on incoming audit traffic, not impressions on the tweet itself.
