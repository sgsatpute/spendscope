// All pricing data verified as of May 2026
// Sources documented in PRICING_DATA.md

export interface PlanPricing {
  plan: string;
  pricePerUserPerMonth: number;
  minSeats?: number;
  maxSeats?: number;
  notes?: string;
}

export const PRICING: Record<string, PlanPricing[]> = {
  cursor: [
    { plan: 'Hobby', pricePerUserPerMonth: 0, notes: 'Free tier, limited completions' },
    { plan: 'Pro', pricePerUserPerMonth: 20 },
    { plan: 'Business', pricePerUserPerMonth: 40, minSeats: 1 },
    { plan: 'Enterprise', pricePerUserPerMonth: 0, notes: 'Custom pricing, typically 60+/user' },
  ],
  github_copilot: [
    { plan: 'Individual', pricePerUserPerMonth: 10 },
    { plan: 'Business', pricePerUserPerMonth: 19, minSeats: 1 },
    { plan: 'Enterprise', pricePerUserPerMonth: 39, minSeats: 1 },
  ],
  claude: [
    { plan: 'Free', pricePerUserPerMonth: 0 },
    { plan: 'Pro', pricePerUserPerMonth: 20 },
    { plan: 'Max', pricePerUserPerMonth: 100 },
    { plan: 'Team', pricePerUserPerMonth: 30, minSeats: 5, notes: 'Billed annually; min 5 seats' },
    { plan: 'Enterprise', pricePerUserPerMonth: 0, notes: 'Custom pricing' },
    { plan: 'API direct', pricePerUserPerMonth: 0, notes: 'Pay per token' },
  ],
  chatgpt: [
    { plan: 'Plus', pricePerUserPerMonth: 20 },
    { plan: 'Team', pricePerUserPerMonth: 30, minSeats: 2 },
    { plan: 'Enterprise', pricePerUserPerMonth: 0, notes: 'Custom pricing' },
    { plan: 'API direct', pricePerUserPerMonth: 0, notes: 'Pay per token' },
  ],
  anthropic_api: [
    { plan: 'Pay-as-you-go', pricePerUserPerMonth: 0, notes: 'Per-token billing' },
  ],
  openai_api: [
    { plan: 'Pay-as-you-go', pricePerUserPerMonth: 0, notes: 'Per-token billing' },
  ],
  gemini: [
    { plan: 'Free', pricePerUserPerMonth: 0 },
    { plan: 'Pro', pricePerUserPerMonth: 20, notes: 'Via Google One AI Premium' },
    { plan: 'Ultra', pricePerUserPerMonth: 30, notes: 'Gemini Advanced' },
    { plan: 'API', pricePerUserPerMonth: 0, notes: 'Pay per token via Google AI Studio' },
  ],
  windsurf: [
    { plan: 'Free', pricePerUserPerMonth: 0 },
    { plan: 'Pro', pricePerUserPerMonth: 15 },
    { plan: 'Teams', pricePerUserPerMonth: 35, minSeats: 2 },
    { plan: 'Enterprise', pricePerUserPerMonth: 0, notes: 'Custom pricing' },
  ],
};

export function getPlanPrice(toolId: string, plan: string): number {
  const plans = PRICING[toolId];
  if (!plans) return 0;
  const found = plans.find((p) => p.plan.toLowerCase() === plan.toLowerCase());
  return found?.pricePerUserPerMonth ?? 0;
}
