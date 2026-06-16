import type { Metadata } from "next";
import "./globals.css";
import { getCurrentSession } from "@/features/auth/current-user";
import { PWARegistration } from "@/components/pwa/PWARegistration";

export const metadata: Metadata = {
  title: "Delson PS Academic",
  description: "Sistema de gestao academica da Delson Private School",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DelsonPS",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getCurrentSession();

  return (
    <html lang="pt-PT">
      <body className="custom-scrollbar">
        <PWARegistration userId={session?.userId} />
        {children}
      </body>
    </html>
  );
}
