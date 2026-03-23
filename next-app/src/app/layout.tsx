import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BG Remover — One-Click Image Background Removal",
  description: "Remove image backgrounds in one click — free, fast, no storage. Powered by Cloudflare + Remove.bg API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
