"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CAMPAIGN_STATUS, PLATFORMS, REVENUE_STATUS, STATUS_LABELS, REVENUE_LABELS } from "@/lib/status";

type CampaignInput = {
  id?: string;
  title?: string;
  vendor?: string;
  platform?: string;
  productUrl?: string | null;
  notes?: string | null;
  startDate?: string;
  dueDate?: string | null;
  postedDate?: string | null;
  paidDate?: string | null;
  revenue?: number | string;
  revenueStatus?: string;
  status?: string;
};

function toDateInput(d?: string | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function CampaignForm({ initial }: { initial?: CampaignInput }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const url = isEdit ? `/api/campaigns/${initial!.id}` : `/api/campaigns`;
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "儲存失敗");
      setLoading(false);
      return;
    }
    const data = await res.json();
    router.push(isEdit ? `/campaigns/${initial!.id}` : `/campaigns/${data.id}`);
    router.refresh();
  }

  async function onDelete() {
    if (!isEdit) return;
    if (!confirm("確定要刪除這個案件嗎？相關支出也會一併刪除。")) return;
    setLoading(true);
    const res = await fetch(`/api/campaigns/${initial!.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("刪除失敗");
      setLoading(false);
      return;
    }
    router.push("/campaigns");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-8 md:p-10 space-y-6">
      <Field label="案名 *">
        <input name="title" required defaultValue={initial?.title || ""} className="input" />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="廠商 *">
          <input name="vendor" required defaultValue={initial?.vendor || ""} className="input" />
        </Field>
        <Field label="平台 *">
          <select name="platform" required defaultValue={initial?.platform || "Instagram"} className="input">
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="商品 / 頁配連結">
        <input name="productUrl" type="url" placeholder="https://..." defaultValue={initial?.productUrl || ""} className="input" />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="接到案子日期 *">
          <input name="startDate" type="date" required defaultValue={toDateInput(initial?.startDate)} className="input" />
        </Field>
        <Field label="截止日期 (選填)">
          <input name="dueDate" type="date" defaultValue={toDateInput(initial?.dueDate)} className="input" />
        </Field>
        <Field label="實際上架日">
          <input name="postedDate" type="date" defaultValue={toDateInput(initial?.postedDate)} className="input" />
        </Field>
        <Field label="收款日">
          <input name="paidDate" type="date" defaultValue={toDateInput(initial?.paidDate)} className="input" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="頁配費用 (TWD) *">
          <input name="revenue" type="number" min={0} step={1} required defaultValue={initial?.revenue ?? ""} className="input" />
        </Field>
        <Field label="收款狀態">
          <select name="revenueStatus" defaultValue={initial?.revenueStatus || "PENDING"} className="input">
            {REVENUE_STATUS.map((s) => (
              <option key={s} value={s}>{REVENUE_LABELS[s]}</option>
            ))}
          </select>
        </Field>
        <Field label="案件狀態">
          <select name="status" defaultValue={initial?.status || "PLANNED"} className="input">
            {CAMPAIGN_STATUS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="備註">
        <textarea name="notes" rows={3} defaultValue={initial?.notes || ""} className="input" />
      </Field>

      {error && (
        <p className="text-[13px] text-danger bg-danger-soft rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2 justify-between pt-3 flex-wrap">
        <div>
          {isEdit && (
            <button type="button" onClick={onDelete} disabled={loading} className="btn-danger-ghost">
              刪除案件
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => router.back()} className="btn-outline">
            取消
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "儲存中..." : isEdit ? "更新" : "建立"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="label">{label}</div>
      {children}
    </label>
  );
}
