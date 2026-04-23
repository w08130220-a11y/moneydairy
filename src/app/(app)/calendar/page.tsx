import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { CalendarView } from "@/components/CalendarView";
import { CampaignStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const userId = await requireUserId();
  const campaigns = await prisma.campaign.findMany({
    where: { userId },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="p-8 max-w-[1400px]">
      <PageHeader
        title="行事曆"
        subtitle="月曆檢視每天的案件、時間軸檢視整月排程"
      />
      <CalendarView
        campaigns={campaigns.map((c) => ({
          id: c.id,
          title: c.title,
          vendor: c.vendor,
          platform: c.platform,
          status: c.status as CampaignStatus,
          startDate: c.startDate.toISOString(),
          dueDate: c.dueDate ? c.dueDate.toISOString() : null,
          postedDate: c.postedDate ? c.postedDate.toISOString() : null,
          revenue: c.revenue,
        }))}
      />
    </div>
  );
}
