import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { requireUserId } from "@/lib/auth";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".pdf": "application/pdf",
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { path: segments } = await ctx.params;
  if (!segments || segments.length < 2) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  // Only let the owner read their own files
  if (segments[0] !== userId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  // Resolve safely: join all segments, then ensure result stays inside uploads/{userId}/
  const baseDir = path.join(process.cwd(), "uploads", userId);
  const filePath = path.join(baseDir, ...segments.slice(1));
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(baseDir) + path.sep)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  try {
    await stat(resolved);
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const buf = await readFile(resolved);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
