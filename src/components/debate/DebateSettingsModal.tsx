"use client";

import { X, Settings } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { updateDebateSessionDetailsAction } from "@/features/debate/actions";

interface DebateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  debateId: string;
  topic: string;
  startsAt: string; // no formato 'yyyy-MM-ddThh:mm'
  capacity: number;
  location: string;
}

export function DebateSettingsModal({
  isOpen,
  onClose,
  debateId,
  topic,
  startsAt,
  capacity,
  location,
}: DebateSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        <form 
          action={async (formData) => {
            try {
              // Executa a action
              await updateDebateSessionDetailsAction(formData);
              onClose();
            } catch (error) {
              console.error("Failed to update debate details", error);
            }
          }}
          className="flex flex-col h-full"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center text-navy">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Ajustes da Sessão</h3>
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-0.5">
                  Editar parâmetros do debate
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4 flex-1">
            <input type="hidden" name="id" value={debateId} />
            
            <FormField name="topic" label="Tema do Debate" defaultValue={topic} required />
            
            <FormField 
              name="startsAt" 
              label="Data e Hora de Início" 
              type="datetime-local" 
              defaultValue={startsAt} 
              required 
            />
            
            <FormField 
              name="capacity" 
              label="Capacidade de Alunos" 
              type="number" 
              defaultValue={String(capacity)} 
              min={1} 
              required 
            />
            
            <FormField name="location" label="Local" defaultValue={location} />
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-slate-200 rounded-xl text-xs font-black text-slate-500 bg-white hover:bg-slate-50 transition-all uppercase tracking-widest"
            >
              Cancelar
            </button>
            <PrimaryButton 
              tone="navy" 
              className="flex-1 py-3.5 shadow-xl shadow-slate-200"
              type="submit"
            >
              Guardar Ajustes
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
