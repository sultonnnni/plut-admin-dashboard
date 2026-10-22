import { ApiError, ENDPOINTS, http } from "@/lib/api";

// Struktur mengikuti tabel `produks` (produks.sql dari Mas Vito).
export const CATEGORIES = [
  { label: "Camilan", id: "camilan" },
  { label: "Aksesori & Kerajinan", id: "aksesori-dan-kerajinan" },
  { label: "Manisan & Kue", id: "manisan-dan-kue" },
  { label: "Minuman Rempah", id: "minuman-rempah" },
  { label: "Madu & Pemanis", id: "madu-dan-pemanis" },
  { label: "Lauk & Dapur", id: "lauk-dan-dapur" },
  { label: "Kopi & Cokelat", id: "kopi-dan-cokelat" },
];
export const BADGES = ["Produk Unggulan", "Best Seller", "Pilihan Kurator"];
export const LOW_STOCK = 10;

export type Produk = {
  id: number;
  slug: string;
  name: string;
  category: string;
  category_id: string | null;
  price: string;
  price_label: string | null;
  image: string | null;
  description: string | null;
  stock: number;
  badge: string;
  bestseller: boolean;
  umkm: string | null;
};

export type ProdukValues = {
  name: string;
  slug: string;
  category: string;
  price: string; // angka saja, mis. "16500"
  priceTouched: boolean;
  stock: string;
  badge: string;
  image: string;
  description: string;
};

export const onlyDigits = (s: string) => String(s ?? "").replace(/\D/g, "");
export const rupiah = (digits: string | number) => "Rp " + Number(digits).toLocaleString("id-ID");
export const displayPrice = (p: Produk) => p.price_label || p.price || "-";
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const categoryId = (label: string) => CATEGORIES.find((c) => c.label === label)?.id ?? slugify(label);

// Toleran terhadap perbedaan nama field dari ProdukResource.
const normalize = (p: any): Produk => ({
  id: Number(p?.id),
  slug: p?.slug ?? "",
  name: p?.name ?? p?.nama ?? "",
  category: p?.category ?? "",
  category_id: p?.category_id ?? p?.categoryId ?? null,
  price: String(p?.price ?? ""),
  price_label: p?.price_label ?? p?.priceLabel ?? null,
  image: p?.image ?? null,
  description: p?.description ?? null,
  stock: Number(p?.stock ?? p?.stok ?? 0),
  badge: p?.badge ?? "",
  bestseller: Boolean(p?.bestseller),
  umkm: p?.umkm ?? null,
});
const list = (d: any): any[] => (Array.isArray(d) ? d : d?.data ?? []);

export function validateProduk(v: ProdukValues, mode: "create" | "edit") {
  const e: Record<string, string[]> = {};
  const add = (k: string, m: string) => (e[k] = [...(e[k] ?? []), m]);
  if (!v.name.trim()) add("name", "Nama produk wajib diisi.");
  if (mode === "create" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug))
    add("slug", "Slug hanya boleh huruf kecil, angka, dan tanda hubung.");
  if (!v.category.trim()) add("category", "Pilih kategori.");
  if (mode === "create" || v.priceTouched) {
    const n = Number(onlyDigits(v.price));
    if (!n || n <= 0) add("price", "Harga harus berupa angka lebih dari 0.");
  }
  if (!/^\d+$/.test(String(v.stock).trim())) add("stock", "Stok harus bilangan bulat 0 atau lebih.");
  if (!v.badge.trim()) add("badge", "Badge wajib dipilih.");
  if (!/^(https?:\/\/|\/)/i.test(v.image.trim())) add("image", "Gambar harus berupa path (diawali /) atau URL http(s).");
  if (!v.description.trim()) add("description", "Deskripsi wajib diisi.");
  return e;
}

function assertValid(v: ProdukValues, mode: "create" | "edit") {
  const errors = validateProduk(v, mode);
  if (Object.keys(errors).length) throw new ApiError("Data produk belum valid.", 422, errors);
}

export async function fetchAllProduk(): Promise<Produk[]> {
  const { data } = await http.get(ENDPOINTS.products);
  return list(data).map(normalize);
}

export async function getProduk(id: string | number): Promise<Produk> {
  const { data } = await http.get(`${ENDPOINTS.products}/${id}`);
  return normalize(data?.data ?? data);
}

export async function createProduk(v: ProdukValues) {
  assertValid(v, "create");
  const digits = onlyDigits(v.price);
  // store() di backend hanya menyimpan 7 field ini.
  const res = await http.post(ENDPOINTS.products, {
    slug: v.slug,
    name: v.name.trim(),
    category: v.category,
    category_id: categoryId(v.category),
    price: digits,
    image: v.image.trim(),
    description: v.description.trim(),
  });
  let id = res.data?.data?.id ?? res.data?.id;
  try {
    if (!id) id = (await http.get(`${ENDPOINTS.products}/${encodeURIComponent(v.slug)}`)).data?.data?.id;
    // Badge, stok, dan label harga disimpan lewat update().
    await http.put(`${ENDPOINTS.products}/${id}`, {
      badge: v.badge,
      stock: Number(v.stock),
      price_label: rupiah(digits),
    });
  } catch {
    throw new ApiError("Produk sudah dibuat, tetapi badge dan stok belum tersimpan. Buka halaman edit untuk melengkapinya.", 202);
  }
  return res.data;
}

export async function updateProduk(id: string | number, v: ProdukValues) {
  assertValid(v, "edit");
  const body: Record<string, unknown> = {
    name: v.name.trim(),
    category: v.category,
    category_id: categoryId(v.category),
    image: v.image.trim(),
    description: v.description.trim(),
    badge: v.badge,
    stock: Number(v.stock),
  };
  // Harga hanya dikirim bila diubah, agar teks lama ("Mulai Rp ...") tidak rusak.
  if (v.priceTouched) {
    body.price = onlyDigits(v.price);
    body.price_label = rupiah(onlyDigits(v.price));
  }
  return (await http.put(`${ENDPOINTS.products}/${id}`, body)).data;
}

export const deleteProduk = (id: string | number) => http.delete(`${ENDPOINTS.products}/${id}`);
// ---------- gambar & unggah foto ----------
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

/** Alamat lengkap gambar untuk pratinjau di dashboard. */
export function imageUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/storage/")) return API_ORIGIN + path; // diunggah lewat plut-api
  return SITE_ORIGIN + (path.startsWith("/") ? path : "/" + path); // gambar bawaan web publik
}

/** Unggah foto ke plut-api, mengembalikan path yang disimpan di kolom image. */
export async function uploadImage(file: File, slug: string): Promise<string> {
  const body = new FormData();
  body.append("image", file);
  body.append("slug", slug);
  const { data } = await http.post("/api/upload/produk", body);
  if (!data?.path) throw new ApiError("Respons unggah tidak berisi path gambar.", 500);
  return data.path as string;
}