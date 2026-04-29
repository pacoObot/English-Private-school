import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Delson PS Academic",
  description: "Sistema de gestao academica da Delson Private School"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body className="custom-scrollbar">{children}</body>
    </html>
  );
}
