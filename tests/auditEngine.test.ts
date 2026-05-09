import { runAudit } from '../lib/auditEngine';
import { AuditInput } from '../lib/types';

// ─── Test helpers ───────────────────────────────────────────────
function makeInput(overrides: Partial<AuditInput> = {}): AuditInput {
  return {
    tools: [],
    teamSize: 5,
    useCase: 'mixed',
    ...overrides,
  };
}

// ─── 1. Cursor Business downgrade for small team ─────────────────
describe('Cursor audit', () => {
  test('recommends downgrade from Business to Pro for <=3 seats', () => {
    const input = makeInput({
      tools: [{ toolId: 'cursor', plan: 'Business', monthlySpend: 120, seats: 3 }],
    });
    const result = runAudit(input);
    const cursorResult = result.results.find((r) => r.toolId === 'cursor')!;

    expect(cursorResult.recommendation.action).toBe('downgrade');
    expect(cursorResult.savingsMonthly).toBeGreaterThan(0);
    // Business is $40/seat, Pro is $20/seat — 3 seats = $60 savings
    expect(cursorResult.savingsMonthly).toBe(60);
  });

  test('keeps Cursor Pro for appropriate team', () => {
    const input = makeInput({
      tools: [{ toolId: 'cursor', plan: 'Pro', monthlySpend: 100, seats: 5 }],
    });
    const result = runAudit(input);
    const cursorResult = result.results.find((r) => r.toolId === 'cursor')!;

    expect(cursorResult.recommendation.action).toBe('keep');
    expect(cursorResult.savingsMonthly).toBe(0);
  });
});

// ─── 2. GitHub Copilot Enterprise overkill for small team ────────
describe('GitHub Copilot audit', () => {
  test('recommends downgrade from Enterprise to Business for <20 seats', () => {
    const input = makeInput({
      tools: [{ toolId: 'github_copilot', plan: 'Enterprise', monthlySpend: 390, seats: 10 }],
    });
    const result = runAudit(input);
    const ghResult = result.results.find((r) => r.toolId === 'github_copilot')!;

    expect(ghResult.recommendation.action).toBe('downgrade');
    // Enterprise $39/seat - Business $19/seat = $20 * 10 seats = $200 savings
    expect(ghResult.savingsMonthly).toBe(200);
  });
});

// ─── 3. Claude Team with too few seats ───────────────────────────
describe('Claude audit', () => {
  test('recommends downgrade from Team to Pro for <5 seats', () => {
    const input = makeInput({
      tools: [{ toolId: 'claude', plan: 'Team', monthlySpend: 120, seats: 4 }],
    });
    const result = runAudit(input);
    const claudeResult = result.results.find((r) => r.toolId === 'claude')!;

    expect(claudeResult.recommendation.action).toBe('downgrade');
    // Team $30/seat - Pro $20/seat = $10 * 4 = $40 savings
    expect(claudeResult.savingsMonthly).toBe(40);
  });

  test('keeps Claude Pro for single user', () => {
    const input = makeInput({
      tools: [{ toolId: 'claude', plan: 'Pro', monthlySpend: 20, seats: 1 }],
    });
    const result = runAudit(input);
    const claudeResult = result.results.find((r) => r.toolId === 'claude')!;

    expect(claudeResult.recommendation.action).toBe('keep');
  });
});

// ─── 4. ChatGPT Team unnecessary for <5 users ────────────────────
describe('ChatGPT audit', () => {
  test('recommends downgrade from Team to Plus for <5 seats', () => {
    const input = makeInput({
      tools: [{ toolId: 'chatgpt', plan: 'Team', monthlySpend: 90, seats: 3 }],
      useCase: 'coding',
    });
    const result = runAudit(input);
    const gptResult = result.results.find((r) => r.toolId === 'chatgpt')!;

    expect(gptResult.recommendation.action).toBe('downgrade');
    // Team $30/seat - Plus $20/seat = $10 * 3 = $30 savings
    expect(gptResult.savingsMonthly).toBe(30);
  });
});

// ─── 5. API spend — credits recommendation for high spend ─────────
describe('API spend audit', () => {
  test('recommends credits for Anthropic API spend >$500/mo', () => {
    const input = makeInput({
      tools: [{ toolId: 'anthropic_api', plan: 'Pay-as-you-go', monthlySpend: 1000, seats: 1 }],
    });
    const result = runAudit(input);
    const apiResult = result.results.find((r) => r.toolId === 'anthropic_api')!;

    expect(apiResult.recommendation.action).toBe('credits');
    expect(apiResult.savingsMonthly).toBeGreaterThan(0);
  });

  test('recommends optimization for mid-tier API spend $200-500', () => {
    const input = makeInput({
      tools: [{ toolId: 'openai_api', plan: 'Pay-as-you-go', monthlySpend: 300, seats: 1 }],
    });
    const result = runAudit(input);
    const apiResult = result.results.find((r) => r.toolId === 'openai_api')!;

    expect(apiResult.recommendation.action).toBe('optimize');
  });

  test('keeps low API spend without recommendation', () => {
    const input = makeInput({
      tools: [{ toolId: 'openai_api', plan: 'Pay-as-you-go', monthlySpend: 50, seats: 1 }],
    });
    const result = runAudit(input);
    const apiResult = result.results.find((r) => r.toolId === 'openai_api')!;

    expect(apiResult.recommendation.action).toBe('keep');
    expect(apiResult.savingsMonthly).toBe(0);
  });
});

// ─── 6. Total savings calculation ────────────────────────────────
describe('Total audit aggregation', () => {
  test('correctly sums total monthly and annual savings across tools', () => {
    const input = makeInput({
      tools: [
        { toolId: 'cursor', plan: 'Business', monthlySpend: 120, seats: 3 }, // $60 savings
        { toolId: 'github_copilot', plan: 'Enterprise', monthlySpend: 390, seats: 10 }, // $200 savings
      ],
    });
    const result = runAudit(input);

    expect(result.totalMonthlySavings).toBe(260);
    expect(result.totalAnnualSavings).toBe(3120);
  });

  test('marks audit as optimal when savings < $10', () => {
    const input = makeInput({
      tools: [{ toolId: 'cursor', plan: 'Pro', monthlySpend: 20, seats: 1 }],
    });
    const result = runAudit(input);

    expect(result.isOptimal).toBe(true);
  });
});

// ─── 7. Windsurf Teams downgrade ─────────────────────────────────
describe('Windsurf audit', () => {
  test('recommends downgrade from Teams to Pro for <=3 seats', () => {
    const input = makeInput({
      tools: [{ toolId: 'windsurf', plan: 'Teams', monthlySpend: 105, seats: 3 }],
    });
    const result = runAudit(input);
    const wsResult = result.results.find((r) => r.toolId === 'windsurf')!;

    expect(wsResult.recommendation.action).toBe('downgrade');
    // Teams $35/seat - Pro $15/seat = $20 * 3 = $60 savings
    expect(wsResult.savingsMonthly).toBe(60);
  });
});
