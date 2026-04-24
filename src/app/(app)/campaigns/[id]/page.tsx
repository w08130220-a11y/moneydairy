import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { formatTWD, marginPercent } from "@/lib/money";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { CampaignTabs } from "@/components/CampaignTabs";
import { QuickRevenueToggle } from "@/components/QuickRevenueToggle";
import { CampaignStatus, RevenueStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

function fmt(d: Date | null) {
  if (!d) return "—";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      expenses: { orderBy: { spentAt: "desc" } },
      videoAuths: { orderBy: { grantedAt: "desc" } },
    },
  });
  if (!campaign || campaign.userId !== userId) notFound();

  const totalExpense = campaign.expenses.reduce((a, e) => a + e.amount, 0);
  const net = campaign.revenue - totalExpense;

  return (
    <div className="px-5 py-8 md:px-10 md:py-12 max-w-5xl">
      <PageHeader
        title={campaign.title}
        subtitle={`${campaign.vendor} · ${campaign.platform}`}
        action={
          <Link href={`/campaigns/${id}/edit`} className="btn-outline">
            編輯
          </Link>
        }
      />

      <div className="flex items-center gap-4 mb-12 flex-wrap">
        <StatusBadge status={campaign.status as CampaignStatus} />
        <QuickRevenueToggle
          campaignId={campaign.id}
          status={campaign.revenueStatus as RevenueStatus}
        />
        {campaign.productUrl && (
          <a
            href={campaign.productUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] text-accent hover:underline"
          >
            商品連結 ↗
          </a>
        )}
      </div>

      {/* Typography-led hero — net profit anchors the page */}
      <div className="mb-12 md:mb-14">
        <div className="text-[13px] text-ink-soft mb-3">淨利</div>
        <div className={`text-hero md:text-hero-lg ${net >= 0 ? "text-ink" : "text-danger"}`}>
          {formatTWD(net)}
        </div>
        <div className="text-[14px] text-ink-soft mt-2">
          毛利率 {marginPercent(campaign.revenue, totalExpense)}
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 md:gap-10 mb-12 md:mb-14">
        <Stat label="頁配收入" value={formatTWD(campaign.revenue)} tone="income" />
        <Stat label="總支出" value={formatTWD(totalExpense)} tone="expense" />
        <Stat label="接到案子" value={fmt(campaign.startDate)} small />
        <Stat
          label="截止"
          value={fmt(campaign.dueDate)}
          small
          tone={campaign.dueDate ? "warn" : undefined}
        />
      </div>

      {/* Secondary timeline row */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-x-6 gap-y-8 md:gap-10 mb-10 md:mb-12">
        <Stat label="實際上架" value={fmt(campaign.postedDate)} small />
        <Stat label="收款日" value={fmt(campaign.paidDate)} small />
      </div>

      {campaign.notes && (
        <div className="mb-12 p-5 card-flat">
          <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-mute mb-2">
            備註
          </div>
          <div className="text-[14px] text-ink whitespace-pre-wrap leading-relaxed">
            {campaign.notes}
          </div>
        </div>
      )}

      <CampaignTabs
        campaignId={campaign.id}
        expenses={campaign.expenses.map((e) => ({
          id: e.id,
          category: e.category,
          description: e.description,
          amount: e.amount,
          spentAt: e.spentAt.toISOString(),
          invoiceFile: e.invoiceFile,
        }))}
        videoAuths={campaign.videoAuths.map((v) => ({
          id: v.id,
          videoTitle: v.videoTitle,
          videoUrl: v.videoUrl,
          grantedAt: v.grantedAt.toISOString(),
          expiresAt: v.expiresAt.toISOString(),
          notes: v.notes,
        }))}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  small,
  tone,
}: {
  label: string;
  value: string;
  small?: boolean;
  tone?: "income" | "expense" | "warn";
}) {
  const color =
    tone === "income"
      ? "text-accent"
      : tone === "expense"
      ? "text-tangerine-deep"
      : tone === "warn"
      ? "text-tangerine-deep"
      : "text-ink";
  return (
    <div>
      <div className="text-[12px] text-ink-soft">{label}</div>
      <div
        className={`font-semibold tracking-tightsb mt-1 tabular-nums ${
          small ? "text-[18px]" : "text-[26px]"
        } ${color}`}
      >
        {value}
      </div>
    </div>
  );
}
