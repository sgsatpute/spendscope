import {
  AuditInput,
  AuditResult,
  ToolAuditResult,
  ToolEntry,
  Recommendation,
  TOOL_NAMES,
} from './types';
import { PRICING, getPlanPrice } from './pricingData';
import { nanoid } from 'nanoid';

// ---------- helpers ----------

function perSeatMonthly(toolId: string, plan: string): number {
  return getPlanPrice(toolId, plan);
}

// ---------- per-tool audit logic ----------

function auditCursor(entry: ToolEntry, teamSize: number): Recommendation {
  const { plan, seats, monthlySpend } = entry;
  const expectedMonthly = perSeatMonthly('cursor', plan) * seats;

  if (plan === 'Business' && seats <= 3) {
    const proSavings = (perSeatMonthly('cursor', 'Business') - perSeatMonthly('cursor', 'Pro')) * seats;
    return {
      action: 'downgrade',
      description: 'Switch to Cursor Pro',
      savingsMonthly: proSavings,
      reason: `Business plan costs $40/user vs Pro at $20/user. With ${seats} seats and no enterprise features needed for a team this small, Pro covers all capabilities.`,
      alternativePlan: 'Pro',
    };
  }

  if (plan === 'Pro' && seats >= 10) {
    return {
      action: 'optimize',
      description: 'Negotiate Business contract',
      savingsMonthly: 0,
      reason: 'At 10+ seats you likely qualify for volume Business pricing. Contact Cursor sales — often 15–20% off list.',
    };
  }

  if (plan === 'Enterprise' && seats < 20) {
    const businessSavings = Math.max(0, monthlySpend - perSeatMonthly('cursor', 'Business') * seats);
    return {
      action: 'downgrade',
      description: 'Downgrade to Business',
      savingsMonthly: businessSavings,
      reason: 'Enterprise tier is designed for 20+ seat orgs needing SSO, audit logs, and dedicated support. Below that threshold, Business covers all practical needs.',
      alternativePlan: 'Business',
    };
  }

  return {
    action: 'keep',
    description: 'Plan looks right-sized',
    savingsMonthly: 0,
    reason: 'Your Cursor plan aligns with your team size and spend.',
  };
}

function auditGitHubCopilot(entry: ToolEntry, useCase: string): Recommendation {
  const { plan, seats } = entry;

  if (plan === 'Enterprise' && seats < 20) {
    const savings = (perSeatMonthly('github_copilot', 'Enterprise') - perSeatMonthly('github_copilot', 'Business')) * seats;
    return {
      action: 'downgrade',
      description: 'Downgrade to Copilot Business',
      savingsMonthly: savings,
      reason: `Copilot Enterprise ($39/user) adds Copilot Chat for PR review and org-wide knowledge — valuable at scale. For a ${seats}-person team, Business ($19/user) covers core autocomplete with policy controls.`,
      alternativePlan: 'Business',
    };
  }

  if (plan === 'Business' || plan === 'Enterprise') {
    if (useCase === 'coding') {
      return {
        action: 'optimize',
        description: 'Consider Cursor as a higher-value alternative',
        savingsMonthly: 0,
        reason: 'Cursor Pro ($20/user) vs Copilot Business ($19/user) is near-parity on cost. Teams that have switched consistently report 30–50% faster iteration. Worth a 2-week trial.',
        alternativeTool: 'cursor',
        alternativePlan: 'Pro',
      };
    }
  }

  return {
    action: 'keep',
    description: 'Spend looks appropriate',
    savingsMonthly: 0,
    reason: 'GitHub Copilot plan aligns with your team size.',
  };
}

