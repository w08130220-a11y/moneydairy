export const CAMPAIGN_STATUS = ["PLANNED", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUS)[number];

export const REVENUE_STATUS = ["PENDING", "RECEIVED"] as const;
export type RevenueStatus = (typeof REVENUE_STATUS)[number];

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  PLANNED: "待開始",
  IN_PROGRESS: "進行中",
  DONE: "已完成",
  CANCELLED: "已取消",
};

export const REVENUE_LABELS: Record<RevenueStatus, string> = {
  PENDING: "待收款",
  RECEIVED: "已收款",
};

// Semantic Apple palette: each color has one job
//   gray        = planned (nothing happening yet)
//   tangerine   = in-progress (active / heat)
//   green       = done (finished)
//   muted slate = cancelled (not an error, just inactive)
export const STATUS_COLORS: Record<CampaignStatus, { bg: string; text: string; cal: string; dot: string }> = {
  PLANNED:     { bg: "bg-ceramic",          text: "text-ink-soft",  cal: "#a1a1a6", dot: "#a1a1a6" },
  IN_PROGRESS: { bg: "bg-tangerine-soft",   text: "text-tangerine-deep", cal: "#ff6a3d", dot: "#ff6a3d" },
  DONE:        { bg: "bg-success-soft",     text: "text-success",   cal: "#03a75d", dot: "#03a75d" },
  CANCELLED:   { bg: "bg-black/[0.04]",     text: "text-ink-mute",  cal: "#86868b", dot: "#86868b" },
};

export const EXPENSE_CATEGORIES = [
  "樣品 / 商品",
  "廣告投放",
  "寄送 / 物流",
  "剪輯 / 製作",
  "場地 / 道具",
  "外包人力",
  "手續費",
  "其他",
] as const;

export const PLATFORMS = [
  "Instagram",
  "YouTube",
  "Facebook",
  "TikTok",
  "Threads",
  "蝦皮直播",
  "LINE",
  "小紅書",
  "部落格",
  "其他",
] as const;
