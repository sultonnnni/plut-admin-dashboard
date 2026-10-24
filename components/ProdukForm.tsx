"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { BADGES, CATEGORIES, onlyDigits, Produk, ProdukValues, slugify, uploadImage } from "@/lib/produk";
import { cleanImagePath, cleanLine, cleanText, LIMITS } from "@/lib/sanitize";
import { Icon, Thumb } from "@/components/ui";
import { ConfirmDialog } from "@/components/Dialog";
import { useToast } from "@/components/Toast";

type Props = {
  mode: "create" | "edit";
  initial?: Produk;
  onSubmit: (v: ProdukValues) => Promise<unknown>;
};

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-100 disabled:text-slate-500";
const labelCls = "text-sm font-medium text-slate-700";
const cardCls = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200";

const sizeLabel = (n: number) => (n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.round(n / 1024) + " KB");

export default function ProdukForm({ mode, initial, onSubmit }: Props) {
  const router = useRouter();
  const { notify } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState<{ file: File; preview: string } | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [v, setV] = useState<ProdukValues>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    category: initial?.category ?? "",
    price: onlyDigits(initial?.price ?? ""),
    priceTouched: false,
    stock: String(initial?.stock ?? 99),
    badge: initial?.badge || "Produk Unggulan",
    image: initial?.image ?? "",
    description: initial?.description ?? "",
  });

  // Lepas URL pratinjau saat diganti atau halaman ditutup.
  useEffect(
    () => () => {
      if (pending) URL.revokeObjectURL(pending.preview);
    },
    [pending]
  );

  const categories = CATEGORIES.map((c) => c.label);
  if (initial?.category && !categories.includes(initial.category)) categories.push(initial.category);

  function set<K extends keyof ProdukValues>(key: K, value: ProdukValues[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }
  function onName(value: string) {
    setV((prev) => ({
      ...prev,
      name: value,
      slug: mode === "create" && !slugTouched ? slugify(cleanLine(value)) : prev.slug,
    }));
  }
  const fieldError = (k: string) =>
    errors[k]?.[0] ? <p className="mt-1.5 text-xs text-red-600">{errors[k][0]}</p> : null;

  function pickFile(file?: File | null) {
    if (!file) return;
    setUploadError("");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setUploadError("Format harus JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Ukuran foto maksimal 2 MB.");
      return;
    }
    setPending({ file, preview: URL.createObjectURL(file) });
  }

  async function confirmUpload() {
    if (!pending) return;
    setUploading(true);
    try {
      const path = await uploadImage(pending.file, v.slug || slugify(cleanLine(v.name)));
      set("image", path);
      setPending(null);
      notify("success", "Foto berhasil diunggah.");
    } catch (err) {
      setPending(null);
      setUploadError((err as ApiError).message || "Gagal mengunggah foto.");
      notify("error", "Foto gagal diunggah.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setErrors({});

    const cleaned: ProdukValues = {
      ...v,
      name: cleanLine(v.name),
      slug: mode === "create" ? slugify(cleanLine(v.slug)) : v.slug,
      description: cleanText(v.description),
      image: cleanImagePath(v.image),
    };

    const local: Record<string, string[]> = {};
    if (v.image.trim() && !cleaned.image) local.image = ["Path gambar tidak valid."];
    if (cleaned.name.length > LIMITS.name) local.name = ["Nama maksimal " + LIMITS.name + " karakter."];
    if (cleaned.description.length > LIMITS.description) local.description = ["Deskripsi maksimal " + LIMITS.description + " karakter."];
    if (Object.keys(local).length) {
      setErrors(local);
      setError("Periksa kembali isian yang ditandai.");
      return;
    }

    setV(cleaned);
    setSaving(true);
    try {
      await onSubmit(cleaned);
      notify("success", mode === "create" ? "Produk berhasil dibuat." : "Perubahan berhasil disimpan.");
      router.push("/admin/dashboard/products");
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors(apiErr.errors ?? {});
      setError(apiErr.errors ? "Periksa kembali isian yang ditandai." : apiErr.message || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div role="alert" className="plut-fade-in mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className={cardCls + " space-y-5 lg:col-span-2"}>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Informasi produk</h2>
            <p className="mt-0.5 text-sm text-slate-500">Data utama yang tampil di katalog.</p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className={labelCls}>Nama produk</label>
              <span className="text-xs text-slate-400">
                {v.name.length}/{LIMITS.name}
              </span>
            </div>
            <input
              className={inputCls}
              maxLength={LIMITS.name}
              value={v.name}
              onChange={(e) => onName(e.target.value)}
              placeholder="Contoh: Keripik Saleh Kering"
            />
            {fieldError("name")}
          </div>

          <div>
            <label className={labelCls + " mb-1.5 block"}>
              Slug {mode === "edit" && <span className="font-normal text-slate-400">(tidak bisa diubah)</span>}
            </label>
            <input
              className={inputCls}
              maxLength={LIMITS.slug}
              value={v.slug}
              disabled={mode === "edit"}
              placeholder="terisi otomatis dari nama"
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
            {fieldError("slug")}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls + " mb-1.5 block"}>Kategori</label>
              <select className={inputCls} value={v.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Pilih kategori…</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {fieldError("category")}
            </div>
            <div>
              <label className={labelCls + " mb-1.5 block"}>Badge</label>
              <select className={inputCls} value={v.badge} onChange={(e) => set("badge", e.target.value)}>
                {BADGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {fieldError("badge")}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls + " mb-1.5 block"}>Harga (Rp)</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate-400">Rp</span>
                <input
                  className={inputCls + " pl-10"}
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="16500"
                  value={v.price}
                  onChange={(e) => setV((prev) => ({ ...prev, price: onlyDigits(e.target.value), priceTouched: true }))}
                />
              </div>
              {mode === "edit" && initial && (
                <p className="mt-1.5 text-xs text-slate-500">Harga saat ini: {initial.price_label || initial.price || "-"}</p>
              )}
              {fieldError("price")}
            </div>
            <div>
              <label className={labelCls + " mb-1.5 block"}>Stok</label>
              <input
                className={inputCls}
                inputMode="numeric"
                maxLength={6}
                value={v.stock}
                onChange={(e) => set("stock", onlyDigits(e.target.value))}
              />
              {fieldError("stock")}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className={labelCls}>Deskripsi</label>
              <span className="text-xs text-slate-400">
                {v.description.length}/{LIMITS.description}
              </span>
            </div>
            <textarea
              className={inputCls}
              rows={5}
              maxLength={LIMITS.description}
              value={v.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Ceritakan produk, bahan, dan keunggulannya."
            />
            {fieldError("description")}
          </div>
        </section>

        <section className={cardCls + " h-fit"}>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Foto produk</h2>
            <p className="mt-0.5 text-sm text-slate-500">JPG, PNG, atau WebP. Maks. 2 MB.</p>
          </div>

          {v.image ? (
            <div className="relative overflow-hidden rounded-xl">
              <Thumb path={v.image} name={v.name || "Foto produk"} size="aspect-square w-full" />
              <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex-1 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:bg-white"
                >
                  Ganti
                </button>
                <button
                  type="button"
                  onClick={() => set("image", "")}
                  className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-white"
                >
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className={
                "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-12 text-center transition " +
                (dragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50")
              }
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
                <Icon name="upload" className="h-6 w-6" />
              </span>
              <span className="mt-3 text-sm font-medium text-slate-700">Klik atau seret foto ke sini</span>
              <span className="mt-1 text-xs text-slate-500">Rasio persegi paling rapi</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          {uploadError && <p className="mt-3 text-xs text-red-600">{uploadError}</p>}
          {fieldError("image")}

          <details className="mt-4 text-xs text-slate-500">
            <summary className="cursor-pointer select-none hover:text-slate-700">Isi path gambar manual</summary>
            <input
              className={inputCls + " mt-2"}
              maxLength={LIMITS.image}
              placeholder="/produks/nama-file.jpg"
              value={v.image}
              onChange={(e) => set("image", e.target.value)}
            />
          </details>
        </section>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Link href="/admin/dashboard/products" className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
          Batal
        </Link>
        <button
          disabled={saving || uploading}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {saving ? "Menyimpan…" : mode === "create" ? "Simpan produk" : "Simpan perubahan"}
        </button>
      </div>

      <ConfirmDialog
        open={!!pending}
        title="Unggah foto ini?"
        message="Foto akan diunggah ke server dan dipakai sebagai gambar produk."
        confirmLabel="Ya, unggah"
        loading={uploading}
        onConfirm={confirmUpload}
        onCancel={() => setPending(null)}
      >
        {pending && (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pending.preview} alt="Pratinjau foto" className="max-h-56 w-full rounded-xl bg-slate-50 object-contain ring-1 ring-slate-200" />
            <p className="mt-2 truncate text-xs text-slate-500">
              {pending.file.name} · {sizeLabel(pending.file.size)}
            </p>
          </div>
        )}
      </ConfirmDialog>
    </form>
  );
}