function auditClaude(entry: ToolEntry, teamSize: number): Recommendation {
  const { plan, seats, monthlySpend } = entry;

  if (plan === 'Max' && seats > 1) {
    const savings = (perSeatMonthly('claude', 'Max') - perSeatMonthly('claude', 'Pro')) * seats;
    return {
      action: 'downgrade',
      description: 'Evaluate who actually needs Max',
      savingsMonthly: savings * 0.5, // assume half can drop to Pro
      reason: `Claude Max ($100/user) is for heavy individual power users — researchers or writers generating 100k+ tokens/day. Most team members doing mixed work won't hit Pro limits ($20/user). Audit actual usage per seat first.`,
      alternativePlan: 'Pro (for lighter users)',
    };
  }

  if (plan === 'Team' && seats < 5) {
    // Team requires 5 seats min
    const proSavings = (perSeatMonthly('claude', 'Team') - perSeatMonthly('claude', 'Pro')) * seats;
    return {
      action: 'downgrade',
      description: 'Switch to individual Pro plans',
      savingsMonthly: Math.max(0, proSavings),
      reason: 'Claude Team is billed at $30/user (annual) with a 5-seat minimum. For fewer than 5 users, individual Pro plans at $20/user save money with no feature downgrade for most use cases.',
      alternativePlan: 'Pro',
    };
  }

  if (plan === 'Pro' && seats >= 15) {
    return {
      action: 'optimize',
      description: 'Migrate to Claude Team or Enterprise',
      savingsMonthly: 0,
      reason: 'At 15+ seats, Team plan adds admin controls, audit logs, and central billing worth having. Contact Anthropic for Enterprise pricing — often competitive at this scale.',
    };
  }

  return {
    action: 'keep',
    description: 'Claude spend looks well-optimized',
    savingsMonthly: 0,
    reason: 'Plan and seat count appear aligned.',
  };
}

function auditChatGPT(entry: ToolEntry, teamSize: number, useCase: string): Recommendation {
  const { plan, seats, monthlySpend } = entry;

  if (plan === 'Plus' && seats > 5 && useCase !== 'writing') {
    const teamSavings = 0; // Team is more expensive per seat
    return {
      action: 'optimize',
      description: 'Evaluate Claude Pro as an alternative',
      savingsMonthly: 0,
      reason: `ChatGPT Plus ($20/user) and Claude Pro ($20/user) are price-identical. Teams doing coding or data analysis often find Claude Sonnet outperforms GPT-4o for technical tasks. Test with your actual prompts before renewing.`,
      alternativeTool: 'claude',
      alternativePlan: 'Pro',
    };
  }

  if (plan === 'Team' && seats < 5) {
    const savings = (perSeatMonthly('chatgpt', 'Team') - perSeatMonthly('chatgpt', 'Plus')) * seats;
    return {
      action: 'downgrade',
      description: 'Switch to individual Plus subscriptions',
      savingsMonthly: Math.max(0, savings),
      reason: `ChatGPT Team ($30/user) adds workspace management and higher limits. For ${seats} users, individual Plus plans ($20/user) provide equivalent output quality at lower cost unless you need shared workspaces.`,
      alternativePlan: 'Plus',
    };
  }

  return {
    action: 'keep',
    description: 'ChatGPT spend looks appropriate',
    savingsMonthly: 0,
    reason: 'Plan aligns with team size.',
  };
}

function auditAPITool(entry: ToolEntry, toolId: string): Recommendation {
  const { monthlySpend } = entry;

  if (monthlySpend > 500) {
    return {
      action: 'credits',
      description: 'Buy discounted API credits through Credex',
      savingsMonthly: monthlySpend * 0.2,
      reason: `At $${monthlySpend}/mo in API spend, buying pre-purchased credits through Credex typically yields 15–25% savings vs retail pricing with no service degradation.`,
    };
  }

  if (monthlySpend > 200) {
    return {
      action: 'optimize',
      description: 'Review model selection and caching',
      savingsMonthly: monthlySpend * 0.15,
      reason: `API spend at this level often has quick wins: caching repeated prompts (40–60% call reduction), routing simple tasks to cheaper models (Haiku/GPT-3.5-turbo at 10–20x lower cost), and prompt compression.`,
    };
  }

  return {
    action: 'keep',
    description: 'API spend is modest',
    savingsMonthly: 0,
    reason: 'Low API spend — no immediate optimization needed. Monitor as you scale.',
  };
}

