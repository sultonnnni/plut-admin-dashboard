// lib/api.ts (versi TOKEN / Bearer) — salin ke lib/api.ts, menggantikan versi cookie.
// Nama ekspor sama dengan versi cookie (login, logout, getCurrentUser, fetchAllProducts, dst.),
// jadi halaman login, gerbang dashboard, dan halaman produk tidak perlu diubah.
// Butuh: npm install axios
// .env.local:  NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
import axios, { AxiosError } from "axios";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

// Sesuaikan dengan `php artisan route:list`.
export const ENDPOINTS = {
  login: "/api/login",
  logout: "/api/logout",
  user: "/api/user",
  products: "/api/produk", // endpoint resmi (akhiran "k")
};

// ---------- token ----------
const TOKEN_KEY = "plut_admin_token";
const isBrowser = () => typeof window !== "undefined";

export const getToken = (): string | null => (isBrowser() ? window.localStorage.getItem(TOKEN_KEY) : null);
export const setToken = (t: string) => isBrowser() && window.localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => isBrowser() && window.localStorage.removeItem(TOKEN_KEY);

// ---------- error terstruktur ----------
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  const e = err as AxiosError<any>;
  if (!e?.response) {
    return new ApiError(
      `Tidak dapat terhubung ke API Laravel (${API_ORIGIN}). Pastikan "php artisan serve" berjalan dan CORS mengizinkan origin ${
        isBrowser() ? window.location.origin : "ini"
      }.`,
      0
    );
  }
  const { status, data } = e.response;
  if (status === 404) {
    return new ApiError(
      `Endpoint tidak ditemukan: ${(e.config?.method ?? "get").toUpperCase()} ${e.config?.url}. Cek "php artisan route:list --path=produks".`,
      404
    );
  }
  if (status === 401) return new ApiError("Sesi berakhir atau token tidak valid. Silakan login kembali.", 401);
  if (status === 403) return new ApiError("Akun ini tidak memiliki izin untuk aksi tersebut.", 403);
  if (status === 429) return new ApiError("Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.", 429);
  return new ApiError(data?.message || `Request gagal (HTTP ${status})`, status, data?.errors);
}

// ---------- instance axios ----------
export const http = axios.create({
  baseURL: API_ORIGIN,
  timeout: 15000,
  headers: { Accept: "application/json" },
  // Buang karakter BOM (U+FEFF) sebelum parse JSON.
  transformResponse: [
    (data) => {
      if (typeof data !== "string") return data;
      const t = data.replace(/^\uFEFF/, "").trim();
      if (!t) return null;
      try {
        return JSON.parse(t);
      } catch {
        return t;
      }
    },
  ],
});

// Lampirkan Bearer token di setiap request.
http.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = "Bearer " + token;
  return cfg;
});

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    const url = error.config?.url ?? "";
    // 401 di luar login = token kedaluwarsa/dicabut: hapus token dan kembali ke login.
    if (error.response?.status === 401 && url !== ENDPOINTS.login && isBrowser()) {
      clearToken();
      if (!window.location.pathname.startsWith("/admin/login")) window.location.href = "/admin/login";
    }
    throw toApiError(error);
  }
);

// ---------- auth ----------
export async function login(email: string, password: string) {
  const { data } = await http.post(ENDPOINTS.login, { email, password });
  const token = data?.token ?? data?.access_token ?? data?.data?.token;
  if (!token) throw new ApiError("Respons login tidak berisi token.", 500);
  setToken(token);
  return data?.user ?? data?.data?.user ?? null;
}

export async function logout() {
  try {
    await http.post(ENDPOINTS.logout); // cabut token di server
  } finally {
    clearToken();
  }
}

/** Dipakai gerbang dashboard: berhasil = token valid; gagal = belum login. */
export async function getCurrentUser() {
  if (!getToken()) throw new ApiError("Belum login.", 401);
  return (await http.get(ENDPOINTS.user)).data;
}

// ---------- model produk ----------
export type Product = {
  id: number;
  name: string;
  price: number | string;
  category?: string | null;
  description?: string | null;
  image?: string | null;
  badge?: string | null; // mis. "Bestseller", "Promo"
  stok: number;          // sisa barang (integer >= 0)
};
export type ProductInput = Omit<Product, "id">;

export function validateProduct(d: Partial<ProductInput>): Record<string, string[]> {
  const e: Record<string, string[]> = {};
  const add = (k: string, m: string) => (e[k] = [...(e[k] ?? []), m]);
  if (!String(d.name ?? "").trim()) add("name", "Nama produk wajib diisi.");
  const price = Number(d.price);
  if (d.price === undefined || (d.price as any) === "" || Number.isNaN(price) || price < 0)
    add("price", "Harga harus berupa angka >= 0.");
  const stok = Number(d.stok);
  if (d.stok === undefined || (d.stok as any) === "" || !Number.isInteger(stok) || stok < 0)
    add("stok", "Stok harus berupa bilangan bulat >= 0.");
  if (d.badge && String(d.badge).length > 50) add("badge", "Badge maksimal 50 karakter.");
  if (d.image && !/^(https?:\/\/|\/)/i.test(String(d.image).trim()))
    add("image", "Gambar harus berupa URL (http/https) atau path yang diawali '/'.");
  return e;
}

const emptyToNull = (v: unknown) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
};

function toPayload(d: Partial<ProductInput>): ProductInput {
  return {
    name: String(d.name ?? "").trim(),
    price: Number(d.price),
    category: emptyToNull(d.category),
    description: emptyToNull(d.description),
    image: emptyToNull(d.image),
    badge: emptyToNull(d.badge),
    stok: Math.trunc(Number(d.stok)),
  };
}

function assertValid(d: Partial<ProductInput>) {
  const errors = validateProduct(d);
  if (Object.keys(errors).length) throw new ApiError("Data produk belum valid.", 422, errors);
}

// MySQL kadang mengirim angka sebagai string; samakan tipenya.
const normalize = (p: any): Product => ({ ...p, stok: Number(p?.stok ?? 0), badge: p?.badge ?? null });
const unwrap = (res: any): any[] => (Array.isArray(res) ? res : res?.data ?? []);

// ---------- CRUD /produks ----------
/** Tarik seluruh katalog dengan menelusuri semua halaman paginasi Laravel. */
export async function fetchAllProducts(): Promise<Product[]> {
  const all: Product[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data } = await http.get(ENDPOINTS.products, { params: { page } });
    all.push(...unwrap(data).map(normalize));
    const last = data?.meta?.last_page ?? data?.last_page ?? 1;
    if (page >= last) break;
  }
  return all;
}

export async function getProduct(id: string | number): Promise<Product> {
  const { data } = await http.get(`${ENDPOINTS.products}/${id}`);
  return normalize(data?.data ?? data);
}

export async function createProduct(input: Partial<ProductInput>) {
  assertValid(input);
  return (await http.post(ENDPOINTS.products, toPayload(input))).data;
}

export async function updateProduct(id: string | number, input: Partial<ProductInput>) {
  assertValid(input);
  return (await http.put(`${ENDPOINTS.products}/${id}`, toPayload(input))).data;
}

export async function deleteProduct(id: string | number) {
  return (await http.delete(`${ENDPOINTS.products}/${id}`)).data;
}