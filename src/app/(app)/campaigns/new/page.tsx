import { PageHeader } from "@/components/PageHeader";
import { CampaignForm } from "@/components/CampaignForm";

export default function NewCampaignPage() {
  return (
    <div className="p-8 max-w-3xl">
      <PageHeader title="新增頁配案件" subtitle="填入案件資訊，建立後可再新增支出與上傳發票" />
      <CampaignForm />
    </div>
  );
}
