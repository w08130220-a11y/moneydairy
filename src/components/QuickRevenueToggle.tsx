"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RevenueStatus } from "@/lib/status";

export function QuickRevenueToggle({
  campaignId,
  status,
}: {
  campaignId: string;
  status: RevenueStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next: RevenueStatus = status === "RECEIVED" ? "PENDING" : "RECEIVED";
    setSaving(true);
    const res = await fetch(`/api/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        revenueStatus: next,
        ...(next === "RECEIVED" ? { paidDate: new Date().toISOString() } : {}),
      }),
    });
    setSaving(false);
    if (res.ok) startTransition(() => router.refresh());
  }

  const isReceived = status === "RECEIVED";
  return (
    <button
      onClick={toggle}
      disabled={saving || pending}
      className={`btn btn-sm ${
        isReceived
          ? "bg-success/10 text-success hover:bg-success/15 border border-success/20"
          : "bg-white text-ink border border-black/15 hover:bg-black/[0.03]"
      }`}
      title={isReceived ? "點一下改回未收款" : "點一下標示為已收款"}
    >
      {isReceived ? "已收款" : "標示為已收款"}
    </button>
  );
}
