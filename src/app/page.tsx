"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/dashboard");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-500">Mengalihkan ke dashboard…</p>
    </main>
  );
}
