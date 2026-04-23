"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "註冊失敗");
      setLoading(false);
      return;
    }
    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-cream">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-display text-ink">建立帳號</h1>
          <p className="text-[14px] text-ink-soft mt-2">開始管理你的頁配案件</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <div className="label">顯示名稱</div>
            <input name="name" required autoFocus className="input" />
          </div>
          <div>
            <div className="label">Email</div>
            <input type="email" name="email" required className="input" />
          </div>
          <div>
            <div className="label">密碼 (至少 6 碼)</div>
            <input type="password" name="password" required minLength={6} className="input" />
          </div>
          {error && <p className="text-[13px] text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
            {loading ? "建立中…" : "建立帳號"}
          </button>
        </form>
        <p className="text-[13px] text-center text-ink-soft mt-8">
          已經有帳號？
          <Link href="/login" className="text-accent hover:underline ml-1">
            登入
          </Link>
        </p>
      </div>
    </div>
  );
}
