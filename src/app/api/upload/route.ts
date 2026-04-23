import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireUserId } from "@/lib/auth";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".pdf", ".heic"]);
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "未收到檔案" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "檔案超過 10MB" }, { status: 400 });
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json(
      { error: "只接受 jpg / png / webp / pdf / heic" },
      { status: 400 }
    );
  }

  const filename = `${randomBytes(12).toString("hex")}${ext}`;
  const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (useBlob) {
    // Production: Vercel Blob (persistent cloud storage)
    const { put } = await import("@vercel/blob");
    const blob = await put(`invoices/${userId}/${filename}`, file, {
      access: "public",
      contentType: file.type || "application/octet-stream",
      addRandomSuffix: false,
    });
    return NextResponse.json({
      path: blob.url, // absolute https://... URL stored in DB
      name: file.name,
      size: file.size,
    });
  }

  // Local dev: save to filesystem under uploads/
  const userDir = path.join(process.cwd(), "uploads", userId);
  await mkdir(userDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(userDir, filename), buffer);
  return NextResponse.json({
    path: `${userId}/${filename}`, // relative path served via /api/files
    name: file.name,
    size: file.size,
  });
}
