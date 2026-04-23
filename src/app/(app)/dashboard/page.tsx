import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { formatTWD, marginPercent } from "@/lib/money";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, RevenueBadge } from "@/components/StatusBadge";
import { MonthlyChart, type MonthStat } from "@/components/MonthlyChart";
import { CampaignStatus, RevenueStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const in7Days = new Date(now.getTime() + 7 * 86400_000);

  const campaigns = await prisma.campaign.findMany({
    where: { userId },
    include: { expenses: true },
  });

  let monthRevenue = 0;
  let monthExpense = 0;
  const pending: typeof campaigns = [];
  const upcoming: typeof campaigns = [];

  for (const c of campaigns) {
    const ref = c.postedDate ?? c.startDate;
    if (ref >= monthStart && ref < monthEnd) monthRevenue += c.revenue;
    for (const e of c.expenses) {
      if (e.spentAt >= monthStart && e.spentAt < monthEnd) monthExpense += e.amount;
    }
    if (c.revenueStatus === "PENDING" && c.status !== "CANCELLED") pending.push(c);
    if (c.dueDate && c.dueDate >= now && c.dueDate <= in7Days && c.status !== "DONE" && c.status !== "CANCELLED") {
      upcoming.push(c);
    }
  }

  pending.sort((a, b) => {
    const at = a.dueDate?.getTime() ?? a.startDate.getTime();
    const bt = b.dueDate?.getTime() ?? b.startDate.getTime();
    return at - bt;
  });
  upcoming.sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime());

  const monthNet = monthRevenue - monthExpense;
  const pendingAmount = pending.reduce((a, c) => a + c.revenue, 0);
  const active = campaigns.filter((c) => c.status !== "DONE" && c.status !== "CANCELLED");

  // Build last 12 months (oldest → newest)
  const monthly: MonthStat[] = [];
  for (let i = 11; i >= 0; i--) {
    const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 1);
    let rev = 0;
    let exp = 0;
    for (const c of campaigns) {
      const ref = c.postedDate ?? c.startDate;
      if (ref >= mStart && ref < mEnd) rev += c.revenue;
      for (const e of c.expenses) {
        if (e.spentAt >= mStart && e.spentAt < mEnd) exp += e.amount;
      }
    }
    monthly.push({
      key: `${mStart.getFullYear()}-${String(mStart.getMonth() + 1).padStart(2, "0")}`,
      shortLabel: `${mStart.getMonth() + 1}月`,
      yearBoundary: mStart.getMonth() === 0 || i === 11, // January or first bar
      year: mStart.getFullYear(),
      revenue: rev,
      expense: exp,
      net: rev - exp,
    });
  }

  return (
    <div className="px-10 py-12 max-w-6xl">
      <PageHeader
        title={`${now.getMonth() + 1} 月總覽`}
        subtitle={`${now.getFullYear()} 年 · 本月收支、待收款、即將截止`}
        action={
          <Link href="/campaigns/new" className="btn-primary">
            新增案件
          </Link>
        }
      />

      {/* Hero — net profit anchors the page */}
      <div className="mb-14">
        <div className="text-[13px] text-ink-soft mb-3">本月淨利</div>
        <div className={`text-hero ${monthNet >= 0 ? "text-ink" : "text-danger"}`}>
          {formatTWD(monthNet)}
        </div>
        <div className="text-[14px] text-ink-soft mt-2">
          毛利率 {marginPercent(monthRevenue, monthExpense)}
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
        <Stat label="本月收入" value={formatTWD(monthRevenue)} tone="income" />
        <Stat label="本月支出" value={formatTWD(monthExpense)} tone="expense" />
        <Stat label="進行中" value={`${active.length}`} hint={`共 ${campaigns.length} 件`} />
        <Stat label="待收款" value={formatTWD(pendingAmount)} hint={`${pending.length} 件`} />
      </div>

      {/* Monthly trend chart — answers "這個月賺多少" at a glance */}
      <div className="card p-8 mb-8">
        <MonthlyChart data={monthly} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section
          title="未來 7 天內截止"
          empty="沒有即將到期的案子"
          items={upcoming}
          right={(c) => (
            <span className="text-[13px] text-tangerine-deep font-medium tabular-nums">
              {c.dueDate ? `剩 ${daysTo(c.dueDate)} 天` : "-"}
            </span>
          )}
        />
        <Section
          title="待收款"
          empty="沒有待收款案件"
          items={pending.slice(0, 8)}
          right={(c) => (
            <span className="text-[13px] text-accent font-medium tabular-nums">
              {formatTWD(c.revenue)}
            </span>
          )}
        />
      </div>
    </div>
  );
}

function daysTo(d: Date) {
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400_000));
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "income" | "expense";
}) {
  const color =
    tone === "income"
      ? "text-accent"
      : tone === "expense"
      ? "text-tangerine-deep"
      : "text-ink";
  return (
    <div>
      <div className="text-[12px] text-ink-soft">{label}</div>
      <div className={`text-[26px] font-semibold tracking-tightsb mt-1 tabular-nums ${color}`}>
        {value}
      </div>
      {hint && <div className="text-[11px] text-ink-mute mt-0.5">{hint}</div>}
    </div>
  );
}

function Section<
  T extends {
    id: string;
    title: string;
    vendor: string;
    status: string;
    revenueStatus: string;
    dueDate: Date | null;
  }
>({
  title,
  items,
  empty,
  right,
}: {
  title: string;
  items: T[];
  empty: string;
  right: (c: T) => React.ReactNode;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 font-semibold text-ink text-[14px]">{title}</div>
      <div className="hairline" />
      {items.length === 0 ? (
        <div className="px-6 py-12 text-center text-[13px] text-ink-mute">{empty}</div>
      ) : (
        <ul>
          {items.map((c, i) => (
            <li
              key={c.id}
              className={`px-6 py-4 flex items-center justify-between gap-3 hover:bg-ceramic/60 transition ${
                i > 0 ? "border-t border-black/[0.05]" : ""
              }`}
            >
              <Link href={`/campaigns/${c.id}`} className="flex-1 min-w-0 group">
                <div className="text-[14px] text-ink truncate group-hover:text-accent font-medium">
                  {c.title}
                </div>
                <div className="text-[12px] text-ink-soft flex items-center gap-3 mt-1 flex-wrap">
                  <span>{c.vendor}</span>
                  <StatusBadge status={c.status as CampaignStatus} />
                  <RevenueBadge status={c.revenueStatus as RevenueStatus} />
                </div>
              </Link>
              <div className="shrink-0">{right(c)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
