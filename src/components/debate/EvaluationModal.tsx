"use client";

import { useState, useEffect } from "react";
import { X, Mic2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { evaluateDebateParticipantAction } from "@/features/debate/actions";

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentId: string;
  sessionId: string;
  initialData?: {
    fluency: number;
    argumentation: number;
    posture: number;
    feedback?: string | null;
  };
}

export function EvaluationModal({
  isOpen,
  onClose,
  studentName,
  studentId,
  sessionId,
  initialData,
}: EvaluationModalProps) {
  const [fluency, setFluency] = useState(initialData?.fluency ?? 5);
  const [argumentation, setArgumentation] = useState(initialData?.argumentation ?? 5);
  const [posture, setPosture] = useState(initialData?.posture ?? 7);
  const [feedback, setFeedback] = useState(initialData?.feedback ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFluency(initialData.fluency);
      setArgumentation(initialData.argumentation);
      setPosture(initialData.posture);
      setFeedback(initialData.feedback ?? "");
    }
  }, [initialData]);

  if (!isOpen) return null;

  async function handleSave() {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("sessionId", sessionId);
    formData.append("studentId", studentId);
    formData.append("fluency", fluency.toString());
    formData.append("argumentation", argumentation.toString());
    formData.append("posture", posture.toString());
    formData.append("feedback", feedback);

    try {
      await evaluateDebateParticipantAction(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save evaluation", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl h-[90vh] md:h-auto overflow-y-auto rounded-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col">
        
        <form action={async (formData) => {
          await evaluateDebateParticipantAction(formData);
          onClose();
        }} className="flex flex-col h-full">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Avaliação de Fala</h3>
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-1">
                {studentName}
              </p>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-8 flex-1 overflow-y-auto">
            <input type="hidden" name="sessionId" value={sessionId} />
            <input type="hidden" name="studentId" value={studentId} />
            
            {/* Fluência */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Fluência e Vocabulário
                </label>
                <span className="text-rose-600 font-black">{fluency}</span>
                <input type="hidden" name="fluency" value={fluency} />
              </div>
              <input 
                type="range" 
                min="1" max="10" 
                value={fluency}
                onChange={(e) => setFluency(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>

            {/* Argumentação */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Poder de Argumentação
                </label>
                <span className="text-rose-600 font-black">{argumentation}</span>
                <input type="hidden" name="argumentation" value={argumentation} />
              </div>
              <input 
                type="range" 
                min="1" max="10" 
                value={argumentation}
                onChange={(e) => setArgumentation(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>

            {/* Postura */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Postura e Engajamento
              </label>
              <input type="hidden" name="posture" value={posture} />
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Tímido", value: 3 },
                  { label: "Equilibrado", value: 7 },
                  { label: "Dominante", value: 10 }
                ].map((p) => (
                  <button 
                    key={p.value}
                    type="button"
                    onClick={() => setPosture(p.value)}
                    className={`p-3 rounded-2xl text-[9px] font-black uppercase transition-all border-2 ${
                      posture === p.value 
                        ? "border-rose-500 bg-rose-50 text-rose-600" 
                        : "border-slate-100 text-slate-400 bg-white hover:border-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Feedback Rápido
              </label>
              <textarea
                name="feedback"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium h-24 outline-none focus:border-rose-500 transition-all"
                placeholder="Ex: Melhorou muito na dicção, mas precisa ouvir mais os colegas."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100">
            <PrimaryButton 
              tone="rose" 
              className="w-full py-4 shadow-xl shadow-rose-200"
              type="submit"
            >
              Salvar Avaliação
            </PrimaryButton>
          </div>
        </form>      </div>
    </div>
  );
}
