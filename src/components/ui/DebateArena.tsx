"use client";

import { useState } from "react";
import { Mic, Star, Send, User } from "lucide-react";
import { BentoCard } from "./BentoCard";
import { PrimaryButton } from "./PrimaryButton";
import { cn } from "@/lib/cn";
import { saveDebateEvaluationAction } from "@/features/debate/actions";

type Student = {
  id: string;
  name: string;
};

type DebateArenaProps = {
  students: Student[];
  sessionId?: string;
};

export function DebateArena({ students, sessionId }: DebateArenaProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [scores, setScores] = useState({ fluency: 5, argumentation: 5, posture: 5 });
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !sessionId) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("studentId", selectedStudent.id);
    formData.append("sessionId", sessionId);
    formData.append("fluency", String(scores.fluency));
    formData.append("argumentation", String(scores.argumentation));
    formData.append("posture", String(scores.posture));
    formData.append("feedback", feedback);

    await saveDebateEvaluationAction(formData);
    
    // Reset after save
    setFeedback("");
    setSelectedStudent(null);
    setLoading(false);
    alert(`Avaliação enviada para ${selectedStudent.name}!`);
  };

  return (
    <BentoCard className="flex flex-col h-full bg-slate-900 text-white overflow-hidden" dark>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <Mic className="text-rose-500" size={24} /> Arena de Debates
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Avaliação em tempo real</p>
        </div>
      </div>

      {!selectedStudent ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Selecione um orador:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="flex items-center gap-3 p-4 rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left group"
              >
                <div className="h-10 w-10 rounded-xl bg-navy flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform">
                  {student.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-bold truncate">{student.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
            <button 
              type="button" 
              onClick={() => setSelectedStudent(null)}
              className="text-[10px] font-black uppercase text-slate-400 hover:text-white"
            >
              ← Voltar
            </button>
            <div className="h-8 w-8 rounded-lg bg-rose-600 flex items-center justify-center text-[10px] font-black">
              {selectedStudent.name.slice(0, 2).toUpperCase()}
            </div>
            <h4 className="text-sm font-black truncate">Avaliando: {selectedStudent.name}</h4>
          </div>

          <div className="space-y-6 flex-1">
            {[
              { key: "fluency", label: "Fluência e Vocabulário" },
              { key: "argumentation", label: "Poder de Argumentação" },
              { key: "posture", label: "Postura e Linguagem Corporal" }
            ].map((metric) => (
              <div key={metric.key}>
                <div className="flex justify-between mb-3 px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{metric.label}</label>
                  <span className="text-sm font-black text-rose-500">{scores[metric.key as keyof typeof scores]}/10</span>
                </div>
                <div className="flex gap-1.5">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setScores({ ...scores, [metric.key]: i + 1 })}
                      className={cn(
                        "h-8 flex-1 rounded-lg transition-all",
                        scores[metric.key as keyof typeof scores] > i ? "bg-rose-600" : "bg-white/10 hover:bg-white/20"
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block px-1">Feedback Qualitativo</label>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Ex: Excelente uso de conectores, mas precisa manter contato visual..."
                className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium outline-none focus:border-rose-500 focus:bg-white/10 transition-all resize-none"
              />
            </div>
          </div>

          <PrimaryButton 
            tone="rose" 
            className="w-full mt-8 py-5 rounded-[1.5rem]" 
            type="submit"
            disabled={loading}
          >
            {loading ? "A processar..." : "Publicar Avaliação"} <Send size={15} />
          </PrimaryButton>
        </form>
      )}
    </BentoCard>
  );
}
