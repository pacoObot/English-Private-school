"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { updateDebateSessionStatusAction } from "@/features/debate/actions";
import { DebateSessionStatus } from "@/generated/prisma";

interface DebateStatusControlProps {
  id: string;
  status: DebateSessionStatus;
}

export function DebateStatusControl({ id, status }: DebateStatusControlProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === DebateSessionStatus.CLOSED) return null;

  const handleAction = async (e: React.FormEvent) => {
    if (status === DebateSessionStatus.ACTIVE && !showConfirm) {
      e.preventDefault();
      setShowConfirm(true);
      return;
    }
    setIsSubmitting(true);
  };

  return (
    <>
      <form 
        action={updateDebateSessionStatusAction} 
        onSubmit={handleAction}
        className="ml-auto"
      >
        <input type="hidden" name="id" value={id} />
        <input 
          type="hidden" 
          name="status" 
          value={status === DebateSessionStatus.SCHEDULED ? DebateSessionStatus.ACTIVE : DebateSessionStatus.CLOSED} 
        />
        <PrimaryButton 
          tone="rose" 
          className="min-h-10 py-2 px-4 text-[10px]" 
          type="submit"
          disabled={isSubmitting}
        >
          {status === DebateSessionStatus.SCHEDULED ? "Iniciar Debate" : "Fechar Sessão"}
        </PrimaryButton>
      </form>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white w-full max-w-md overflow-hidden rounded-[2.5rem] shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-slate-900">Encerrar Sessão de Debate?</h4>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Tem certeza de que deseja fechar esta sessão? Uma vez fechada, não será possível adicionar novos participantes nem alterar as avaliações desta Arena.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <form 
                action={updateDebateSessionStatusAction} 
                className="flex-1"
                onSubmit={() => setIsSubmitting(true)}
              >
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="status" value={DebateSessionStatus.CLOSED} />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all disabled:opacity-50"
                >
                  Confirmar Fecho
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
