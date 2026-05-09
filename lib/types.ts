export type ToolId =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf';

export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

export interface ToolEntry {
  toolId: ToolId;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
  companyName?: string;
}

export interface Recommendation {
  action: 'downgrade' | 'switch' | 'optimize' | 'keep' | 'credits';
  description: string;
  savingsMonthly: number;
  reason: string;
  alternativeTool?: string;
  alternativePlan?: string;
}

export interface ToolAuditResult {
  toolId: ToolId;
  toolName: string;
  plan: string;
  currentMonthlySpend: number;
  seats: number;
  recommendation: Recommendation;
  savingsMonthly: number;
  savingsAnnual: number;
}

export interface AuditResult {
  id: string;
  input: AuditInput;
  results: ToolAuditResult[];
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  summary?: string;
  createdAt: string;
  isOptimal: boolean;
}

export interface LeadCapture {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
  totalMonthlySavings: number;
}

export const TOOL_NAMES: Record<ToolId, string> = {
  cursor: 'Cursor',
  github_copilot: 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  anthropic_api: 'Anthropic API',
  openai_api: 'OpenAI API',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
};

export const PLAN_OPTIONS: Record<ToolId, string[]> = {
  cursor: ['Hobby', 'Pro', 'Business', 'Enterprise'],
  github_copilot: ['Individual', 'Business', 'Enterprise'],
  claude: ['Free', 'Pro', 'Max', 'Team', 'Enterprise', 'API direct'],
  chatgpt: ['Plus', 'Team', 'Enterprise', 'API direct'],
  anthropic_api: ['Pay-as-you-go'],
  openai_api: ['Pay-as-you-go'],
  gemini: ['Free', 'Pro', 'Ultra', 'API'],
  windsurf: ['Free', 'Pro', 'Teams', 'Enterprise'],
};
