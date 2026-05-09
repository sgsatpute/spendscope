# Tests

All tests live in `tests/auditEngine.test.ts`. They test the audit engine exclusively, which is the core deterministic logic of the product.

## How to run

```bash
npm run test
# or with watch mode:
npm run test:watch
```

## Test list

| File | Test name | What it covers |
|------|-----------|----------------|
| `tests/auditEngine.test.ts` | Cursor: recommends downgrade from Business to Pro for <=3 seats | Confirms the Business→Pro downgrade triggers correctly and calculates $60 savings for 3 seats ($40−$20 × 3) |
| `tests/auditEngine.test.ts` | Cursor: keeps Cursor Pro for appropriate team | Confirms no false positives — Pro plan for a normal team stays as-is |
| `tests/auditEngine.test.ts` | GitHub Copilot: recommends downgrade from Enterprise to Business for <20 seats | Confirms $200 savings for 10 Enterprise seats ($39−$19 × 10) |
| `tests/auditEngine.test.ts` | Claude: recommends downgrade from Team to Pro for <5 seats | Confirms Team→Pro downgrade triggers below the 5-seat minimum and calculates $40 savings |
| `tests/auditEngine.test.ts` | Claude: keeps Claude Pro for single user | Confirms no recommendation for correct single-user Pro plan |
| `tests/auditEngine.test.ts` | ChatGPT: recommends downgrade from Team to Plus for <5 seats | Confirms $30 savings for 3 Team seats ($30−$20 × 3) |
| `tests/auditEngine.test.ts` | API: recommends credits for Anthropic API spend >$500/mo | Confirms high-spend API users get the Credex credits recommendation |
| `tests/auditEngine.test.ts` | API: recommends optimization for mid-tier API spend $200–500 | Confirms medium-spend API users get optimization suggestions |
| `tests/auditEngine.test.ts` | API: keeps low API spend without recommendation | Confirms no false positives for small API bills |
| `tests/auditEngine.test.ts` | Total aggregation: correctly sums savings across tools | Integration test — confirms Cursor ($60) + Copilot ($200) = $260/mo, $3,120/yr |
| `tests/auditEngine.test.ts` | Total aggregation: marks audit as optimal when savings < $10 | Confirms `isOptimal` flag is set correctly |
| `tests/auditEngine.test.ts` | Windsurf: recommends downgrade from Teams to Pro for <=3 seats | Confirms $60 savings for 3 Teams seats ($35−$15 × 3) |

## Notes

- All tests are pure unit tests — no network calls, no database, no API keys required.
- The audit engine is a pure function (`runAudit(input) → AuditResult`) with no side effects, making it straightforward to test.
- Each pricing assertion is deterministic: the expected savings are calculated manually from the pricing data in `lib/pricingData.ts` and hardcoded as expectations. If pricing data changes, tests will fail and alert you to update the audit logic too.
