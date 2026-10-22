"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAllProduk, LOW_STOCK, Produk } from "@/lib/produk";
import { BadgePill, Icon, IconName, StockPill, Thumb } from "@/components/ui";

function StatCard({ label, value, icon, tone }: { label: string; value?: number; icon: IconName; tone: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className={"flex h-12 w-12 items-center justify-center rounded-xl " + tone}>
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        {value === undefined ? (
          <div className="mt-1 h-8 w-16 animate-pulse rounded bg-slate-200" />
        ) : (
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [items, setItems] = useState<Produk[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllProduk().then(setItems).catch((e) => setError(e.message));
  }, []);

  const low = items?.filter((p) => p.stock <= LOW_STOCK) ?? [];
  const best = items?.filter((p) => p.badge === "Best Seller").length;
  const latest = items ? [...items].sort((a, b) => b.id - a.id).slice(0, 5) : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Ringkasan katalog produk UMKM Kebumen.</p>
        </div>
        <Link
          href="/admin/dashboard/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
        >
          <Icon name="plus" className="h-4 w-4" />
          Tambah produk
        </Link>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total produk" value={items?.length} icon="box" tone="bg-emerald-50 text-emerald-600" />
        <StatCard label={"Stok menipis (≤ " + LOW_STOCK + ")"} value={items ? low.length : undefined} icon="warn" tone="bg-red-50 text-red-600" />
        <StatCard label="Best Seller" value={best} icon="star" tone="bg-amber-50 text-amber-600" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-base font-semibold">Produk terbaru</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {!items && [1, 2, 3].map((n) => <li key={n} className="h-14 animate-pulse py-3"><div className="h-full rounded bg-slate-100" /></li>)}
            {latest.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <Thumb path={p.image} name={p.name} />
                <div className="min-w-0 flex-1">
                  <Link href={"/admin/dashboard/products/" + p.id + "/edit"} className="block truncate text-sm font-medium hover:text-emerald-700">
                    {p.name}
                  </Link>
                  <p className="truncate text-xs text-slate-500">{p.category}</p>
                </div>
                <BadgePill badge={p.badge} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-base font-semibold">Perlu restok</h2>
          {items && low.length === 0 && <p className="mt-3 text-sm text-slate-500">Semua stok aman.</p>}
          <ul className="mt-3 divide-y divide-slate-100">
            {low.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <Thumb path={p.image} name={p.name} />
                <div className="min-w-0 flex-1">
                  <Link href={"/admin/dashboard/products/" + p.id + "/edit"} className="block truncate text-sm font-medium hover:text-emerald-700">
                    {p.name}
                  </Link>
                  <p className="truncate text-xs text-slate-500">{p.category}</p>
                </div>
                <StockPill stock={p.stock} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}