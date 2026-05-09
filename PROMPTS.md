# Prompts

## Audit Summary Prompt

Used in `/app/api/summary/route.ts`. This is the only place AI is used in SpendScope — the audit math itself is deterministic rule-based logic.

### Final prompt (in production)

```
You are a no-nonsense financial analyst advising a startup on AI tool spend optimization.

The user's team has {teamSize} people. Primary use case: {useCase}.
Current total monthly AI spend: ${totalMonthlySpend}.
Identified monthly savings: ${totalMonthlySavings} (${totalAnnualSavings} annualized).

Per-tool findings:
{toolSummaries}
[Format: "- ToolName (Plan, N seat(s), $X/mo): Recommendation — saves $Y/mo"]

Write a concise, personalized 80-100 word audit summary. Tone: direct, financially literate, helpful — like a CFO who cares. Avoid corporate jargon. Do not use bullet points. Start with the most important finding. End with a specific action the reader should take first. Do not mention Credex. Plain text only.
```

### Why I wrote it this way

**"No-nonsense financial analyst"** — Sets a tone that avoids two failure modes: (1) overly enthusiastic AI-assistant voice ("Great news! You could save..."), and (2) vague hedging ("You might want to consider possibly..."). Finance persona produces direct, numeric language.

**Explicit word count (80-100 words)** — Without this, the model tends to write either 3 sentences or 6 paragraphs. 80-100 words fits comfortably in the card UI without overflow on mobile.

**"Start with the most important finding"** — The model has the per-tool data but needs guidance on narrative structure. Without this, it sometimes buries the highest-savings recommendation mid-paragraph.

**"Do not mention Credex"** — The summary should feel objective. Credex promotion lives in its own dedicated CTA block that is clearly labeled. Mixing the two in the AI summary would undermine trust.

**"Plain text only"** — Early iterations occasionally returned markdown bold text (`**this**`) which rendered as raw asterisks in the results card. Explicit instruction prevents this.

### What I tried that didn't work

**Attempt 1 — System prompt approach:**
```
System: You are a financial analyst...
User: Summarize this audit: {data}
```
The model treated this as a more formal analysis request and consistently wrote 200+ words. The word count constraint in the user message was more effective than system prompt framing.

**Attempt 2 — Bullet points:**
```
...Write a 3-bullet summary with: (1) biggest saving, (2) quick action, (3) annual impact.
```
The bullets were clean but felt mechanical. The free-form paragraph reads more like expert advice and is more likely to be shared.

**Attempt 3 — Including company name in prompt:**
```
The team at {companyName}...
```
Removed this. Company name is not always provided (it's optional in lead capture), and personalizing to company name made the summary feel weirdly like a sales email.

### Fallback behavior

If the Anthropic API returns any error (429, 500, network timeout), the `/api/summary` route falls back to a deterministic templated summary:

- **If optimal** (savings < $10): "Your team of N is spending $X/month on AI tools and you're already well-optimized..."
- **Otherwise**: "Your team's AI stack has an estimated $X/month in savings available... The biggest opportunity is ToolName: Recommendation saves $Y/month. Start there."

The fallback is tested and runs without any API call. The UI shows the same card — there's no visible indicator to the user that it fell back (the fallback text is high quality and accurate).
