import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";

const createSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number().min(0),
  spentAt: z.string().min(1),
  invoiceFile: z.string().optional().nullable(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await ctx.params;
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "欄位驗證失敗" }, { status: 400 });
    }
    const d = parsed.data;
    const created = await prisma.expense.create({
      data: {
        campaignId: id,
        category: d.category,
        description: d.description,
        amount: d.amount,
        spentAt: new Date(d.spentAt),
        invoiceFile: d.invoiceFile || null,
      },
    });
    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}
