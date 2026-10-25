"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/api";
import { Icon, IconName } from "@/components/ui";
import Logo from "@/components/Logo";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/admin/dashboard/products", label: "Produk UMKM", icon: "box" },
];

// Semua halaman di bawah /admin/dashboard wajib punya sesi aktif.
export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) router.replace("/admin/login");
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace("/admin/login");
    }
  }

  const isActive = (href: string) => (href === "/admin/dashboard" ? pathname === href : pathname.startsWith(href));

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-neutral-400">
        Memeriksa sesi…
      </div>
    );
  }

  return (
    <div className="plut-dark plut-glow min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-neutral-950 text-neutral-300 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="px-5 py-6"><Logo size="h-12" className="w-full" /><p className="mt-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Panel Admin</p></div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition " +
                (isActive(n.href) ? "bg-emerald-500/10 text-emerald-300" : "text-neutral-400 hover:bg-white/5 hover:text-white")
              }
            >
              <Icon name={n.icon} className="h-5 w-5" />
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:bg-white/5 hover:text-white"
          >
            <Icon name="logout" className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <Logo size="h-7" pad="px-3 py-1.5" />
          <nav className="flex items-center gap-1 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={"rounded-md px-3 py-1.5 " + (isActive(n.href) ? "bg-emerald-50 font-medium text-emerald-700" : "text-slate-600")}
              >
                {n.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="ml-1 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white">
              Keluar
            </button>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}