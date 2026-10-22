"use client";

import Link from "next/link";
import ProdukForm from "@/components/ProdukForm";
import { createProduk } from "@/lib/produk";
import { Icon } from "@/components/ui";

export default function NewProdukPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <Link href="/admin/dashboard/products" className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800">
        <Icon name="back" className="h-4 w-4" />
        Kembali ke daftar
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold tracking-tight">Tambah produk</h1>
      <ProdukForm mode="create" onSubmit={createProduk} />
    </main>
  );
}