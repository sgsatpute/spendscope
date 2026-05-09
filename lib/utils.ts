export function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatCurrencyFull(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const ACTION_LABELS: Record<string, string> = {
  downgrade: 'Downgrade',
  switch: 'Switch Tool',
  optimize: 'Optimize',
  keep: 'Already Optimal',
  credits: 'Buy Credits',
};

export const ACTION_COLORS: Record<string, string> = {
  downgrade: '#22c55e',
  switch: '#3b82f6',
  optimize: '#f59e0b',
  keep: '#6b7280',
  credits: '#8b5cf6',
};
