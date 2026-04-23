const twd = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0,
});

export function formatTWD(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === "") return "-";
  const num = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(num)) return "-";
  return twd.format(num);
}

export function sum(nums: Array<number | string>): number {
  return nums.reduce<number>((a, b) => a + Number(b || 0), 0);
}

export function marginPercent(revenue: number, expense: number): string {
  if (!revenue) return "-";
  return `${(((revenue - expense) / revenue) * 100).toFixed(1)}%`;
}
