import { ReactNode } from "react";
import { ToastProvider } from "@/components/Toast";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}