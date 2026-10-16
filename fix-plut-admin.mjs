// Jalankan dari ROOT proyek plut-admin-dashboard:  node fix-plut-admin.mjs
// Mendeteksi app/ vs src/app/, next.config.(ts|js|mjs) dan versi Tailwind.
// Setiap file yang diubah dicadangkan dulu sebagai <nama>.bak
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exists = (p) => fs.existsSync(path.join(root, p));
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const log = (m) => console.log(m);

function write(p, content) {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  if (fs.existsSync(full)) fs.copyFileSync(full, full + ".bak");
  fs.writeFileSync(full, content, "utf8");
  log(`  ditulis: ${p}`);
}

if (!exists("package.json")) {
  console.error("package.json tidak ditemukan. Jalankan dari root proyek Next.js.");
  process.exit(1);
}

// ---------- deteksi struktur ----------
const appDir = exists("src/app") ? "src/app" : "app";
const pkg = JSON.parse(read("package.json"));
const twRaw = (pkg.dependencies?.tailwindcss ?? pkg.devDependencies?.tailwindcss ?? "").replace(/[^\d.]/g, "");
const twMajor = twRaw ? parseInt(twRaw.split(".")[0], 10) : 0;
const configFile = ["next.config.ts", "next.config.mjs", "next.config.js"].find(exists);

log(`Struktur : ${appDir}/`);
log(`Tailwind : ${twMajor ? "v" + twMajor : "TIDAK TERPASANG"}`);
log(`Config   : ${configFile ?? "tidak ada"}\n`);

// ---------- 1. page.tsx : auto-redirect ----------
write(
  `${appDir}/page.tsx`,
  `"use client";

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
`
);

// ---------- 2. layout.tsx : pastikan globals.css diimpor ----------
write(
  `${appDir}/layout.tsx`,
  `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Login Admin | PLUT Kebumen",
  description: "Halaman masuk dasbor admin PLUT Kebumen.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={\`\${geistSans.variable} \${geistMono.variable} h-full antialiased\`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
`
);

// ---------- 3. Tailwind di globals.css ----------
const cssPath = `${appDir}/globals.css`;
const hasTw = (css) => /@import\s+["']tailwindcss["']|@tailwind\s+base/.test(css);
const v4Base = `@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}
`;
const v3Base = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

if (!exists(cssPath)) {
  write(cssPath, twMajor >= 4 ? v4Base : v3Base);
} else if (!hasTw(read(cssPath))) {
  // sisipkan di baris paling atas (@import wajib di awal file); isi lama dipertahankan
  write(cssPath, (twMajor >= 4 ? `@import "tailwindcss";\n\n` : v3Base + "\n") + read(cssPath));
} else {
  log(`  ${cssPath}: direktif Tailwind sudah ada, tidak diubah`);
}

// postcss untuk Tailwind v4
if (twMajor >= 4 && !["postcss.config.mjs", "postcss.config.js", "postcss.config.cjs", ".postcssrc.json"].some(exists)) {
  write("postcss.config.mjs", `const config = {\n  plugins: { "@tailwindcss/postcss": {} },\n};\n\nexport default config;\n`);
}

// ---------- 4. next.config: allowedDevOrigins ----------
const origins = `allowedDevOrigins: ["127.0.0.1", "localhost"],`;
if (!configFile) {
  write(
    "next.config.ts",
    `import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {\n  ${origins}\n};\n\nexport default nextConfig;\n`
  );
} else {
  const src = read(configFile);
  if (/allowedDevOrigins/.test(src)) {
    log(`  ${configFile}: allowedDevOrigins sudah ada, tidak diubah`);
  } else if (/(=\s*\{|module\.exports\s*=\s*\{|export default\s*\{)/.test(src)) {
    write(configFile, src.replace(/(=\s*\{|module\.exports\s*=\s*\{|export default\s*\{)/, `$1\n  ${origins}`));
  } else {
    log(`  ${configFile}: pola objek config tidak dikenali. Tambahkan manual: ${origins}`);
  }
}

// ---------- pemeriksaan paket ----------
log("");
const missing = [];
if (twMajor === 0) missing.push("tailwindcss @tailwindcss/postcss postcss");
else if (twMajor >= 4 && !exists("node_modules/@tailwindcss/postcss")) missing.push("@tailwindcss/postcss");
if (missing.length) log(`Paket kurang. Jalankan:  npm install -D ${missing.join(" ")}`);
if (twMajor > 0 && twMajor < 4) log("Tailwind v3: pastikan tailwind.config.* memuat content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}']");

log("\nSelesai. Hapus cache lalu jalankan ulang:");
log("  rmdir /s /q .next   (PowerShell: Remove-Item -Recurse -Force .next)");
log("  npm run dev");
