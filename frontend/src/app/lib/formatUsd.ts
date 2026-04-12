const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return usd.format(amount);
}

/** Shorter labels for chart axes (e.g. $3.5k). */
export function formatUsdCompact(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return usd.format(amount);
}
