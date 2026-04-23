"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EXPENSE_CATEGORIES } from "@/lib/status";
import { formatTWD } from "@/lib/money";

type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number;
  spentAt: string;
  invoiceFile: string | null;
};

function fmtDate(d: string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}`;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ExpenseManager({
  campaignId,
  expenses,
}: {
  campaignId: string;
  expenses: Expense[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoicePath, setInvoicePath] = useState<string | null>(null);
  const [invoiceName, setInvoiceName] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "上傳失敗");
      setUploading(false);
      return;
    }
    const data = await res.json();
    setInvoicePath(data.path);
    setInvoiceName(data.name);
    setUploading(false);
  }

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      category: fd.get("category"),
      description: fd.get("description"),
      amount: fd.get("amount"),
      spentAt: fd.get("spentAt"),
      invoiceFile: invoicePath,
    };
    setError(null);
    const res = await fetch(`/api/campaigns/${campaignId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("新增失敗");
      return;
    }
    setAdding(false);
    setInvoicePath(null);
    setInvoiceName(null);
    (e.target as HTMLFormElement).reset();
    startTransition(() => router.refresh());
  }

  async function onDelete(id: string) {
    if (!confirm("刪除這筆支出？")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  const total = expenses.reduce((a, e) => a + e.amount, 0);

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="text-[14px] text-ink-soft">
          共 {expenses.length} 筆 · 合計{" "}
          <span className="font-semibold text-tangerine-deep">{formatTWD(total)}</span>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-primary btn-sm">
            新增支出
          </button>
        )}
      </div>
      <div className="hairline" />

      {adding && (
        <form onSubmit={onAdd} className="px-6 py-6 bg-ceramic/50 border-b border-black/[0.05] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <label className="block">
              <div className="label">類別</div>
              <select name="category" required className="input" defaultValue={EXPENSE_CATEGORIES[0]}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="block md:col-span-2">
              <div className="label">說明</div>
              <input name="description" required className="input" placeholder="例如：寄送樣品給網紅" />
            </label>
            <label className="block">
              <div className="label">日期</div>
              <input name="spentAt" type="date" required defaultValue={today()} className="input" />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <label className="block">
              <div className="label">金額 (TWD)</div>
              <input name="amount" type="number" min={0} step={1} required className="input" />
            </label>
            <label className="block md:col-span-3">
              <div className="label">發票 / 收據 (選填)</div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.heic"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                  disabled={uploading}
                  className="text-sm text-ink-soft file:mr-3 file:btn file:btn-sm file:border-black/15 file:bg-white file:text-ink"
                />
                {uploading && <span className="text-xs text-ink-soft">上傳中...</span>}
                {invoicePath && (
                  <span className="text-[12px] text-success font-medium">已上傳 {invoiceName}</span>
                )}
              </div>
            </label>
          </div>
          {error && <p className="text-[13px] text-danger">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setAdding(false); setInvoicePath(null); setInvoiceName(null); }}
              className="btn-outline btn-sm"
            >
              取消
            </button>
            <button type="submit" disabled={uploading || pending} className="btn-primary btn-sm">
              儲存
            </button>
          </div>
        </form>
      )}

      {expenses.length === 0 ? (
        <div className="p-16 text-center text-[13px] text-ink-mute">還沒有支出記錄</div>
      ) : (
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-[11px] text-ink-soft border-b border-black/[0.08]">
              <th className="text-left px-6 py-3 font-medium">日期</th>
              <th className="text-left px-6 py-3 font-medium">類別</th>
              <th className="text-left px-6 py-3 font-medium">說明</th>
              <th className="text-right px-6 py-3 font-medium">金額</th>
              <th className="text-center px-6 py-3 font-medium">發票</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {expenses.map((e, i) => (
              <tr key={e.id} className={`hover:bg-ceramic/60 transition ${i > 0 ? "border-t border-black/[0.05]" : ""}`}>
                <td className="px-6 py-3.5 text-ink tabular-nums">{fmtDate(e.spentAt)}</td>
                <td className="px-6 py-3.5">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-ceramic text-[11px] text-ink-soft">
                    {e.category}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-ink">{e.description}</td>
                <td className="px-6 py-3.5 text-right tabular-nums font-medium text-tangerine-deep">
                  {formatTWD(e.amount)}
                </td>
                <td className="px-6 py-3.5 text-center">
                  {e.invoiceFile ? (
                    <a
                      href={
                        e.invoiceFile.startsWith("http")
                          ? e.invoiceFile
                          : `/api/files/${e.invoiceFile}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline text-[12px]"
                    >
                      檢視
                    </a>
                  ) : (
                    <span className="text-[12px] text-ink-mute">—</span>
                  )}
                </td>
                <td className="px-2 py-3.5 text-center">
                  <button
                    onClick={() => onDelete(e.id)}
                    className="text-[12px] text-ink-mute hover:text-danger transition"
                    title="刪除"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