function auditGemini(entry: ToolEntry, useCase: string): Recommendation {
  const { plan, seats, monthlySpend } = entry;

  if (plan === 'Ultra' && useCase === 'coding') {
    const savings = (perSeatMonthly('gemini', 'Ultra') - perSeatMonthly('gemini', 'Pro')) * seats;
    return {
      action: 'switch',
      description: 'Switch to Cursor or Claude for coding workflows',
      savingsMonthly: savings + monthlySpend * 0.1,
      reason: `Gemini Ultra ($30/user) for coding use cases is outperformed by dedicated coding IDEs. Cursor Pro ($20/user) provides deeper IDE integration, inline diff application, and composer mode — at a lower price for coding-focused teams.`,
      alternativeTool: 'cursor',
      alternativePlan: 'Pro',
    };
  }

  if (plan === 'Pro' && seats > 1) {
    return {
      action: 'optimize',
      description: 'Check if Workspace includes Gemini',
      savingsMonthly: monthlySpend,
      reason: 'If your team uses Google Workspace Business Standard or higher, Gemini is included. You may be double-paying.',
    };
  }

  return {
    action: 'keep',
    description: 'Gemini spend looks fine',
    savingsMonthly: 0,
    reason: 'Plan aligns with your usage pattern.',
  };
}

function auditWindsurf(entry: ToolEntry, teamSize: number): Recommendation {
  const { plan, seats } = entry;

  if (plan === 'Teams' && seats <= 3) {
    const savings = (perSeatMonthly('windsurf', 'Teams') - perSeatMonthly('windsurf', 'Pro')) * seats;
    return {
      action: 'downgrade',
      description: 'Switch to individual Pro plans',
      savingsMonthly: savings,
      reason: `Windsurf Teams ($35/user) adds team management features. For ${seats} developers, individual Pro plans ($15/user) deliver identical AI capabilities at $${savings}/mo less.`,
      alternativePlan: 'Pro',
    };
  }

  if (plan === 'Pro') {
    return {
      action: 'optimize',
      description: 'Compare with Cursor Pro',
      savingsMonthly: 0,
      reason: 'Windsurf Pro and Cursor Pro are similarly priced ($15 vs $20). For teams already on GitHub, Cursor\'s deeper Git integration often edges out. Worth a trial.',
    };
  }

  return {
    action: 'keep',
    description: 'Windsurf spend looks right',
    savingsMonthly: 0,
    reason: 'Plan aligns with team size.',
  };
}

// ---------- main engine ----------

function auditTool(entry: ToolEntry, input: AuditInput): ToolAuditResult {
  const { toolId, plan, seats, monthlySpend } = entry;
  let recommendation: Recommendation;

  switch (toolId) {
    case 'cursor':
      recommendation = auditCursor(entry, input.teamSize);
      break;
    case 'github_copilot':
      recommendation = auditGitHubCopilot(entry, input.useCase);
      break;
    case 'claude':
      recommendation = auditClaude(entry, input.teamSize);
      break;
    case 'chatgpt':
      recommendation = auditChatGPT(entry, input.teamSize, input.useCase);
      break;
    case 'anthropic_api':
    case 'openai_api':
      recommendation = auditAPITool(entry, toolId);
      break;
    case 'gemini':
      recommendation = auditGemini(entry, input.useCase);
      break;
    case 'windsurf':
      recommendation = auditWindsurf(entry, input.teamSize);
      break;
    default:
      recommendation = {
        action: 'keep',
        description: 'No optimizations found',
        savingsMonthly: 0,
        reason: 'Spend looks appropriate.',
      };
  }

  const savingsMonthly = Math.max(0, recommendation.savingsMonthly);

  return {
    toolId,
    toolName: TOOL_NAMES[toolId],
    plan,
    currentMonthlySpend: monthlySpend,
    seats,
    recommendation,
    savingsMonthly,
    savingsAnnual: savingsMonthly * 12,
  };
}

export function runAudit(input: AuditInput): AuditResult {
  const results = input.tools.map((entry) => auditTool(entry, input));

  const totalMonthlySpend = input.tools.reduce((s, t) => s + t.monthlySpend, 0);
  const totalMonthlySavings = results.reduce((s, r) => s + r.savingsMonthly, 0);
  const isOptimal = totalMonthlySavings < 10;

  return {
    id: nanoid(10),
    input,
    results,
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    createdAt: new Date().toISOString(),
    isOptimal,
  };
}
