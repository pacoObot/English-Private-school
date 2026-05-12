import type { ReactNode } from "react";
import { Languages, MessageCircle, Quote, Send, Headset } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-5">
      {/* Ícones flutuantes decorativos (Red & Blue) */}
      <MessageCircle className="absolute top-[10%] left-[8%] text-rose-600/10 -rotate-[15deg]" size={82} />
      <Send className="absolute bottom-[12%] right-[7%] text-navy/10 rotate-[15deg]" size={98} />
      <MessageCircle className="absolute top-[25%] right-[12%] text-navy/10 rotate-[10deg]" size={72} />
      <Quote className="absolute bottom-[18%] left-[5%] text-rose-600/10 -rotate-[10deg]" size={110} />
      <Headset className="absolute top-[55%] left-[3%] text-navy/10" size={54} />
      <Languages className="absolute top-[40%] right-[4%] text-rose-600/10" size={62} />
      
      {children}
    </main>
  );
}
