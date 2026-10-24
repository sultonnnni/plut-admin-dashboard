"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, deleteProduk, displayPrice, fetchAllProduk, LOW_STOCK, Produk } from "@/lib/produk";
import { BadgePill, Icon, StockPill, Thumb } from "@/components/ui";
import { ConfirmDialog } from "@/components/Dialog";
import { useToast } from "@/components/Toast";

const PER_PAGE = 20;

export default function ProductsPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<Produk[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [target, setTarget] = useState<Produk | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAllProduk()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!lowOnly || p.stock <= LOW_STOCK) &&
        (!s || p.name.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s))
    );
  }, [items, q, cat, lowOnly]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  async function confirmDelete() {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteProduk(target.id);
      setItems((prev) => prev.filter((x) => x.id !== target.id));
      notify("success", 'Produk "' + target.name + '" berhasil dihapus.');
      setTarget(null);
    } catch (e) {
      notify("error", (e as Error).message || "Gagal menghapus produk.");
      setTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const field =
    "rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produk UMKM</h1>
          <p className="mt-1 text-sm text-slate-500">{items.length} produk dalam katalog.</p>
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

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            value={q}
            maxLength={120}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama atau slug…"
            className={field + " w-full pl-10"}
          />
        </div>
        <select
          value={cat}
          onChange={(e) => {
            setCat(e.target.value);
            setPage(1);
          }}
          className={field}
        >
          <option value="">Semua kategori</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.label}>
              {c.label}
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => {
              setLowOnly(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Stok menipis saja
        </label>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Produk</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Harga</th>
                <th className="px-5 py-3">Stok</th>
                <th className="px-5 py-3">Badge</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading &&
                [1, 2, 3, 4, 5, 6].map((n) => (
                  <tr key={n}>
                    <td colSpan={6} className="px-5 py-3">
                      <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                    </td>
                  </tr>
                ))}
              {!loading &&
                rows.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Thumb path={p.image} name={p.name} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{p.name}</p>
                          <p className="truncate text-xs text-slate-500">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{p.category}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-800">{displayPrice(p)}</td>
                    <td className="px-5 py-3">
                      <StockPill stock={p.stock} />
                    </td>
                    <td className="px-5 py-3">
                      <BadgePill badge={p.badge} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right">
                      <Link
                        href={"/admin/dashboard/products/" + p.id + "/edit"}
                        aria-label={"Edit " + p.name}
                        className="inline-flex rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Icon name="edit" className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => setTarget(p)}
                        aria-label={"Hapus " + p.name}
                        className="inline-flex rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Icon name="trash" className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    Tidak ada produk yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>
          {filtered.length} produk · halaman {current} dari {pages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <button
            disabled={current >= pages}
            onClick={() => setPage(current + 1)}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!target}
        tone="danger"
        icon="trash"
        title="Hapus produk ini?"
        message={target ? '"' + target.name + '" akan dihapus permanen dan tidak bisa dikembalikan.' : ""}
        confirmLabel="Ya, hapus"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </main>
  );
}