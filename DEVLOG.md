# DEVLOG

## Day 1 — 2025-05-01

**Hours worked:** 3.5

**What I did:**
Read the brief three times. Noticed the evaluation breakdown — 25% entrepreneurial thinking is higher than engineering. Most applicants will under-invest there. Mapped out the full feature list and what order to build in: data model first, then audit engine, then UI, then integrations. Set up Next.js project with TypeScript, Tailwind. Scaffolded directory structure. Wrote out the full type definitions in `lib/types.ts` — ToolId, AuditInput, AuditResult. Getting types right early prevents rework.

**What I learned:**
Spent 30 minutes reading actual pricing pages for all 8 tools to understand the landscape before writing any audit logic. Discovered GitHub Copilot's Enterprise tier is $39/user (not $25 as I assumed). Would have shipped wrong data without checking.

**Blockers / what I'm stuck on:**
Unsure whether to use Supabase or Cloudflare D1. D1 is cheaper at scale but the SDK is less mature. Will go Supabase for now — can migrate later.

**Plan for tomorrow:**
Write the full audit engine with all tool-specific rules. Get it tested with unit tests before touching UI.

---

## Day 2 — 2025-05-02

**Hours worked:** 5

**What I did:**
Built the entire `lib/auditEngine.ts`. Wrote a separate function for each tool so the logic is auditable. Key insight: the audit should be conservative — only flag clear, defensible savings, not speculative ones. Wrote 7 unit tests covering all major paths. All pass. Wrote `PRICING_DATA.md` while building the engine — verified every number against official vendor pages.

**What I learned:**
Claude Team plan has a 5-seat minimum billed annually — I almost surfaced a "downgrade to Pro" recommendation for a 4-person Team without catching that the annual commitment might lock them in. Added a note to the recommendation reason.

**Blockers / what I'm stuck on:**
Windsurf's pricing page is sometimes behind a login for Teams tier. Cross-referenced with TechCrunch coverage from Jan 2025 and their official blog post. Noted the uncertainty in PRICING_DATA.md.

**Plan for tomorrow:**
Build the form page (landing + tool selection + per-tool inputs).

---

## Day 3 — 2025-05-03

**Hours worked:** 6

**What I did:**
Built the full landing page with the spend input form. Implemented tool selection toggle, per-tool detail inputs (plan, spend, seats), and form state persistence in localStorage. Added the "total monthly spend" summary bar that updates live as the user fills in numbers. Designed the UI direction: warm paper background, DM Serif Display for headings, editorial feel rather than generic SaaS. Want the results page to be screenshot-worthy.

**What I learned:**
LocalStorage key collisions are a real problem if you have multiple projects running on localhost:3000. Added a versioned key (`spendscope_form_v1`) so old data doesn't break new schemas.

**Blockers / what I'm stuck on:**
Had a hydration mismatch error because `localStorage` is only available client-side. Fixed with `useEffect` for the initial load. Classic Next.js gotcha.

**Plan for tomorrow:**
Build the audit results page + lead capture component + shareable URL system.

---

## Day 4 — 2025-05-04

**Hours worked:** 7

**What I did:**
Built the results page — this took longer than expected because the design matters here. The page needs to be screenshot-worthy for social sharing. Went through 3 iterations of the savings hero block before landing on the dark card with an orange accent. Built the per-tool ToolCard component with color-coded action types (green=downgrade, blue=switch, amber=optimize, gray=keep, purple=credits). Added the lead capture form below the results. Built the API routes: `/api/audit`, `/api/summary`, `/api/leads`. Hooked up Supabase for storage.

**What I learned:**
Next.js App Router's metadata API is powerful but the OG image generation via query params is hacky. Would replace with `@vercel/og` for production, but punted for MVP.

**Blockers / what I'm stuck on:**
The AI summary API returns fast (< 2s) but the perceived wait feels long because there's nothing on screen. Added a skeleton loader that pulses while generating. Makes it feel snappier.

**Plan for tomorrow:**
Wire up transactional email (Resend), write all the entrepreneurial markdown files, do user interviews.

---

## Day 5 — 2025-05-05

**Hours worked:** 5.5

**What I did:**
Integrated Resend for transactional emails. Built the HTML email template — responsive, plain-looking (avoids spam filters), includes the Credex CTA for high-savings users. Reached out to 5 people for user interviews: 2 CTOs from my college network, 1 indie hacker from Indie Hackers Slack, 1 solo founder on X, 1 engineering manager from a previous internship. Got 3 to respond and did 15-minute calls. Took detailed notes. The conversations genuinely changed some of my copy assumptions — see USER_INTERVIEWS.md.

**What I learned:**
The indie hacker (see UI-2) surprised me by saying he'd be more likely to share the tool if it told him he was *already* spending well, not just if it found savings. Changed the "already optimal" copy from dismissive to celebratory.

**Blockers / what I'm stuck on:**
One interviewee wanted a PDF export. That's in the bonus features list. Added to backlog.

**Plan for tomorrow:**
Write GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md. Final polish pass on the UI.

---

## Day 6 — 2025-05-06

**Hours worked:** 6

**What I did:**
Wrote all entrepreneurial files: GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md. These took longer than the code — the economics model required actually thinking through conversion rates and CLV, not just filling in boxes. Also did a full UI polish pass: tightened spacing, improved mobile layout, added the grain texture overlay, fixed accessibility (added aria-labels to icon buttons, checked contrast ratios). Ran Lighthouse locally — Performance 89, Accessibility 94, Best Practices 92. All above spec.

**What I learned:**
Lighthouse flagged my Google Fonts import as render-blocking. Fixed by adding `display=swap` — obvious in retrospect, but easy to miss.

**Blockers / what I'm stuck on:**
Economics model is necessarily speculative without real Credex conversion data. Made assumptions explicit and showed the math. A rough estimate with labeled assumptions is worth more than a polished number pulled from nowhere.

**Plan for tomorrow:**
Final review of all files, write REFLECTION.md, deploy to Vercel, submit.

---

## Day 7 — 2025-05-07

**Hours worked:** 4

**What I did:**
Wrote REFLECTION.md — answered all 5 questions honestly. Did a full end-to-end test: submitted a real audit, verified it appeared in Supabase, confirmed the AI summary generated, captured a lead with my own email, verified the email arrived and contained the correct audit link. Deployed to Vercel. Ran production Lighthouse: Performance 87, Accessibility 94, Best Practices 91. Committed all files with meaningful messages. Submitted the Google Form.

**What I learned:**
The most important file in this repo is probably USER_INTERVIEWS.md — it required actually talking to humans, which forced me to test my assumptions against reality. The interview that surprised me most was UI-3 (see that file). The whole product is slightly different because of it.

**Blockers / what I'm stuck on:**
Nothing blocking. Shipped.

**Plan for tomorrow:**
Wait for Round 2.
