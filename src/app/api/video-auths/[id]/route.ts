import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";

const patchSchema = z.object({
  videoTitle: z.string().min(1).optional(),
  videoUrl: z.string().optional().nullable(),
  grantedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  notes: z.string().optional().nullable(),
});

async function ensureOwner(authId: string, userId: string) {
  const v = await prisma.videoAuth.findUnique({
    where: { id: authId },
    include: { campaign: true },
  });
  if (!v || v.campaign.userId !== userId) return null;
  return v;
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

    const updated = await prisma.videoAuth.update({
      where: { id },
      data: {
        ...(d.videoTitle !== undefined ? { videoTitle: d.videoTitle } : {}),
        ...(d.videoUrl !== undefined ? { videoUrl: d.videoUrl || null } : {}),
        ...(d.grantedAt ? { grantedAt: new Date(d.grantedAt) } : {}),
        ...(d.expiresAt ? { expiresAt: new Date(d.expiresAt) } : {}),
        ...(d.notes !== undefined ? { notes: d.notes || null } : {}),
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
    await prisma.videoAuth.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}
