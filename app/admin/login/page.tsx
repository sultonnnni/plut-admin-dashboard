"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { ApiError, getCurrentUser, login } from "@/lib/api";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("reset") === "1") {
      setNotice("Password berhasil diubah. Silakan masuk dengan password baru.");
    }
    let active = true;
    getCurrentUser()
      .then(() => {
        if (active) router.replace("/admin/dashboard");
      })
      .catch(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.push("/admin/dashboard");
    } catch (err) {
      const apiErr = err as ApiError;
      const first = apiErr.errors ? Object.values(apiErr.errors).flat()[0] : null;
      setError(first || apiErr.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-neutral-400">Memeriksa sesi…</main>;
  }

  return (
    <AuthShell title="Admin PLUT Kebumen" subtitle="Masuk untuk mengelola katalog produk UMKM.">
      <form onSubmit={handleSubmit}>
        {notice && (
          <div role="status" className="plut-fade-in mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {notice}
          </div>
        )}
        {error && (
          <div role="alert" className="plut-fade-in mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          maxLength={190}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@plutkebumen.id"
          className={inputCls}
        />

        <div className="mt-5 mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-neutral-300">
            Password
          </label>
          <Link href="/admin/forgot-password" className="text-xs font-medium text-emerald-400 transition hover:text-emerald-300">
            Lupa password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            className={inputCls + " pr-20"}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 px-4 text-xs font-medium text-neutral-400 transition hover:text-emerald-300"
          >
            {showPassword ? "Sembunyi" : "Lihat"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          )}
          {loading ? "Memproses…" : "Masuk ke Dasbor"}
        </button>
      </form>
    </AuthShell>
  );
}