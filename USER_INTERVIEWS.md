# User Interviews

Three conversations conducted during the week of May 1–5, 2025. Each was ~12–15 minutes. Conducted via Zoom or voice call. Notes taken in real time.

---

## Interview 1 — R.M., CTO, 22-person B2B SaaS, Series A

**Background**: R. runs engineering for a 22-person company. 8 developers. Mix of frontend and backend. Budget owner for engineering tools.

**Key quotes**:

> "We pay for Copilot Business for the whole eng team, and at least 3 of those guys are also paying for Cursor out of pocket and expensing it. So I'm double-paying without realizing it."

> "I don't look at the Cursor or Copilot bills separately. They all just show up in the consolidated card statement my ops person sends me monthly."

> "If I could see 'you're paying $600/month across these 4 tools and there's $200 in overlap,' I'd act on that in about 10 minutes."

**Most surprising thing**: He didn't know what plan each developer was on. He assumed everyone on his team was on the same Copilot plan. Two developers had upgraded to Enterprise on their own and were expensing it — $39/user he didn't know he was paying for.

**What it changed about my design**: I added the "seats" field to the per-tool input. Initially I was going to calculate seats automatically from team size, but this interview made clear that seat count per tool is often *less than* total headcount — and that's exactly where the waste lives. Also added "monthly spend" as a required field rather than calculating from plan × seats, because actual bills often differ from list price (annual discounts, grandfathered plans, etc.).

---

## Interview 2 — K.A., Solo founder / indie hacker, bootstrapped, 1 person

**Background**: K. runs a small SaaS (MRR ~$4k) solo. Uses AI tools heavily for writing and coding. Follows indie hacker community closely.

**Key quotes**:

> "I'm on Claude Pro and ChatGPT Plus. That's $40/month. I know that's probably redundant but I can't figure out which one I'd drop."

> "I would 100% share this tool if it told me I was already spending well. Like, that's actually validation I want. Not just if it found waste."

> "The shareable link thing is huge. I'd tweet 'hey my AI stack is actually optimal, here's the audit' and that would get engagement. People want to show they're not wasting money."

**Most surprising thing**: The explicit desire to share a *positive* result, not just a negative one. I had assumed the viral sharing mechanic was "look how much waste I found." But for the indie hacker segment, "look how well I'm running my stack" is equally shareable — maybe more so, because it's bragworthy.

**What it changed about my design**: Completely rewrote the "already optimal" state on the results page. Original copy was: "No significant savings found. You're spending efficiently." New copy is: "You're spending well." with a distinct visual treatment — same dark hero card, but with positive framing and a "notify me when new optimizations apply to your stack" CTA instead of the Credex consult. Also added the Share link button prominently on the optimal results page, not just the high-savings one.

---

## Interview 3 — D.L., Engineering Manager, 60-person fintech, Series B

**Background**: D. manages a 12-person platform team. Reports to a VP Eng. Has a quarterly budget review with the CFO.

**Key quotes**:

> "The CFO asked me last quarter to itemize our AI tool spend by department. It took me three hours to pull that together from three different card statements."

> "I'd use something like this before a budget review. Give me a one-pager I can show the CFO that says 'here's what we pay, here's what's justified, here's what I'm cutting.'"

> "The problem isn't that I'm making bad decisions. It's that I have no benchmark. Am I paying a lot for Cursor? I genuinely don't know what the average team our size pays."

**Most surprising thing**: The strongest use case for D. wasn't the audit itself — it was the *artifact* it produced. He wanted something he could bring into a meeting, not just read on a screen. He mentioned "PDF export" before I said anything about it.

**What it changed about my design**: This confirmed that PDF export should be the first post-MVP feature. Also informed the METRICS.md — the right metric isn't "audits completed," it's "audits where the user captures the report (email or PDF)," because that indicates they found enough value to want to keep it. Also added a "share link" button near the top of the results page (I had it only at the bottom originally) — D. described wanting to forward a link to his CFO directly.
