"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Calendar, Clock, Mic2, Users, ArrowRight, Send, MessageSquare } from "lucide-react";
import { proposeDebateTopic } from "@/features/debate/actions";

type Debate = {
  id: string;
  topic: string;
  startsAt: Date;
  capacity: number;
};

export function UpcomingDebatesButton({ debates }: { debates: Debate[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handlePropose = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await proposeDebateTopic(formData);
    setLoading(false);
    if (result.success) {
      setMessage("Sugestão enviada com sucesso!");
      setTimeout(() => {
        setIsSuggesting(false);
        setMessage(null);
        setIsOpen(false);
      }, 2000);
    } else {
      setMessage(result.message || "Erro ao enviar sugestão.");
    }
  };

  return (
    <>
      <PrimaryButton tone="dark" className="w-full" onClick={() => { setIsOpen(true); setIsSuggesting(false); setMessage(null); }}>
        <Calendar size={16} /> Próximo Debate
      </PrimaryButton>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={isSuggesting ? "Sugerir Tema" : "Próximo Debate"}
        description={isSuggesting ? "Proponha um assunto para a Arena" : "Arena de Oratória & Argumentação"}
        className="max-w-md"
      >
        <div className="relative overflow-hidden">
          {/* Background Decorative Icons */}
          <Mic2 className="absolute -top-10 -right-10 w-32 h-32 text-slate-50 rotate-12" />
          <MessageSquare className="absolute -bottom-10 -left-10 w-24 h-24 text-slate-50 -rotate-12" />

          <div className="relative z-10 space-y-4">
            {isSuggesting ? (
              <form onSubmit={handlePropose} className="space-y-4">
                {message && (
                  <div className={`p-4 rounded-2xl text-xs font-black uppercase text-center ${message.includes("sucesso") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                    {message}
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Título do Tema</label>
                  <input 
                    name="topic" 
                    required 
                    placeholder="Ex: Inteligência Artificial na Arte"
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy/5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Por que este tema?</label>
                  <textarea 
                    name="reason" 
                    rows={3}
                    placeholder="Descreva brevemente por que este debate seria interessante..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy/5"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <PrimaryButton type="button" tone="light" className="flex-1" onClick={() => setIsSuggesting(false)}>
                    Cancelar
                  </PrimaryButton>
                  <PrimaryButton type="submit" tone="navy" className="flex-1" disabled={loading}>
                    <Send size={14} /> {loading ? "Enviando..." : "Enviar"}
                  </PrimaryButton>
                </div>
              </form>
            ) : debates.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="mx-auto text-slate-200 mb-3" size={48} />
                <p className="text-sm font-bold text-slate-400 italic mb-6">Nenhum debate agendado para os próximos dias.</p>
                <PrimaryButton tone="rose" className="w-full py-4 rounded-2xl" onClick={() => setIsSuggesting(true)}>
                  <MessageSquare size={16} /> Sugerir um Tema
                </PrimaryButton>
              </div>
            ) : (
              <>
                {debates.map((debate) => (
                  <div key={debate.id} className="group p-5 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-navy/20 transition-all">
                    <div className="flex justify-between items-start mb-3">
                       <span className="px-3 py-1 rounded-full bg-navy/5 text-navy text-[9px] font-black uppercase tracking-widest">
                          Inscrições Abertas
                       </span>
                       <div className="flex items-center gap-1 text-[10px] font-black text-slate-400">
                          <Users size={12} /> {debate.capacity} Lugares
                       </div>
                    </div>
                    <h4 className="font-black text-slate-900 leading-tight group-hover:text-navy transition-colors">{debate.topic}</h4>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                             <span className="text-[8px] font-black text-slate-400 uppercase">Data</span>
                             <span className="text-xs font-bold text-slate-700">{new Date(debate.startsAt).toLocaleDateString("pt-PT")}</span>
                          </div>
                          <div className="flex flex-col border-l border-slate-200 pl-3">
                             <span className="text-[8px] font-black text-slate-400 uppercase">Horário</span>
                             <span className="text-xs font-bold text-slate-700">{new Date(debate.startsAt).toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                       </div>
                       <ArrowRight size={18} className="text-slate-300 group-hover:text-navy group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-center">
                   <button 
                     onClick={() => setIsSuggesting(true)}
                     className="text-[10px] font-black uppercase text-slate-400 hover:text-navy transition-colors"
                   >
                     Não gosta destes temas? Sugira um novo
                   </button>
                </div>
              </>
            )}
            
            {!isSuggesting && (
              <div className="pt-4">
                <PrimaryButton tone="light" className="w-full py-4 rounded-2xl" onClick={() => setIsOpen(false)}>
                   Fechar
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
