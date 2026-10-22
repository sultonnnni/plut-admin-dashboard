import { redirect } from "next/navigation";

// Gerbang utama: root URL selalu diarahkan ke halaman login admin.
export default function Home() {
  redirect("/admin/login");
}