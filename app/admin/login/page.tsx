"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, getCurrentUser, login } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  // Jika sesi masih aktif, langsung ke dashboard.
  useEffect(() => {
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
    setLoading(true);
    try {
      await login(email.trim(), password);
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-neutral-400">
        Memeriksa sesi…
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4 py-10 text-neutral-100">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-xl font-bold text-neutral-950 shadow-lg shadow-emerald-500/20">
            P
          </div>
          <p className="text-xs font-medium tracking-[0.2em] text-emerald-400 uppercase">
            Pusat Layanan Usaha Terpadu
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin PLUT Kebumen</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Masuk untuk mengelola katalog produk UMKM.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@plutkebumen.id"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
          />

          <label
            htmlFor="password"
            className="mt-5 mb-1.5 block text-sm font-medium text-neutral-300"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 pr-20 text-sm text-neutral-100 placeholder-neutral-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
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

        <p className="mt-6 text-center text-xs text-neutral-500">
          INAMIKRO x PLUT Kebumen · Area khusus admin
        </p>
      </div>
    </main>
  );
}