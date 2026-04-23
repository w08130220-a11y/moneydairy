"use client";

import { useState } from "react";
import { ExpenseManager } from "@/components/ExpenseManager";
import { VideoAuthManager } from "@/components/VideoAuthManager";

type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number;
  spentAt: string;
  invoiceFile: string | null;
};

type VideoAuth = {
  id: string;
  videoTitle: string;
  videoUrl: string | null;
  grantedAt: string;
  expiresAt: string;
  notes: string | null;
};

export function CampaignTabs({
  campaignId,
  expenses,
  videoAuths,
}: {
  campaignId: string;
  expenses: Expense[];
  videoAuths: VideoAuth[];
}) {
  const [tab, setTab] = useState<"expenses" | "auths">("expenses");

  const now = Date.now();
  const expiringSoon = videoAuths.some((v) => {
    const diff = new Date(v.expiresAt).getTime() - now;
    return diff >= 0 && diff <= 30 * 86400_000;
  });
  const expired = videoAuths.some((v) => new Date(v.expiresAt).getTime() < now);

  return (
    <div>
      <div className="flex gap-6 mb-5 border-b border-black/[0.08]">
        <TabButton
          active={tab === "expenses"}
          onClick={() => setTab("expenses")}
          label={`支出明細`}
          count={expenses.length}
        />
        <TabButton
          active={tab === "auths"}
          onClick={() => setTab("auths")}
          label={`授權影片`}
          count={videoAuths.length}
          alert={expired ? "danger" : expiringSoon ? "warn" : undefined}
        />
      </div>
      {tab === "expenses" ? (
        <ExpenseManager campaignId={campaignId} expenses={expenses} />
      ) : (
        <VideoAuthManager campaignId={campaignId} auths={videoAuths} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
  alert,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  alert?: "danger" | "warn";
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-0 py-3 text-[14px] border-b-2 -mb-px transition ${
        active
          ? "border-ink text-ink font-semibold"
          : "border-transparent text-ink-soft hover:text-ink"
      }`}
    >
      <span>{label}</span>
      <span className="ml-1.5 text-[12px] text-ink-mute">{count}</span>
      {alert && (
        <span
          className={`ml-1.5 inline-block w-1.5 h-1.5 rounded-full ${
            alert === "danger" ? "bg-danger" : "bg-tangerine"
          }`}
        />
      )}
    </button>
  );
}
