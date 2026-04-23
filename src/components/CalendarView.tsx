"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { STATUS_COLORS, STATUS_LABELS, CampaignStatus } from "@/lib/status";
import { formatTWD } from "@/lib/money";

type CalendarCampaign = {
  id: string;
  title: string;
  vendor: string;
  platform: string;
  status: CampaignStatus;
  startDate: string;
  dueDate: string | null;
  postedDate: string | null;
  revenue: number;
};

// When a campaign has no dueDate, treat its end as postedDate, else startDate
function rangeEnd(c: CalendarCampaign): Date {
  if (c.dueDate) return new Date(c.dueDate);
  if (c.postedDate) return new Date(c.postedDate);
  return new Date(c.startDate);
}

type ViewMode = "month" | "timeline";

function startOfMonth(y: number, m: number) {
  return new Date(y, m, 1);
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function within(d: Date, s: Date, e: Date) {
  const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const ss = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
  const ee = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
  return dd >= ss && dd <= ee;
}
function daysBetween(a: Date, b: Date) {
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((bb - aa) / 86400_000);
}

export function CalendarView({ campaigns }: { campaigns: CalendarCampaign[] }) {
  const today = new Date();
  const [view, setView] = useState<ViewMode>("month");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const monthLabel = `${year} 年 ${month + 1} 月`;

  function prev() {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  }
  function next() {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  }
  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1">
          <button onClick={prev} className="btn-ghost btn-sm">‹</button>
          <button onClick={goToday} className="btn-outline btn-sm">今天</button>
          <button onClick={next} className="btn-ghost btn-sm">›</button>
        </div>
        <div className="text-[20px] font-semibold tracking-tightsb text-ink">{monthLabel}</div>
        <div className="ml-auto flex items-center gap-1 bg-ceramic rounded-pill p-0.5">
          <button
            onClick={() => setView("month")}
            className={`px-4 py-1.5 rounded-pill text-[12px] font-medium transition ${
              view === "month" ? "bg-white shadow-card text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            月曆
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`px-4 py-1.5 rounded-pill text-[12px] font-medium transition ${
              view === "timeline" ? "bg-white shadow-card text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            時間軸
          </button>
        </div>
      </div>

      <Legend />

      {view === "month" ? (
        <MonthGrid year={year} month={month} today={today} campaigns={campaigns} />
      ) : (
        <Timeline year={year} month={month} today={today} campaigns={campaigns} />
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-4 text-[12px] text-ink-soft">
      {(Object.keys(STATUS_COLORS) as CampaignStatus[]).map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: STATUS_COLORS[s].cal }}
          />
          {STATUS_LABELS[s]}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span className="text-tangerine-deep">|</span>截止日
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="text-success">●</span>上架日
      </span>
    </div>
  );
}

function MonthGrid({
  year,
  month,
  today,
  campaigns,
}: {
  year: number;
  month: number;
  today: Date;
  campaigns: CalendarCampaign[];
}) {
  const first = startOfMonth(year, month);
  const startOffset = first.getDay();
  const gridStart = addDays(first, -startOffset);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-7 text-[11px] text-ink-soft border-b border-black/[0.08]">
        {"日 一 二 三 四 五 六".split(" ").map((d) => (
          <div key={d} className="text-center py-3">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          const isOther = date.getMonth() !== month;
          const isToday = sameDay(date, today);
          const dayCampaigns = campaigns.filter((c) => {
            const s = new Date(c.startDate);
            const e = rangeEnd(c);
            return within(date, s, e);
          });
          const dueCampaigns = campaigns.filter((c) => c.dueDate && sameDay(new Date(c.dueDate), date));
          const postedCampaigns = campaigns.filter((c) => c.postedDate && sameDay(new Date(c.postedDate), date));

          return (
            <div
              key={i}
              className={`min-h-[120px] border-r border-b border-black/[0.06] p-2 ${
                isOther ? "bg-ceramic/30" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[12px] font-medium ${
                    isToday
                      ? "bg-ink text-white rounded-full w-6 h-6 inline-flex items-center justify-center"
                      : isOther
                      ? "text-ink-mute/60"
                      : "text-ink"
                  }`}
                >
                  {date.getDate()}
                </span>
                <div className="flex items-center gap-1.5">
                  {dueCampaigns.length > 0 && (
                    <span className="text-[10px] text-tangerine-deep">|{dueCampaigns.length}</span>
                  )}
                  {postedCampaigns.length > 0 && (
                    <span className="text-[10px] text-success">●{postedCampaigns.length}</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                {dayCampaigns.slice(0, 3).map((c) => (
                  <Link
                    key={c.id}
                    href={`/campaigns/${c.id}`}
                    className="flex items-center gap-1.5 text-[11px] truncate text-ink hover:text-accent transition"
                    title={`${c.title} · ${c.vendor}`}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: STATUS_COLORS[c.status].cal }}
                    />
                    <span className="truncate">{c.title}</span>
                  </Link>
                ))}
                {dayCampaigns.length > 3 && (
                  <div className="text-[10px] text-ink-mute pl-3">
                    +{dayCampaigns.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Timeline({
  year,
  month,
  today,
  campaigns,
}: {
  year: number;
  month: number;
  today: Date;
  campaigns: CalendarCampaign[];
}) {
  const first = startOfMonth(year, month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthEnd = new Date(year, month, daysInMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => addDays(first, i));

  const visible = useMemo(() => {
    return campaigns
      .filter((c) => {
        const s = new Date(c.startDate);
        const e = rangeEnd(c);
        return !(e < first || s > monthEnd);
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [campaigns, year, month]);

  if (visible.length === 0) {
    return (
      <div className="card p-16 text-center text-sm text-ink-soft">
        這個月沒有任何案件
      </div>
    );
  }

  // Wider columns so Chinese text breathes
  const COL = 44;
  const LEFT = 280;
  const todayOffset =
    today >= first && today <= monthEnd ? daysBetween(first, today) : null;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: LEFT + daysInMonth * COL }}>
          {/* Header row */}
          <div className="flex border-b border-black/[0.08] sticky top-0 bg-white z-10">
            <div
              style={{ width: LEFT }}
              className="shrink-0 px-6 py-3 text-[11px] font-medium text-ink-soft"
            >
              案件
            </div>
            <div className="flex">
              {days.map((d) => {
                const isToday = sameDay(d, today);
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div
                    key={d.toISOString()}
                    style={{ width: COL }}
                    className={`text-center py-3 border-l border-black/[0.05] leading-tight ${
                      isToday
                        ? "bg-ink text-white"
                        : isWeekend
                        ? "bg-ceramic/60 text-ink-mute"
                        : "text-ink-soft"
                    }`}
                  >
                    <div className={`text-[13px] ${isToday ? "font-semibold" : "font-medium text-ink"}`}>
                      {d.getDate()}
                    </div>
                    <div className="text-[10px] mt-0.5">
                      {"日一二三四五六"[d.getDay()]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rows */}
          <div className="relative">
            {/* Today vertical line — spans all rows */}
            {todayOffset !== null && (
              <div
                className="absolute top-0 bottom-0 w-px bg-ink/15 pointer-events-none z-0"
                style={{ left: LEFT + todayOffset * COL + COL / 2 }}
              />
            )}

            {visible.map((c) => {
              const s = new Date(c.startDate);
              const e = rangeEnd(c);
              const startOffset = Math.max(0, daysBetween(first, s));
              const endOffset = Math.min(daysInMonth - 1, daysBetween(first, e));
              const spanDays = endOffset - startOffset + 1;
              const posted = c.postedDate ? new Date(c.postedDate) : null;
              const postedOffset =
                posted && posted >= first && posted <= monthEnd
                  ? daysBetween(first, posted)
                  : null;
              const barColor = STATUS_COLORS[c.status].cal;

              // Rendering rules (Apple-Calendar flavor):
              //   1 day   → compact centered pill (24px), no text
              //   2-3 day → rounded bar, no text (left column is the label)
              //   4+ day  → rounded bar with title, truncated
              //   8+ day  → title + divider + status suffix
              const isSingle = spanDays === 1;
              const showText = spanDays >= 4;
              const showStatus = spanDays >= 8;

              const width = isSingle
                ? 24
                : Math.max(1, spanDays) * COL - 8;
              const left = isSingle
                ? startOffset * COL + (COL - 24) / 2
                : startOffset * COL + 4;

              return (
                <div
                  key={c.id}
                  className="flex border-b border-black/[0.06] hover:bg-ceramic/50 group transition"
                >
                  {/* Left: case info — 2-line layout with proper hierarchy */}
                  <div
                    style={{ width: LEFT }}
                    className="shrink-0 px-6 py-4 flex flex-col justify-center gap-1"
                  >
                    <Link
                      href={`/campaigns/${c.id}`}
                      className="text-[14px] font-medium text-ink group-hover:text-accent truncate"
                      title={c.title}
                    >
                      {c.title}
                    </Link>
                    <div className="flex items-center gap-2 text-[12px] text-ink-soft">
                      <span className="truncate">{c.vendor}</span>
                      <span className="text-ink-mute">·</span>
                      <span className="text-accent font-medium tabular-nums shrink-0">
                        {formatTWD(c.revenue)}
                      </span>
                    </div>
                  </div>

                  {/* Right: timeline bar */}
                  <div
                    className="relative py-4"
                    style={{ width: daysInMonth * COL }}
                  >
                    <Link
                      href={`/campaigns/${c.id}`}
                      title={`${c.title} · ${STATUS_LABELS[c.status]}`}
                      className={`absolute top-1/2 -translate-y-1/2 h-7 text-white text-[12px] font-medium flex items-center hover:brightness-110 active:scale-[0.97] transition overflow-hidden ${
                        isSingle ? "rounded-full" : "rounded-md"
                      } ${showText ? "px-3 gap-2" : ""}`}
                      style={{
                        left,
                        width,
                        background: barColor,
                      }}
                    >
                      {showText && (
                        <>
                          <span className="truncate">{c.title}</span>
                          {showStatus && (
                            <span className="shrink-0 opacity-80 text-[11px] ml-auto border-l border-white/30 pl-2">
                              {STATUS_LABELS[c.status]}
                            </span>
                          )}
                        </>
                      )}
                    </Link>

                    {/* Posted-date marker — small green dot with white halo, sits on the bar */}
                    {postedOffset !== null && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-white z-10 pointer-events-none"
                        style={{ left: postedOffset * COL + COL / 2 - 5 }}
                        title="上架日"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
