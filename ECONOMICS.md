# Economics

## What a converted lead is worth to Credex

Credex sells discounted AI infrastructure credits at roughly 15–30% below retail. The margin comes from sourcing credits from companies that over-purchased or pivoted.

**Estimating contract value:**

A startup paying $1,000/month in AI tools (~$12k/year) that switches to Credex credits at 20% discount saves $2,400/year. Credex captures some of that discount as margin. Assuming Credex keeps 8–12% as gross margin, one converted customer at $1k/mo spend = ~$960–$1,440/year in GMV to Credex.

More realistic distribution:
- Small deal (<$500/mo AI spend): ~$500 GMV/year to Credex
- Mid deal ($500–2k/mo): ~$1,500 GMV/year
- Large deal ($2k+/mo): ~$3,000–8,000 GMV/year

**Weighted average assumed CLV: $1,500/year**, assuming a 2-year average retention = **$3,000 LTV per converted customer.**

---

## CAC at each GTM channel

| Channel | Est. conversion (audit→lead) | Lead→consult | Consult→purchase | CAC |
|---------|------------------------------|--------------|-------------------|-----|
| HN Show HN | 15% | 8% | 25% | ~$0 (time cost ~$50 equiv.) |
| DM outreach on X | 25% (targeted) | 10% | 25% | ~$0 (time cost ~$100 equiv.) |
| Slack communities | 12% | 7% | 20% | ~$0 |
| Newsletter feature | 10% | 5% | 20% | ~$200–500 if paid sponsorship |
| Organic SEO (long-term) | 8% | 4% | 20% | ~$0 (time cost amortized) |

**At zero paid budget**: CAC is effectively time cost only. If a founder spends 5 hours/week on GTM activities at an implicit hourly rate of $100, and gets 4 purchases per month = CAC of ~$500.

With $3,000 LTV, **CAC < $500 makes this profitable from month 1.**

---

## Conversion funnel math

Target funnel from SpendScope launch:

| Stage | Volume | Rate |
|-------|--------|------|
| Unique visitors | 1,000/mo | — |
| Audit completed | 300/mo | 30% |
| Email captured | 75/mo | 25% |
| Credex consultation booked (high-savings users only) | 9/mo | 12% of email captures |
| Credit purchase | 2–3/mo | 25–30% of consultations |

**Month 1 revenue estimate**: 2–3 new customers × $1,500 average first-year GMV × Credex margin (~10%) = **$300–450/month in Credex margin contribution.**

That's not the business case. The business case is compounding:

- SpendScope runs indefinitely at near-zero marginal cost
- Email list grows each month
- Customers renew annually → repeat GMV
- High-savings audits → larger initial contracts

---

## What would have to be true for $1M ARR in 18 months

$1M ARR = $83,333/month in revenue to Credex.

Assuming Credex gross margin on credits is ~10%, this requires **$833k/month in GMV** flowing through Credex from SpendScope-originated customers.

At an average contract of $1,500/year ($125/month), this requires **~6,667 active paying customers.**

To reach 6,667 customers via SpendScope in 18 months:

- Need ~27,000 email captures (25% conversion audit→email)
- Need ~108,000 completed audits
- Need ~360,000 unique visitors

That's 20,000 visitors/month ramping over 18 months.

**What would have to be true:**
1. SpendScope becomes a recognized free tool in the engineering manager community — not just a one-time viral hit but a recurring reference (SEO + word of mouth compound)
2. Credex has sales capacity to handle 50+ inbound consultations/month
3. The average GMV per customer is actually $1,500+/year — requires targeting mid-market ($500+/mo AI spenders) not just solo devs
4. Credex retains customers for 2+ years (currently unknowable but implied by 2x LTV assumption)

The $1M ARR scenario is achievable but requires SpendScope to become a genuine category-defining tool (think Pingdom for uptime, Hotjar for UX) — not just a one-time launch.

**More conservative base case (18 months)**: 500 active customers, $75k ARR contribution from SpendScope-originated customers. Still a meaningful ROI on a free tool that cost ~$0 to build and operate.

---

## Operating cost of SpendScope

| Item | Monthly cost |
|------|-------------|
| Vercel (Pro) | $20 |
| Supabase (Pro) | $25 |
| Resend (free tier up to 3k emails, then $20/mo) | $0–20 |
| Anthropic API (summaries ~200 tokens each, 300 audits/mo) | ~$0.50 |
| Domain | ~$1 (amortized) |
| **Total** | **~$47–67/month** |

Break-even: **1 Credex customer per month.** The economics are absurdly favorable.
