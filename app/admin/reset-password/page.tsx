"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell, { SuccessMark } from "@/components/AuthShell";
import { ApiError } from "@/lib/api";
import { passwordChecks, resetPassword } from "@/lib/akun";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setToken(q.get("token") ?? "");
    setEmail((q.get("email") ?? "").toLowerCase());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.replace("/admin/login?reset=1"), 2500);
    return () => clearTimeout(t);
  }, [done, router]);

  const checks = passwordChecks(password);
  const match = password.length > 0 && password === confirm;
  const valid = checks.every((c) => c.ok) && match;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setError("");
    setLoading(true);
    try {
      await resetPassword({ token, email, password, password_confirmation: confirm });
      setDone(true);
    } catch (err) {
      const apiErr = err as ApiError;
      const first = apiErr.errors ? Object.values(apiErr.errors).flat()[0] : null;
      setError(first || apiErr.message || "Gagal mengubah password.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return <main className="min-h-screen bg-neutral-950" />;

  if (!token || !email) {
    return (
      <AuthShell title="Tautan tidak valid" subtitle="Tautan atur ulang password tidak lengkap.">
        <Link
          href="/admin/forgot-password"
          className="block w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-center text-sm font-semibold text-neutral-950"
        >
          Minta tautan baru
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Atur ulang password" subtitle={done ? "Password Anda sudah diperbarui." : "Buat password baru untuk " + email}>
      {done ? (
        <div className="text-center">
          <SuccessMark />
          <p className="plut-fade-in mt-5 text-sm text-neutral-300">Password berhasil diubah. Mengalihkan ke halaman masuk…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div role="alert" className="plut-fade-in mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}{" "}
              <Link href="/admin/forgot-password" className="underline">
                Minta tautan baru
              </Link>
            </div>
          )}

          <label htmlFor="pw" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Password baru
          </label>
          <div className="relative">
            <input
              id="pw"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls + " pr-20"}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute inset-y-0 right-0 px-4 text-xs font-medium text-neutral-400 transition hover:text-emerald-300"
            >
              {show ? "Sembunyi" : "Lihat"}
            </button>
          </div>

          <ul className="mt-3 space-y-1.5 text-xs">
            {checks.map((c) => (
              <li key={c.label} className={"flex items-center gap-2 transition " + (c.ok ? "text-emerald-400" : "text-neutral-500")}>
                <span className={"flex h-4 w-4 items-center justify-center rounded-full text-[10px] " + (c.ok ? "bg-emerald-500/20" : "bg-white/5")}>
                  {c.ok ? "✓" : "•"}
                </span>
                {c.label}
              </li>
            ))}
          </ul>

          <label htmlFor="pw2" className="mt-5 mb-1.5 block text-sm font-medium text-neutral-300">
            Ulangi password baru
          </label>
          <input
            id="pw2"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            maxLength={72}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputCls}
          />
          {confirm.length > 0 && !match && <p className="mt-1.5 text-xs text-red-400">Password belum sama.</p>}

          <button
            type="submit"
            disabled={!valid || loading}
            className="mt-7 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Menyimpan…" : "Simpan password baru"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}