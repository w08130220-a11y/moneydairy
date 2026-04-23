import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { CAMPAIGN_STATUS, REVENUE_STATUS } from "@/lib/status";

const createSchema = z.object({
  title: z.string().min(1),
  vendor: z.string().min(1),
  platform: z.string().min(1),
  productUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  startDate: z.string().min(1),
  dueDate: z.string().optional().nullable(),
  postedDate: z.string().optional().nullable(),
  paidDate: z.string().optional().nullable(),
  revenue: z.coerce.number().min(0),
  revenueStatus: z.enum(REVENUE_STATUS).default("PENDING"),
  status: z.enum(CAMPAIGN_STATUS).default("PLANNED"),
});

export async function GET() {
  try {
    const userId = await requireUserId();
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
      include: { expenses: { select: { amount: true } } },
    });
    const shaped = campaigns.map((c) => {
      const totalExpense = c.expenses.reduce((a, e) => a + e.amount, 0);
      const { expenses: _ignore, ...rest } = c;
      return { ...rest, totalExpense, netProfit: c.revenue - totalExpense };
    });
    return NextResponse.json(shaped);
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "欄位驗證失敗", detail: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    const created = await prisma.campaign.create({
      data: {
        userId,
        title: data.title,
        vendor: data.vendor,
        platform: data.platform,
        productUrl: data.productUrl || null,
        notes: data.notes || null,
        startDate: new Date(data.startDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        postedDate: data.postedDate ? new Date(data.postedDate) : null,
        paidDate: data.paidDate ? new Date(data.paidDate) : null,
        revenue: data.revenue,
        revenueStatus: data.revenueStatus,
        status: data.status,
      },
    });
    return NextResponse.json(created);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: "建立失敗" }, { status: 500 });
  }
}
