import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { CAMPAIGN_STATUS, REVENUE_STATUS } from "@/lib/status";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  vendor: z.string().min(1).optional(),
  platform: z.string().min(1).optional(),
  productUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  postedDate: z.string().optional().nullable(),
  paidDate: z.string().optional().nullable(),
  revenue: z.coerce.number().min(0).optional(),
  revenueStatus: z.enum(REVENUE_STATUS).optional(),
  status: z.enum(CAMPAIGN_STATUS).optional(),
});

async function ensureOwner(id: string, userId: string) {
  const c = await prisma.campaign.findUnique({ where: { id } });
  if (!c || c.userId !== userId) return null;
  return c;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await ctx.params;
    const owned = await ensureOwner(id, userId);
    if (!owned) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { expenses: { orderBy: { spentAt: "desc" } } },
    });
    return NextResponse.json(campaign);
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await ctx.params;
    const owned = await ensureOwner(id, userId);
    if (!owned) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "欄位驗證失敗" }, { status: 400 });
    }
    const d = parsed.data;
    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.vendor !== undefined ? { vendor: d.vendor } : {}),
        ...(d.platform !== undefined ? { platform: d.platform } : {}),
        ...(d.productUrl !== undefined ? { productUrl: d.productUrl || null } : {}),
        ...(d.notes !== undefined ? { notes: d.notes || null } : {}),
        ...(d.startDate ? { startDate: new Date(d.startDate) } : {}),
        ...(d.dueDate !== undefined
          ? { dueDate: d.dueDate ? new Date(d.dueDate) : null }
          : {}),
        ...(d.postedDate !== undefined
          ? { postedDate: d.postedDate ? new Date(d.postedDate) : null }
          : {}),
        ...(d.paidDate !== undefined
          ? { paidDate: d.paidDate ? new Date(d.paidDate) : null }
          : {}),
        ...(d.revenue !== undefined ? { revenue: d.revenue } : {}),
        ...(d.revenueStatus ? { revenueStatus: d.revenueStatus } : {}),
        ...(d.status ? { status: d.status } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await ctx.params;
    const owned = await ensureOwner(id, userId);
    if (!owned) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    await prisma.campaign.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}
