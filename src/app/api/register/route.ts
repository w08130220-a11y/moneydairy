import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "請確認所有欄位都有正確填寫 (密碼至少 6 碼)" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "此 Email 已註冊" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash } });
  return NextResponse.json({ ok: true });
}
