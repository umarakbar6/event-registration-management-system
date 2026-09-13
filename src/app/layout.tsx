import type { Metadata } from "next";
import { Toaster } from "sonner";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = { title: "Gatherly | Event registration made clear", description: "Discover events, manage attendance, and keep every registration in view." };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return <html lang="en"><body><AppShell user={user}>{children}</AppShell><Toaster position="top-right" richColors /></body></html>;
}
