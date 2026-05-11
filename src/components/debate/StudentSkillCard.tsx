"use client";

import { Mic2, MessageSquare, UserCheck, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

type SkillMetricProps = {
  label: string;
  value: number; // 1 to 10
  icon: any;
  color: string;
};

function SkillBar({ label, value, icon: Icon, color }: SkillMetricProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg", color)}>
            <Icon size={14} className="text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
        </div>
        <span className="text-xs font-black text-navy">{value}/10</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", color.replace("text-white", ""))} 
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

export function StudentSkillCard({ 
  fluency, 
  argumentation, 
  posture 
}: { 
  fluency: number; 
  argumentation: number; 
  posture: number;
}) {
  const average = ((fluency + argumentation + posture) / 3).toFixed(1);

  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white shadow-lg shadow-navy/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">Métrica de Performance</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Debate Arena v2</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-slate-400">Média Geral</p>
          <p className="text-2xl font-black text-crimson">{average}</p>
        </div>
      </div>

      <div className="space-y-5">
        <SkillBar label="Fluência e Pronúncia" value={fluency} icon={Mic2} color="bg-navy" />
        <SkillBar label="Argumentação Crítica" value={argumentation} icon={MessageSquare} color="bg-crimson" />
        <SkillBar label="Postura e Linguagem" value={posture} icon={UserCheck} color="bg-slate-800" />
      </div>
    </div>
  );
}
