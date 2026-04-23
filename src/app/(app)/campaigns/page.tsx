import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { formatTWD } from "@/lib/money";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, RevenueBadge } from "@/components/StatusBadge";
import { CampaignStatus, RevenueStatus, STATUS_LABELS, CAMPAIGN_STATUS } from "@/lib/status";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const userId = await requireUserId();
  const sp = await searchParams;
  const status = sp.status;
  const q = sp.q?.trim();

  const rows = await prisma.campaign.findMany({
    where: {
      userId,
      ...(status && CAMPAIGN_STATUS.includes(status as CampaignStatus)
        ? { status }
        : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { vendor: { contains: q } },
              { platform: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { startDate: "desc" },
    include: { expenses: { select: { amount: true } } },
  });

  return (
    <div className="px-10 py-12 max-w-6xl">
      <PageHeader
        title="頁配案件"
        subtitle={`共 ${rows.length} 件`}
        action={
          <Link href="/campaigns/new" className="btn-primary">
            新增案件
          </Link>
        }
      />

      <form className="flex gap-2 mb-6 items-center flex-wrap">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="搜尋案名、廠商、平台"
          className="input max-w-sm"
        />
        <select name="status" defaultValue={status || ""} className="input w-auto">
          <option value="">全部狀態</option>
          {CAMPAIGN_STATUS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button className="btn-primary">篩選</button>
        {(q || status) && (
          <Link href="/campaigns" className="text-[13px] text-ink-soft hover:text-ink">
            清除
          </Link>
        )}
      </form>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-20 text-center text-ink-mute text-[14px]">
            還沒有案件，按「新增案件」建立第一個
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] text-ink-soft border-b border-black/[0.08]">
                <th className="text-left px-6 py-3 font-medium">案名</th>
                <th className="text-left px-6 py-3 font-medium">廠商 / 平台</th>
                <th className="text-left px-6 py-3 font-medium">時程</th>
                <th className="text-right px-6 py-3 font-medium">收入</th>
                <th className="text-right px-6 py-3 font-medium">支出</th>
                <th className="text-right px-6 py-3 font-medium">淨利</th>
                <th className="text-left px-6 py-3 font-medium">狀態</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => {
                const totalExp = c.expenses.reduce((a, e) => a + e.amount, 0);
                const net = c.revenue - totalExp;
                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-ceramic/60 transition ${
                      i > 0 ? "border-t border-black/[0.05]" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/campaigns/${c.id}`}
                        className="font-medium text-ink hover:text-accent"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-ink">
                      <div>{c.vendor}</div>
                      <div className="text-[11px] text-ink-mute mt-0.5">{c.platform}</div>
                    </td>
                    <td className="px-6 py-4 text-[12px]">
                      <div className="text-ink-soft">接案 {fmt(c.startDate)}</div>
                      <div className={c.dueDate ? "text-tangerine-deep font-medium" : "text-ink-mute"}>
                        {c.dueDate ? `截止 ${fmt(c.dueDate)}` : "無截止日"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-medium text-accent">
                      {formatTWD(c.revenue)}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-tangerine-deep">
                      {totalExp ? formatTWD(totalExp) : "—"}
                    </td>
                    <td
                      className={`px-6 py-4 text-right tabular-nums font-semibold ${
                        net >= 0 ? "text-ink" : "text-danger"
                      }`}
                    >
                      {formatTWD(net)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={c.status as CampaignStatus} />
                        <RevenueBadge status={c.revenueStatus as RevenueStatus} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
