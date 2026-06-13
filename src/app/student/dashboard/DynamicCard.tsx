"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, Mic2, ArrowRight, Calendar, Users, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

type DebateData = {
  id: string;
  topic: string;
  startsAt: string;
  capacity: number;
  location: string | null;
  role: "moderator" | "participant" | "open" | null;
};

type DynamicCardProps = {
  monthName: string;
  pendingAmount: number;
  isPaid: boolean;
  daysRemainingText: string;
  debate: DebateData | null;
};

export function DynamicCard({
  monthName,
  pendingAmount,
  isPaid,
  daysRemainingText,
  debate,
}: DynamicCardProps) {
  const [activeSlide, setActiveSlide] = useState<"treasury" | "debate">("treasury");

  useEffect(() => {
    // Only auto-rotate if there is a debate to show, otherwise stay on treasury
    if (!debate) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === "treasury" ? "debate" : "treasury"));
    }, 6000); // Swap every 6 seconds for better reading time

    return () => clearInterval(interval);
  }, [debate]);

  return (
    <div className="lg:col-span-4 min-h-[220px] relative rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden group shadow-sm">
      
      {/* Slide 1: Treasury Card */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
          activeSlide === "treasury" 
            ? "opacity-100 scale-100 z-10 pointer-events-auto" 
            : "opacity-0 scale-95 z-0 pointer-events-none"
        }`}
      >
        <Link href="/student/treasury" className="block h-full">
          <BentoCard className="bg-gradient-to-br from-navy to-blue-600 text-white h-full relative overflow-hidden flex flex-col justify-between" dark>
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md mb-4 group-hover:scale-110 transition-transform">
                <Wallet size={20} />
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Tesouraria • {monthName}</p>
                  <h3 className="mt-1 text-2xl font-black">{pendingAmount.toLocaleString()} MT</h3>
                </div>
                <StatusBadge tone={isPaid ? "success" : "warning"}>
                  {isPaid ? "Pago" : "Pendente"}
                </StatusBadge>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
               <p className="text-[9px] font-black uppercase text-blue-100/60 tracking-widest flex items-center gap-1">
                  <AlertCircle size={10} /> {daysRemainingText}
               </p>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white mt-0.5">
                  Gerir Pagamentos <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
            {/* Background Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />
          </BentoCard>
        </Link>
      </div>

      {/* Slide 2: Next Debate Card */}
      {debate && (
        <div 
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            activeSlide === "debate" 
              ? "opacity-100 scale-100 z-10 pointer-events-auto" 
              : "opacity-0 scale-95 z-0 pointer-events-none"
          }`}
        >
          <Link href={`/student/debates`} className="block h-full">
            <BentoCard className="bg-gradient-to-br from-slate-900 to-rose-950 text-white h-full relative overflow-hidden flex flex-col justify-between" dark>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md group-hover:scale-110 transition-transform">
                    <Mic2 size={20} className="text-rose-400" />
                  </div>
                  
                  {debate.role === "moderator" ? (
                    <StatusBadge tone="danger">És o Instrutor</StatusBadge>
                  ) : debate.role === "participant" ? (
                    <StatusBadge tone="success">Inscrito</StatusBadge>
                  ) : (
                    <StatusBadge tone="navy">Disponível</StatusBadge>
                  )}
                </div>
                
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-300/80">Arena de Oratória • Debate</p>
                  <h3 className="mt-1 text-sm font-extrabold line-clamp-2 leading-snug group-hover:text-rose-300 transition-colors">
                    {debate.topic}
                  </h3>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-rose-300/50 uppercase">Data & Hora</span>
                  <span className="text-[10px] font-bold text-slate-200">
                    {new Date(debate.startsAt).toLocaleDateString("pt-PT")} às {new Date(debate.startsAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-400 shrink-0">
                  Participar <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              
              {/* Background Decorative Element */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/10 rounded-full blur-xl" />
            </BentoCard>
          </Link>
        </div>
      )}

      {/* Manual Swapper Buttons (Dots) */}
      {debate && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
          <button 
            onClick={() => setActiveSlide("treasury")}
            aria-label="Ver tesouraria"
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              activeSlide === "treasury" ? "bg-white w-3" : "bg-white/40 hover:bg-white/60"
            }`}
          />
          <button 
            onClick={() => setActiveSlide("debate")}
            aria-label="Ver debate"
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              activeSlide === "debate" ? "bg-white w-3" : "bg-white/40 hover:bg-white/60"
            }`}
          />
        </div>
      )}

    </div>
  );
}
