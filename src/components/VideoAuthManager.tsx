"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type VideoAuth = {
  id: string;
  videoTitle: string;
  videoUrl: string | null;
  grantedAt: string;
  expiresAt: string;
  notes: string | null;
};

const DURATION_PRESETS: Array<{ label: string; days: number }> = [
  { label: "1 個月", days: 30 },
  { label: "3 個月", days: 90 },
  { label: "6 個月", days: 180 },
  { label: "1 年", days: 365 },
  { label: "2 年", days: 730 },
  { label: "永久", days: 36500 },
];

function fmt(d: string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}`;
}

function toDateInput(d: string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function todayInput() {
  return toDateInput(new Date().toISOString());
}

function addDaysInput(base: string, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return toDateInput(d.toISOString());
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400_000);
}

function authStatus(expiresAt: string): { label: string; dot: string; text: string } {
  const days = daysBetween(new Date().toISOString(), expiresAt);
  if (days < 0) return { label: "已到期", dot: "#86868b", text: "text-ink-mute" };
  if (days <= 30) return { label: `剩 ${days} 天`, dot: "#ff6a3d", text: "text-tangerine-deep" };
  return { label: `剩 ${days} 天`, dot: "#03a75d", text: "text-success" };
}

export function VideoAuthManager({
  campaignId,
  auths,
}: {
  campaignId: string;
  auths: VideoAuth[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [granted, setGranted] = useState(todayInput());
  const [expires, setExpires] = useState(addDaysInput(todayInput(), 180));

  function applyPreset(days: number) {
    setExpires(addDaysInput(granted, days));
  }

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      videoTitle: fd.get("videoTitle"),
      videoUrl: fd.get("videoUrl") || null,
      grantedAt: granted,
      expiresAt: expires,
      notes: fd.get("notes") || null,
    };
    setError(null);
    const res = await fetch(`/api/campaigns/${campaignId}/video-auths`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("新增失敗");
      return;
    }
    setAdding(false);
    setGranted(todayInput());
    setExpires(addDaysInput(todayInput(), 180));
    (e.target as HTMLFormElement).reset();
    startTransition(() => router.refresh());
  }

  async function onDelete(id: string) {
    if (!confirm("刪除這筆授權記錄？")) return;
    await fetch(`/api/video-auths/${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  const sorted = useMemo(
    () =>
      [...auths].sort(
        (a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime()
      ),
    [auths]
  );

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="text-[14px] text-ink">共 {auths.length} 筆</div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-primary btn-sm">
            新增授權
          </button>
        )}
      </div>
      <div className="hairline" />

      {adding && (
        <form onSubmit={onAdd} className="px-6 py-6 bg-ceramic/50 border-b border-black/[0.05] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <div className="label">影片名稱 / 說明 *</div>
              <input name="videoTitle" required className="input" placeholder="例如：YouTube 開箱影片" />
            </label>
            <label className="block">
              <div className="label">影片連結 (選填)</div>
              <input name="videoUrl" type="url" className="input" placeholder="https://..." />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <div className="label">授權開始日 *</div>
              <input
                type="date"
                required
                value={granted}
                onChange={(e) => {
                  const d = daysBetween(granted, expires);
                  setGranted(e.target.value);
                  setExpires(addDaysInput(e.target.value, d));
                }}
                className="input"
              />
            </label>
            <label className="block">
              <div className="label">
                授權到期日 *{" "}
                {granted && expires && (
                  <span className="text-ink-soft normal-case tracking-normal">
                    ({daysBetween(granted, expires)} 天)
                  </span>
                )}
              </div>
              <input
                type="date"
                required
                value={expires}
                min={granted}
                onChange={(e) => setExpires(e.target.value)}
                className="input"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[12px] text-ink-soft">快速選擇：</span>
            {DURATION_PRESETS.map((p) => (
              <button
                type="button"
                key={p.label}
                onClick={() => applyPreset(p.days)}
                className="px-3 py-1.5 text-[12px] rounded-pill bg-white border border-black/15 hover:border-ink hover:text-ink text-ink-soft transition active:scale-[0.97]"
              >
                {p.label}
              </button>
            ))}
          </div>

          <label className="block">
            <div className="label">備註 (選填)</div>
            <textarea
              name="notes"
              rows={2}
              className="input"
              placeholder="例如：僅限廠商官網、社群平台同步使用"
            />
          </label>

          {error && <p className="text-[13px] text-danger">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setAdding(false)} className="btn-outline btn-sm">
              取消
            </button>
            <button type="submit" disabled={pending} className="btn-primary btn-sm">
              儲存
            </button>
          </div>
        </form>
      )}

      {sorted.length === 0 ? (
        <div className="p-16 text-center text-[13px] text-ink-mute">
          還沒有授權記錄。有些廠商會要求授權影片使用期限，從這邊建立紀錄。
        </div>
      ) : (
        <ul>
          {sorted.map((v, i) => {
            const s = authStatus(v.expiresAt);
            const duration = daysBetween(v.grantedAt, v.expiresAt);
            return (
              <li
                key={v.id}
                className={`px-6 py-5 flex items-start gap-4 group hover:bg-ceramic/60 transition ${
                  i > 0 ? "border-t border-black/[0.05]" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[14px] font-semibold text-ink">{v.videoTitle}</span>
                    <span className={`inline-flex items-center gap-1.5 text-[12px] ${s.text}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {s.label}
                    </span>
                  </div>
                  <div className="text-[12px] text-ink-soft mt-1.5 tabular-nums">
                    {fmt(v.grantedAt)} → {fmt(v.expiresAt)} · 共 {duration} 天
                  </div>
                  {v.videoUrl && (
                    <a
                      href={v.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[12px] text-accent hover:underline mt-1 inline-block break-all"
                    >
                      {v.videoUrl}
                    </a>
                  )}
                  {v.notes && (
                    <div className="text-[12px] text-ink-soft mt-2.5 bg-ceramic rounded-md px-3 py-2 leading-relaxed">
                      {v.notes}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDelete(v.id)}
                  className="text-[12px] text-ink-mute hover:text-danger opacity-0 group-hover:opacity-100 transition"
                  title="刪除"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
