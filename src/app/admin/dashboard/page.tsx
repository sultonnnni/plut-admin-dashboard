"use client";

import { useState } from "react";

export default function DashboardAdmin() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-black text-sm">
              N
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider uppercase text-zinc-200">PLUT KEBUMEN</h1>
              <p className="text-xs text-zinc-500">Dashboard Mandiri</p>
            </div>
          </div>
          <nav className="space-y-1">
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-emerald-400 font-semibold">
              📊 <span>Dashboard Utama</span>
            </button>
          </nav>
        </div>
        <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-500 text-center">
          Mitra Industri &copy; INAMIKRO 2026
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-zinc-900/50 backdrop-blur border-b border-zinc-800 px-8 flex items-center justify-between">
          <div className="text-sm font-medium text-zinc-400">
            Selamat Datang, <span className="text-zinc-200 font-semibold">Admin PLUT</span>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-zinc-800/80 px-3 py-1.5 rounded-full border border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-zinc-300 font-medium">Connected to Laravel API (Port 8000)</span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Ringkasan Dasbor</h2>
            <p className="text-sm text-zinc-400">Pemantauan data katalog digital terintegrasi server pusat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-all">
              <div className="text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-1">Total Produk UMKM</div>
              <div className="text-3xl font-bold text-zinc-100">138 <span className="text-xs font-normal text-zinc-500">Item</span></div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-all">
              <div className="text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-1">Kategori Aktif</div>
              <div className="text-3xl font-bold text-zinc-100">12 <span className="text-xs font-normal text-zinc-500">Klaster</span></div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl border-l-2 border-l-emerald-500">
              <div className="text-xs font-semibold tracking-wider text-emerald-500 uppercase mb-1">Status Sinkronisasi</div>
              <div className="text-lg font-bold text-zinc-200 mt-1">Live Database cPanel</div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl mb-4 text-zinc-400">📂</div>
            <h3 className="text-sm font-semibold text-zinc-200">Katalog Tabel Produk Terintegrasi cPanel</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">Data sinkron aman. Komponen looping fetch data GET API siap disuntikkan untuk memetakan produk asli di area ini.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
 
