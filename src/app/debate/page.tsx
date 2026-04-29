"use client";

import type { ReactNode } from "react";
import { CalendarClock, MessageSquarePlus, Mic2, Plus, SlidersHorizontal, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { DataTable } from "@/components/ui/DataTable";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { debateNav, debateStudents } from "@/lib/mock-data";

export default function DebatePage() {
  return (
    <DashboardLayout
      navItems={debateNav}
      title="Sessoes de Debate"
      subtitle="Debate Instructor · avaliacao de fala"
      context="Debate Arena"
      headerAction={<PrimaryButton tone="rose"><Plus size={15} /> <span className="hidden sm:inline">Novo Debate</span></PrimaryButton>}
      sidebarFooter={<InstructorFooter />}
    >
      <div className="space-y-6">
        <BentoCard dark className="relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black tracking-tight">Proximo Debate Presencial</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
              <DebateInfo icon={<CalendarClock size={18} />} label="Horario" value="Hoje, 19:30 - 21:00" />
              <DebateInfo icon={<Users size={18} />} label="Vagas" value="12 / 15 Inscritos" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-4 rotate-12 text-7xl font-black text-white/5 sm:text-9xl">DEBATE</div>
        </BentoCard>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {debateStudents.map((student) => (
            <BentoCard key={student.name}>
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="font-black text-slate-900">{student.name}</h3>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Sessao atual</p>
                </div>
                <StatusBadge tone="danger">Avaliar</StatusBadge>
              </div>
              <Score label="Fluencia" value={student.fluency} />
              <Score label="Argumentacao" value={student.argument} />
              <Score label="Postura" value={student.posture} />
              <PrimaryButton className="mt-6 w-full" tone="dark">
                <Mic2 size={15} /> Abrir Avaliacao
              </PrimaryButton>
            </BentoCard>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BentoCard>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-black text-slate-800">Agendar Debate</h3>
              <MessageSquarePlus className="text-crimson" />
            </div>
            <form className="space-y-4">
              <FormField label="Tema do Debate" placeholder="Ex: Impacto da IA na Educacao" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Data" type="date" />
                <FormField label="Capacidade" defaultValue="15" />
              </div>
              <PrimaryButton className="w-full" tone="rose" type="button">Criar Sessao</PrimaryButton>
            </form>
          </BentoCard>

          <BentoCard className="p-0">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-800">Historico</h3>
              <SlidersHorizontal size={18} className="text-slate-400" />
            </div>
            <DataTable
              headers={["Aluno", "Fluencia", "Argumentacao", "Postura"]}
              rows={debateStudents.map((student) => [student.name, student.fluency, student.argument, student.posture])}
            />
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DebateInfo({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-rose-400">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-crimson">{value}/10</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-crimson" style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}

function InstructorFooter() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
      <div className="h-10 w-10 rounded-full bg-rose-100" />
      <div>
        <p className="text-xs font-black uppercase text-slate-800">Instrutor Debate</p>
        <p className="text-[9px] font-bold uppercase text-emerald-500">Online</p>
      </div>
    </div>
  );
}
