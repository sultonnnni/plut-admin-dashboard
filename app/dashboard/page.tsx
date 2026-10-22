"use client";

import { useState, useEffect } from "react";
import { fetchAllProducts, Product } from "../../lib/api";

export default function MyDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    fetchAllProducts()
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal menarik data:", err);
        setErrorMsg(err?.message || "Gagal terhubung ke database cPanel Laravel.");
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((p) => {
    const productName = p?.name ? String(p.name).toLowerCase() : "";
    return productName.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#18181b] p-6 rounded-2xl border border-[#27272a] shadow-xl gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Workspace Dashboard Mandiri</h1>
            </div>
            <p className="text-sm text-[#a1a1aa] mt-1 font-medium">
              Sistem Pengelolaan Katalog Digital PLUT Kebumen Terintegrasi Live MySQL
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-[#142820] text-[#34d399] px-4 py-2 rounded-full border border-[#10b981]/30 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span>API Laravel cPanel Connected</span>
          </div>
        </div>

        {/* KARTU STATISTIK WIDGET */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-2xl shadow-lg">
            <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              Total Katalog Terbaca
            </h3>
            <h2 className="text-4xl font-extrabold text-white mt-2 tracking-tight">
              {loading ? (
                <span className="text-zinc-600 inline-block animate-pulse">...</span>
              ) : (
                products.length
              )}
              <span className="text-sm font-medium text-[#71717a] ml-2">Item Produk Live</span>
            </h2>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-2xl shadow-lg">
            <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              Klaster Kategori Aktif
            </h3>
            <h2 className="text-4xl font-extrabold text-white mt-2 tracking-tight">
              12
              <span className="text-sm font-medium text-[#71717a] ml-2">Klaster UMKM</span>
            </h2>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-2xl shadow-lg border-l-2 border-l-[#10b981]">
            <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              Metode Integrasi Data
            </h3>
            <h2 className="text-lg font-bold text-[#e4e4e7] mt-3 tracking-tight">
              Axios Cookie Sanctum Lintas Port
            </h2>
          </div>
        </div>

        {/* KONTROL & KOLOM PENCARIAN */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="🔍 Cari nama produk Kebumen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-[#e4e4e7] outline-none focus:border-[#10b981] placeholder:text-[#52525b]"
              />
            </div>
            <button className="w-full sm:w-auto bg-[#10b981] text-black text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg hover:scale-[1.02]">
              + Tambah Barang Baru
            </button>
          </div>

          {/* DYNAMIC CONTENT LOADER */}
          {loading ? (
            <div className="py-20 text-center bg-[#09090b]/50 border border-[#27272a] rounded-xl space-y-3">
              <div className="w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-[#a1a1aa]">Menghubungkan ke cPanel, memuat data produk...</p>
            </div>
          ) : errorMsg ? (
            <div className="py-12 text-center bg-red-950/20 border border-red-900/40 rounded-xl px-4">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-sm font-semibold text-red-400 mt-2">Koneksi Database Terhambat</h3>
              <p className="text-xs text-red-500/80 mt-1 max-w-md mx-auto">{errorMsg}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-[#09090b]/30 border border-[#27272a] border-dashed rounded-xl">
              <span className="text-3xl">📦</span>
              <h3 className="text-sm font-semibold text-[#e4e4e7] mt-3">Produk Tidak Ditemukan</h3>
              <p className="text-xs text-[#71717a] mt-1">Kata kunci "{search}" tidak cocok dengan data katalog.</p>
            </div>
          ) : (
            /* TABEL KONTEN PRODUK MANDIRI */
            <div className="overflow-x-auto border border-[#27272a] rounded-xl bg-[#09090b]/40">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#18181b] border-b border-[#27272a] text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6 w-16">ID</th>
                    <th className="py-4 px-6">Nama Master Barang</th>
                    <th className="py-4 px-6">Kategori</th>
                    <th className="py-4 px-6 text-right">Harga Satuan</th>
                    <th className="py-4 px-6 text-center">Sisa Stok</th>
                    <th className="py-4 px-6 text-center">Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-[#18181b]/60 transition-colors group">
                      <td className="py-4 px-6 text-[#71717a] font-mono text-xs">{product.id}</td>
                      <td className="py-4 px-6 font-semibold text-white group-hover:text-[#34d399] transition-colors">
                        {product.name}
                      </td>
                      <td className="py-4 px-6 text-[#a1a1aa]">{product.category || "General"}</td>
                      <td className="py-4 px-6 text-right font-mono text-white font-medium">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          Number(product.stok) > 0 ? "bg-[#142820] text-[#34d399]" : "bg-red-950 text-red-400"
                        }`}>
                          {product.stok} Pcs
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {product.badge ? (
                          <span className="bg-[#27272a] text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 text-[10px] font-bold uppercase tracking-wide">
                            {product.badge}
                          </span>
                        ) : (
                          <span className="text-[#444446] text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
