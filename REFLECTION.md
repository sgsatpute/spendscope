# Reflection

## 1. The hardest bug I hit this week

The trickiest bug was a silent data corruption in the audit engine where `savingsMonthly` was coming back negative for some tool configurations, which then inflated `totalMonthlySavings` in the wrong direction.

My first hypothesis was that the pricing lookup was returning `undefined` for edge-case plan names, causing arithmetic with `NaN`. I added `console.log` statements around every `getPlanPrice()` call and ran the test suite — all returned numbers, not NaN. Hypothesis wrong.

Second hypothesis: the issue was in the Claude Max recommendation, which does a partial savings calculation (`savings * 0.5` for the subset of users who can downgrade). I was subtracting current spend from a projected spend incorrectly. Adding a `Math.max(0, ...)` wrapper around `savingsMonthly` in the ToolAuditResult constructor caught it — the negative savings went to zero.

What actually fixed it cleanly: I rewrote the savings calculation to always be `Math.max(0, currentSpend - recommendedSpend)` rather than inferring direction from recommendation type. Defensive math. The test for `totalMonthlySavings` in the aggregation test then caught the regression and confirmed the fix.

---

## 2. A decision I reversed mid-week

I originally planned to use the Anthropic API for the entire audit — ask Claude to analyze the tool stack and generate recommendations, not just the summary.

I reversed this on Day 2. My reasoning going in: "LLMs are good at reasoning about complex tradeoffs." What I found when I started prompting: LLM-generated audit recommendations were inconsistent across runs (same input, different savings numbers), hard to test, and occasionally flat-out wrong (e.g., recommending a Cursor downgrade for an 8-person team when the math clearly favored Pro). Worse, I had no way to defend the numbers to a finance-literate reader — the brief's exact requirement.

The rule-based engine solved all of this. Each recommendation is a function with explicit inputs and outputs. I can write unit tests that assert specific savings amounts. The logic is readable and auditable. A CFO can trace every number to a specific pricing comparison.

The AI is now used only for the narrative summary — where variability is a feature, not a bug, and where there's no "wrong answer" to unit test against.

---

## 3. What I'd build in week 2

Three things, in priority order:

**PDF export.** This was in the bonus list but I didn't have time to do it properly. The audit results page is the thing that gets shared with a CFO before an annual software review. A clean PDF export (react-pdf or headless Chrome via Playwright) would dramatically increase how often that happens. This is a high-leverage distribution mechanism.

**Benchmark mode.** "Your AI spend per developer is $X — companies your size average $Y." This requires collecting aggregate data from SpendScope audits (anonymized) and building a percentile display. It makes the result page much more shareable because it gives users bragging rights or FOMO, depending on where they land.

**Embeddable widget.** A `<script>` tag that bloggers and newsletter writers could drop into their posts. "How much is your team spending on AI? Check right here." Each embed is a distribution channel. The widget makes a standard form → result API call and displays inline. This is the viral loop that doesn't require someone to click a link.

---

## 4. How I used AI tools

I used Claude (claude.ai, Sonnet 3.7) throughout the week for:

- **Boilerplate scaffolding**: Setting up the Supabase client, Resend integration, Next.js metadata types. These are things with a "right answer" that I'd otherwise Google and copy-paste anyway.
- **Checking my logic**: Pasted audit engine functions and asked "does this savings calculation look right?" — useful as a rubber duck.
- **Email HTML**: The transactional email template. Getting inline CSS right for email clients is tedious; Claude got me 90% of the way in one shot.
- **Copy editing**: The landing page microcopy, FAQ answers, GTM.md prose.

What I didn't trust AI with:

- **Audit engine logic**: Every recommendation and savings number came from me reading the pricing pages myself and writing the logic. The stakes for being wrong here are high (submitting incorrect numbers to a company evaluating my work), and I'd seen AI hallucinate pricing figures confidently.
- **User interview questions**: The conversation flow and follow-up questions needed to come from me paying attention to the actual person, not a script.

One specific time AI was wrong: I asked Claude to help me write the Windsurf pricing lookup. It confidently returned `pricePerUserPerMonth: 12` for the Pro tier. I knew this was off — I'd seen $15 on the Windsurf pricing page that morning. Went back and verified: $15/user. The AI was working from stale training data. This is exactly the pattern the assignment is testing for: knowing when to verify rather than trust.

---

## 5. Self-rating

| Dimension | Rating | Reason |
|---|---|---|
| Discipline | 7/10 | Committed work each day across the full 7 days. Day 3 ran long and I had to compress Day 6 slightly. But no cramming. |
| Code quality | 8/10 | Types are well-defined, audit logic is clean and testable, components are reasonably composed. I'd refactor the API routes into cleaner service layers given more time. |
| Design sense | 7/10 | The results page hits the "screenshot-worthy" bar. The form is clean but not surprising. I made a deliberate aesthetic choice (editorial/paper) rather than defaulting to dark SaaS. |
| Problem-solving | 8/10 | Caught the AI-for-audit decision early and reversed it before it cost me. The pricing verification habit saved at least one data error. Good debugging instincts on the savings bug. |
| Entrepreneurial thinking | 7/10 | Did the user interviews, ran the economics math, wrote a specific GTM plan. I think my ECONOMICS.md is honest rather than optimistic. Not sure I fully nailed the "unfair distribution channel" — it's a real answer but I don't have evidence it's actually unfair. |
