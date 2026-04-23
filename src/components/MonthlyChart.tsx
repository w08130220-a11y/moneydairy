"use client";

import { useState } from "react";
import { formatTWD } from "@/lib/money";

export type MonthStat = {
  key: string;         // "2024-03"
  shortLabel: string;  // "3月"
  yearBoundary: boolean; // true on months that are January → show year label
  year: number;
  revenue: number;
  expense: number;
  net: number;
};

type Mode = "both" | "net";

export function MonthlyChart({ data }: { data: MonthStat[] }) {
  const [mode, setMode] = useState<Mode>("both");
  const [hover, setHover] = useState<number | null>(null);

  // Scale: pick the largest of any visible value so bars fit
  const max =
    mode === "both"
      ? Math.max(1, ...data.map((d) => Math.max(d.revenue, d.expense)))
      : Math.max(1, ...data.map((d) => Math.abs(d.net)));

  const activeMonth = hover !== null ? data[hover] : null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-[14px] font-semibold text-ink">過去 12 個月</div>
          <div className="text-[12px] text-ink-soft mt-0.5">
            {activeMonth
              ? `${activeMonth.year} 年 ${activeMonth.shortLabel}`
              : mode === "both"
              ? "收入 vs. 支出"
              : "月淨利"}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-ceramic rounded-pill p-0.5">
          <ModeBtn label="收支" active={mode === "both"} onClick={() => setMode("both")} />
          <ModeBtn label="淨利" active={mode === "net"} onClick={() => setMode("net")} />
        </div>
      </div>

      {/* Legend + hover snapshot */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2 min-h-[20px]">
        {mode === "both" ? (
          <div className="flex items-center gap-5 text-[12px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-accent" />收入
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-tangerine" />支出
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-5 text-[12px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-ink" />淨利 (正)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-danger" />淨損 (負)
            </span>
          </div>
        )}
        {activeMonth && (
          <div className="flex items-center gap-4 text-[12px] tabular-nums">
            <span className="text-accent">
              收入 {formatTWD(activeMonth.revenue)}
            </span>
            <span className="text-tangerine-deep">
              支出 {formatTWD(activeMonth.expense)}
            </span>
            <span className={activeMonth.net >= 0 ? "text-ink font-semibold" : "text-danger font-semibold"}>
              淨利 {formatTWD(activeMonth.net)}
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Chart rows with gridlines + bars */}
        <div className="h-[220px] flex items-end gap-2 md:gap-3 border-b border-black/[0.08] relative">
          {/* dashed gridlines at 25/50/75% */}
          {[0.25, 0.5, 0.75].map((p) => (
            <div
              key={p}
              className="absolute left-0 right-0 border-t border-dashed border-black/[0.05] pointer-events-none"
              style={{ bottom: `${p * 100}%` }}
            />
          ))}

          {data.map((m, i) => (
            <div
              key={m.key}
              className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {mode === "both" ? (
                <div className="flex items-end justify-center gap-0.5 md:gap-1 w-full h-full px-1">
                  <Bar
                    value={m.revenue}
                    max={max}
                    color="bg-accent"
                    hoverColor="bg-accent-hover"
                    active={hover === i}
                  />
                  <Bar
                    value={m.expense}
                    max={max}
                    color="bg-tangerine"
                    hoverColor="bg-tangerine-hover"
                    active={hover === i}
                  />
                </div>
              ) : (
                <div className="flex items-end justify-center w-full h-full px-1">
                  <Bar
                    value={Math.abs(m.net)}
                    max={max}
                    color={m.net >= 0 ? "bg-ink" : "bg-danger"}
                    hoverColor={m.net >= 0 ? "bg-black" : "bg-danger"}
                    active={hover === i}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* X-axis labels */}
        <div className="flex gap-2 md:gap-3 mt-2.5">
          {data.map((m, i) => (
            <div
              key={m.key}
              className={`flex-1 text-center text-[11px] tabular-nums transition ${
                hover === i ? "text-ink font-semibold" : "text-ink-soft"
              }`}
            >
              <div>{m.shortLabel}</div>
              {m.yearBoundary && (
                <div className="text-[9px] text-ink-mute mt-0.5">{m.year}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Bar({
  value,
  max,
  color,
  hoverColor,
  active,
}: {
  value: number;
  max: number;
  color: string;
  hoverColor: string;
  active: boolean;
}) {
  const h = max > 0 ? (value / max) * 100 : 0;
  // min height so non-zero values are still visible
  const finalH = value > 0 ? Math.max(h, 1.5) : 0;
  return (
    <div
      style={{ height: `${finalH}%` }}
      className={`w-full max-w-[14px] rounded-t-sm transition-all ${
        active ? hoverColor : color
      }`}
    />
  );
}

function ModeBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-pill text-[12px] font-medium transition ${
        active ? "bg-white shadow-card text-ink" : "text-ink-soft hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
