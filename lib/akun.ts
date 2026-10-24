import { http } from "@/lib/api";

export async function requestPasswordReset(email: string): Promise<string> {
  const { data } = await http.post("/api/forgot-password", { email });
  return data?.message ?? "Jika email terdaftar, tautan untuk mengatur ulang password sudah dikirim.";
}

export async function resetPassword(p: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<string> {
  const { data } = await http.post("/api/reset-password", p);
  return data?.message ?? "Password berhasil diubah.";
}

export const passwordChecks = (pw: string) => [
  { label: "Minimal 8 karakter", ok: pw.length >= 8 },
  { label: "Huruf besar dan huruf kecil", ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
  { label: "Mengandung angka", ok: /\d/.test(pw) },
];