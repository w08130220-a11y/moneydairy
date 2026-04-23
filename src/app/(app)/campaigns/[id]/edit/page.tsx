import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { CampaignForm } from "@/components/CampaignForm";

export const dynamic = "force-dynamic";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const c = await prisma.campaign.findUnique({ where: { id } });
  if (!c || c.userId !== userId) notFound();

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader title="編輯案件" subtitle={c.title} />
      <CampaignForm
        initial={{
          id: c.id,
          title: c.title,
          vendor: c.vendor,
          platform: c.platform,
          productUrl: c.productUrl,
          notes: c.notes,
          startDate: c.startDate.toISOString(),
          dueDate: c.dueDate ? c.dueDate.toISOString() : null,
          postedDate: c.postedDate?.toISOString() ?? null,
          paidDate: c.paidDate?.toISOString() ?? null,
          revenue: c.revenue,
          revenueStatus: c.revenueStatus,
          status: c.status,
        }}
      />
    </div>
  );
}
