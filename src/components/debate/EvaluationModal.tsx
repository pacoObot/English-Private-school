"use client";

import { useState, useEffect } from "react";
import { X, Mic2, Send, ChevronRight, VolumeX, MessageSquare, Zap } from "lucide-react";
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
    isPrivate?: boolean;
  };
  onSave?: (formData: FormData) => Promise<void>;
  isWizard?: boolean;
}

export function EvaluationModal({
  isOpen,
  onClose,
  studentName,
  studentId,
  sessionId,
  initialData,
  onSave,
  isWizard,
}: EvaluationModalProps) {
  const [fluency, setFluency] = useState(initialData?.fluency ?? 5);
  const [argumentation, setArgumentation] = useState(initialData?.argumentation ?? 5);
  const [posture, setPosture] = useState(initialData?.posture ?? 7);
  const [feedback, setFeedback] = useState(initialData?.feedback ?? "");
  const [isPrivate, setIsPrivate] = useState(initialData?.isPrivate ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFluency(initialData.fluency);
      setArgumentation(initialData.argumentation);
      setPosture(initialData.posture);
      setFeedback(initialData.feedback ?? "");
      setIsPrivate(initialData.isPrivate ?? false);
    } else {
      setFluency(5);
      setArgumentation(5);
      setPosture(7);
      setFeedback("");
      setIsPrivate(false);
    }
    setError(null);
  }, [studentId, initialData]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("sessionId", sessionId);
    formData.append("studentId", studentId);
    formData.append("fluency", fluency.toString());
    formData.append("argumentation", argumentation.toString());
    formData.append("posture", posture.toString());
    formData.append("feedback", feedback);
    formData.append("isPrivate", isPrivate ? "true" : "false");

    try {
      if (onSave) {
        await onSave(formData);
      } else {
        const result = await evaluateDebateParticipantAction(formData);
        if (result && !result.success) {
          setError(result.error || "Erro ao guardar a avaliacao. Tente novamente.");
          setIsSubmitting(false);
          return;
        }
        onClose();
      }
    } catch (err) {
      console.error("Failed to save evaluation", err);
      setError("Erro inesperado ao guardar a avaliacao. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col">
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-lg md:text-xl font-extrabold text-slate-900">Avaliacao de Debate</h3>
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-1">
                {studentName}
              </p>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
            {/* Error message */}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
                {error}
              </div>
            )}

            {/* Fluencia */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Fluencia e Vocabulario
                </label>
                <span className="text-rose-600 font-black text-lg">{fluency}<span className="text-xs text-slate-400">/10</span></span>
              </div>
              <input 
                type="range" 
                min="1" max="10" 
                value={fluency}
                onChange={(e) => setFluency(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase">
                <span>Iniciante</span>
                <span>Fluente</span>
              </div>
            </div>

            {/* Argumentacao */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Poder de Argumentacao
                </label>
                <span className="text-rose-600 font-black text-lg">{argumentation}<span className="text-xs text-slate-400">/10</span></span>
              </div>
              <input 
                type="range" 
                min="1" max="10" 
                value={argumentation}
                onChange={(e) => setArgumentation(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase">
                <span>Fraco</span>
                <span>Persuasivo</span>
              </div>
            </div>

            {/* Postura */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Postura e Engajamento
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Timido", value: 3, icon: VolumeX, color: "text-amber-500" },
                  { label: "Equilibrado", value: 7, icon: MessageSquare, color: "text-emerald-500" },
                  { label: "Dominante", value: 10, icon: Zap, color: "text-rose-500" }
                ].map((p) => {
                  const Icon = p.icon;
                  return (
                    <button 
                      key={p.value}
                      type="button"
                      onClick={() => setPosture(p.value)}
                      className={`p-3 rounded-2xl text-[9px] font-black uppercase transition-all border-2 flex flex-col items-center justify-center min-h-[75px] ${
                        posture === p.value 
                          ? "border-rose-500 bg-rose-50 text-rose-600 shadow-lg shadow-rose-100" 
                          : "border-slate-100 text-slate-400 bg-white hover:border-slate-200"
                      }`}
                    >
                      <Icon size={18} className={`mb-1 ${p.color}`} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Feedback para o Estudante
              </label>
              <textarea
                name="feedback"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium h-24 outline-none focus:border-rose-500 transition-all resize-none"
                placeholder="Ex: Melhorou muito na diccao, mas precisa ouvir mais os colegas."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            {/* Opcoes de Visibilidade */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <input
                id="isPrivate"
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="isPrivate" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                Tornar este feedback privado (visivel apenas para o instrutor)
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100">
            <PrimaryButton 
              tone="rose" 
              className="w-full py-4 shadow-xl shadow-rose-200 flex items-center justify-center gap-2"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "A guardar..."
              ) : isWizard ? (
                <>Guardar e Proximo <ChevronRight size={16} /></>
              ) : (
                <>Guardar Avaliacao <Send size={16} /></>
              )}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
