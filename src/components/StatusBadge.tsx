import {
  CampaignStatus,
  RevenueStatus,
  STATUS_COLORS,
  STATUS_LABELS,
  REVENUE_LABELS,
} from "@/lib/status";

/** Apple-style: small colored dot + quiet label */
export function StatusBadge({ status }: { status: CampaignStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function RevenueBadge({ status }: { status: RevenueStatus }) {
  const color = status === "RECEIVED" ? "#03a75d" : "#b5231c";
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {REVENUE_LABELS[status]}
    </span>
  );
}
