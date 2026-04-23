"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email 或密碼錯誤");
      return;
    }
    window.location.href = next;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <div className="label">Email</div>
        <input type="email" name="email" required autoFocus className="input" />
      </div>
      <div>
        <div className="label">密碼</div>
        <input type="password" name="password" required className="input" />
      </div>
      {error && <p className="text-[13px] text-danger">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
        {loading ? "登入中…" : "登入"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-cream">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-display text-ink">頁配管家</h1>
          <p className="text-[14px] text-ink-soft mt-2">登入你的帳號</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-[13px] text-center text-ink-soft mt-8">
          還沒有帳號？
          <Link href="/register" className="text-accent hover:underline ml-1">
            註冊
          </Link>
        </p>
      </div>
    </div>
  );
}
