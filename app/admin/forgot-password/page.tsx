"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthShell, { SuccessMark } from "@/components/AuthShell";
import { ApiError } from "@/lib/api";
import { requestPasswordReset } from "@/lib/akun";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      setSent(await requestPasswordReset(email.trim().toLowerCase()));
      setCooldown(60);
    } catch (err) {
      const apiErr = err as ApiError;
      const first = apiErr.errors ? Object.values(apiErr.errors).flat()[0] : null;
      setError(first || apiErr.message || "Gagal mengirim permintaan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Lupa password" subtitle="Kami kirimkan tautan untuk mengatur ulang password Anda.">
      {sent ? (
        <div className="text-center">
          <SuccessMark />
          <p className="plut-fade-in mt-5 text-sm text-neutral-300">{sent}</p>
          <p className="mt-2 text-xs text-neutral-500">Tautan berlaku selama 60 menit. Periksa juga folder spam.</p>
          <button
            type="button"
            disabled={cooldown > 0}
            onClick={() => setSent("")}
            className="mt-6 w-full rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            {cooldown > 0 ? "Kirim ulang dalam " + cooldown + " dtk" : "Kirim ulang"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div role="alert" className="plut-fade-in mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Email admin
          </label>
          <input
            id="email"
            type="email"
            required
            maxLength={190}
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@plutkebumen.id"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
          />
          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="mt-6 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Mengirim…" : "Kirim tautan reset"}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/admin/login" className="text-neutral-400 transition hover:text-emerald-300">
          ← Kembali ke halaman masuk
        </Link>
      </p>
    </AuthShell>
  );
}