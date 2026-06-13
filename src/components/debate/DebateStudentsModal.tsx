"use client";

import { useState } from "react";
import { X, Search, Plus, UserPlus, Mic2, PenTool } from "lucide-react";
import { addDebateParticipantAction } from "@/features/debate/actions";

interface StudentData {
  id: string;
  name: string;
  studentCode: string;
  speakingPercentage: number;
  writingPercentage: number;
}

interface DebateStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  availableStudents: StudentData[];
}

function SkillBar({ label, percentage, color, icon }: { label: string; percentage: number; color: "rose" | "navy"; icon: React.ReactNode }) {
  const bgColor = color === "rose" ? "bg-rose-500" : "bg-navy";
  const trackColor = color === "rose" ? "bg-rose-100" : "bg-blue-100";
  const textColor = color === "rose" ? "text-rose-600" : "text-navy";

  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 flex items-center justify-center ${textColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</span>
          <span className={`text-[9px] font-black ${textColor}`}>{percentage}%</span>
        </div>
        <div className={`h-1.5 w-full rounded-full ${trackColor} overflow-hidden`}>
          <div 
            className={`h-full rounded-full ${bgColor} transition-all duration-500`} 
            style={{ width: `${Math.min(percentage, 100)}%` }} 
          />
        </div>
      </div>
    </div>
  );
}

export function DebateStudentsModal({
  isOpen,
  onClose,
  sessionId,
  availableStudents,
}: DebateStudentsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [addingIds, setAddingIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const filteredStudents = availableStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleAddStudent(studentId: string) {
    setAddingIds((prev) => ({ ...prev, [studentId]: true }));
    const formData = new FormData();
    formData.append("sessionId", sessionId);
    formData.append("studentId", studentId);
    
    try {
      await addDebateParticipantAction(formData);
    } catch (error) {
      console.error("Failed to add participant", error);
    } finally {
      setAddingIds((prev) => ({ ...prev, [studentId]: false }));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={onClose} />
      
      {/* Dialog */}
      <div className="relative bg-white w-full max-w-xl max-h-[88vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center text-navy">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Banco de Alunos</h3>
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-0.5">
                {availableStudents.length} estudante{availableStudents.length !== 1 ? "s" : ""} disponivel{availableStudents.length !== 1 ? "is" : ""}
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

        {/* Search Bar */}
        <div className="p-4 md:p-5 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Pesquisar por nome ou codigo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-rose-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-2">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="mx-auto mb-3 text-slate-300" size={40} />
              <p className="text-sm font-bold text-slate-400">
                {searchTerm ? "Nenhum estudante encontrado para esta pesquisa." : "Todos os estudantes ja estao inscritos nesta sessao."}
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div 
                key={student.id} 
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-slate-900 truncate">{student.name}</p>
                    <span className="text-[9px] text-rose-600 font-bold uppercase tracking-widest">
                      {student.studentCode}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddStudent(student.id)}
                    disabled={addingIds[student.id]}
                    className="px-3 py-1.5 bg-navy hover:bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-50 transition-all flex items-center gap-1 shrink-0"
                  >
                    <Plus size={12} />
                    {addingIds[student.id] ? "..." : "Adicionar"}
                  </button>
                </div>

                {/* Skills Bars */}
                <div className="space-y-1.5">
                  <SkillBar 
                    label="Speaking" 
                    percentage={student.speakingPercentage} 
                    color="rose" 
                    icon={<Mic2 size={10} />} 
                  />
                  <SkillBar 
                    label="Writing" 
                    percentage={student.writingPercentage} 
                    color="navy" 
                    icon={<PenTool size={10} />} 
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
