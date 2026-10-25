/* eslint-disable @next/next/no-img-element */
type Props = { className?: string; size?: string; pad?: string };

// Logo Sentra Oleh-Oleh Kebumen dalam kartu kaca gelap.
// Filter invert + hue-rotate membalik terang-gelap tetapi mempertahankan warna; mode "screen" membuat
// latar putih JPG hilang, sehingga teks cokelat dan hitam berubah terang dan terbaca di tema gelap.
export default function Logo({ className = "", size = "h-12", pad = "px-8 py-3.5" }: Props) {
  return (
    <div
      className={
        "relative isolate flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-zinc-900/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_24px_rgba(0,0,0,0.45)] backdrop-blur-md " +
        pad +
        " " +
        className
      }
    >
      <img
        src="/logo-plut.jpg"
        alt="Sentra Oleh-Oleh Kebumen, PLUT KUMKM dan INAmikro"
        className={"block w-auto " + size}
        style={{ filter: "invert(1) hue-rotate(180deg) brightness(1.2) saturate(1.3)", mixBlendMode: "screen" }}
      />
    </div>
  );
}