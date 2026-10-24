"use client";

import { ReactNode, useEffect, useRef } from "react";
import { Icon, IconName } from "@/components/ui";

type Props = {
  open: boolean;
  title: string;
  message: string;
  tone?: "default" | "danger";
  icon?: IconName;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  title,
  message,
  tone = "default",
  icon,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  loading = false,
  onConfirm,
  onCancel,
  children,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef(onCancel);
  useEffect(() => {
    cancelRef.current = onCancel;
  });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) cancelRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, loading]);

  if (!open) return null;

  const danger = tone === "danger";
  const iconName: IconName = icon ?? (danger ? "warn" : "upload");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="plut-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !loading && onCancel()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="plut-pop-in relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200"
      >
        <div className="flex items-start gap-4">
          <div
            className={
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full " +
              (danger ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")
            }
          >
            <Icon name={iconName} className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="dialog-title" className="text-base font-semibold text-slate-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
            {children}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 " +
              (danger ? "bg-red-600 hover:bg-red-500" : "bg-emerald-600 hover:bg-emerald-500")
            }
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            {loading ? "Memproses…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}