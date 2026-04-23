import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";

const patchSchema = z.object({
  category: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  amount: z.coerce.number().min(0).optional(),
  spentAt: z.string().optional(),
  invoiceFile: z.string().optional().nullable(),
});

async function ensureOwner(expenseId: string, userId: string) {
  const e = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { campaign: true },
  });
  if (!e || e.campaign.userId !== userId) return null;
  return e;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await ctx.params;
    const owned = await ensureOwner(id, userId);
    if (!owned) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "欄位驗證失敗" }, { status: 400 });
    const d = parsed.data;

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(d.category !== undefined ? { category: d.category } : {}),
        ...(d.description !== undefined ? { description: d.description } : {}),
        ...(d.amount !== undefined ? { amount: d.amount } : {}),
        ...(d.spentAt ? { spentAt: new Date(d.spentAt) } : {}),
        ...(d.invoiceFile !== undefined ? { invoiceFile: d.invoiceFile || null } : {}),
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
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}
