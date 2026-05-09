# SpendScope — Free AI Tool Spend Audit

**SpendScope helps startup founders and engineering managers find out in 2 minutes where they're overspending on AI tools.** Free, no login, instant results. Built by [Credex](https://credex.rocks).

🔗 **Live:** https://spendscope.app

---

## Screenshots

> _See `docs/screenshots/` or [watch a 30-second demo](https://loom.com/TODO)_

![Landing page showing hero with "You're probably overpaying for AI"](docs/screenshots/landing.png)
![Audit form with tool selection and spend inputs](docs/screenshots/form.png)
![Results page showing $1,200/mo savings found](docs/screenshots/results.png)

---

## Quick Start

### Prerequisites
- Node.js 20+
- A Supabase project (free tier works)
- Anthropic API key (free tier works)
- Resend account (free tier: 3k emails/mo)

### Install & run locally

```bash
git clone https://github.com/YOUR_USERNAME/spendscope
cd spendscope
npm install

# Copy and fill in env vars
cp .env.example .env.local
# Edit .env.local with your keys

npm run dev
# → http://localhost:3000
```

### Run tests

```bash
npm run test
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
# Set env vars in Vercel dashboard (Settings → Environment Variables)
```

### Supabase schema

Run this SQL in your Supabase SQL editor before first use:

```sql
CREATE TABLE audits (
  id TEXT PRIMARY KEY,
  input JSONB NOT NULL,
  results JSONB NOT NULL,
  total_monthly_spend NUMERIC,
  total_monthly_savings NUMERIC,
  total_annual_savings NUMERIC,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  team_size INTEGER,
  audit_id TEXT REFERENCES audits(id),
  total_monthly_savings NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Decisions

1. **Next.js App Router over Vite+React SPA** — Server-side rendering for audit result pages means each shareable URL gets proper OG metadata. A pure SPA would need a separate OG generation service.

2. **Rule-based audit engine, not AI** — The audit math is deterministic financial logic. Using LLM for recommendations would introduce hallucination risk and latency with no benefit. AI is used only for the narrative summary, where creativity and language are the actual value.

3. **Supabase over Planetscale/Neon** — Free tier is generous (500MB, unlimited API), the SDK works cleanly with Next.js, and the dashboard lets non-technical Credex team members query leads without touching code.

4. **Resend over SendGrid/Mailgun** — Resend's DX is far cleaner, the free tier (3k/mo) is sufficient for an MVP, and React Email templates mean the email can be styled properly.

5. **localStorage for form persistence** — IndexedDB is overkill for this data size. localStorage is synchronous, well-understood, and works without a service worker. The only downside is cross-device non-sync, which doesn't matter for a single-session tool.
