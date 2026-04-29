import type { ReactNode } from "react";
import { Languages, MessageCircle, Quote } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-5">
      <Languages className="absolute left-6 top-16 text-crimson/10" size={82} />
      <MessageCircle className="absolute right-6 top-32 text-navy/10" size={72} />
      <Quote className="absolute bottom-16 left-4 text-crimson/10" size={98} />
      <MessageCircle className="absolute bottom-20 right-5 text-navy/10" size={94} />
      {children}
    </main>
  );
}
