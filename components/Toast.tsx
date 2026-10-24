"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

type Kind = "success" | "error";
type Item = { id: number; kind: Kind; message: string };
type Ctx = { notify: (kind: Kind, message: string) => void };

const ToastContext = createContext<Ctx>({ notify: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const dismiss = useCallback((id: number) => setItems((prev) => prev.filter((t) => t.id !== id)), []);
  const notify = useCallback(
    (kind: Kind, message: string) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev.slice(-3), { id, kind, message }]);
      setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );
  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="plut-dark pointer-events-none fixed right-4 top-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className="plut-slide-in pointer-events-auto flex items-start gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-200"
          >
            <span
              className={
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full " +
                (t.kind === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")
              }
            >
              {t.kind === "success" ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path className="plut-check" d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              ) : (
                <span className="text-sm font-bold leading-none">!</span>
              )}
            </span>
            <p className="min-w-0 flex-1 text-sm text-slate-700">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Tutup notifikasi"
              className="text-slate-400 transition hover:text-slate-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}