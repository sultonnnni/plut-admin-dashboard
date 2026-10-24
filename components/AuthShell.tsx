import { ReactNode } from "react";

export function SuccessMark() {
  return (
    <div className="plut-ring mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
      <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path className="plut-check" d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </div>
  );
}

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4 py-10 text-neutral-100">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />

      <div className="plut-pop-in relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-xl font-bold text-neutral-950 shadow-lg shadow-emerald-500/20">
            P
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">Pusat Layanan Usaha Terpadu</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">{children}</div>

        <p className="mt-6 text-center text-xs text-neutral-500">INAMIKRO x PLUT Kebumen · Area khusus admin</p>
      </div>
    </main>
  );
}