// Pembersihan input di dashboard. Server membersihkan lagi sebagai lapis kedua.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const stripTags = (s: string) => s.replace(/<\/?[a-zA-Z!][^>]*>/g, "");
export const stripControl = (s: string) => s.replace(CONTROL, "");

/** Satu baris: tanpa tag, spasi berlebih dirapikan. */
export const cleanLine = (s: string) => stripControl(stripTags(String(s ?? ""))).replace(/\s+/g, " ").trim();

/** Teks panjang: baris baru dipertahankan, maksimal satu baris kosong berturut-turut. */
export const cleanText = (s: string) =>
  stripControl(stripTags(String(s ?? "")))
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/** Path gambar yang aman: tanpa skema berbahaya, tanpa "..", tanpa spasi. */
export function cleanImagePath(s: string): string {
  const v = cleanLine(s);
  if (!v) return "";
  if (/^(javascript|data|vbscript|file):/i.test(v) || v.includes("..") || /\s/.test(v)) return "";
  return v;
}

export const LIMITS = { name: 120, slug: 120, description: 2000, image: 255 } as const;