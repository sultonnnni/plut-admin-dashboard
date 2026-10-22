"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProdukForm from "@/components/ProdukForm";
import { getProduk, Produk, updateProduk } from "@/lib/produk";
import { Icon } from "@/components/ui";

export default function EditProdukPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Produk | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProduk(id).then(setItem).catch((e) => setError(e.message));
  }, [id]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <Link href="/admin/dashboard/products" className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800">
        <Icon name="back" className="h-4 w-4" />
        Kembali ke daftar
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold tracking-tight">Edit produk</h1>
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!item && !error && <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />}
      {item && <ProdukForm mode="edit" initial={item} onSubmit={(v) => updateProduk(id, v)} />}
    </main>
  );
}