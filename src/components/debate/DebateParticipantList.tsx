"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Mic2, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EvaluationModal } from "./EvaluationModal";
import { DebateSessionStatus } from "@/generated/prisma";
import { removeDebateParticipantAction } from "@/features/debate/actions";

interface Participant {
  id: string;
  studentId: string;
  student: {
    user: {
      id: string;
      name: string;
    };
    studentNumber: string;
    studentCode: string;
  };
}

interface Evaluation {
  id?: string;
  studentId: string;
  fluency: number;
  argumentation: number;
  posture: number;
  feedback?: string | null;
  acknowledgedAt?: Date | string | null;
}

interface DebateParticipantListProps {
  participants: Participant[];
  evaluations: Evaluation[];
  canEvaluate: boolean;
  canManageDebate: boolean;
  moderatorUserId?: string | null;
  sessionId: string;
  sessionStatus: DebateSessionStatus;
}

export function DebateParticipantList({
  participants,
  evaluations,
  canEvaluate,
  canManageDebate,
  moderatorUserId,
  sessionId,
  sessionStatus,
}: DebateParticipantListProps) {
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);
  const sortedParticipants = [...participants].sort((a, b) => a.student.user.name.localeCompare(b.student.user.name));

  return (
    <div className="grid gap-4 p-4">
      {sortedParticipants.length === 0 ? (
        <p className="text-center text-sm font-bold text-slate-400 py-6">Nenhum participante inscrito nesta sessão.</p>
      ) : (
        sortedParticipants.map((p) => {
          const evaluation = evaluations.find((e) => e.studentId === p.studentId);
          const isSelf = p.student.user.id === moderatorUserId;
          const allowEval = canEvaluate && !isSelf && sessionStatus !== DebateSessionStatus.CLOSED;

          return (
            <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <span className="text-xs font-black">{p.student.user.name.charAt(0)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-900 truncate">{p.student.user.name}</p>
                  <p className="text-[9px] text-rose-600 font-bold uppercase tracking-widest">{p.student.studentCode}</p>
                </div>
                <div className="flex items-center gap-2">
                  {evaluation && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={15} />
                    </div>
                  )}
                  {canManageDebate && sessionStatus !== DebateSessionStatus.CLOSED && (
                    <form action={removeDebateParticipantAction}>
                      <input type="hidden" name="sessionId" value={sessionId} />
                      <input type="hidden" name="studentId" value={p.studentId} />
                      <button type="submit" className="w-8 h-8 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {allowEval ? (
                  <button 
                    onClick={() => setSelectedStudent({ id: p.studentId, name: p.student.user.name })}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Mic2 size={14} /> {evaluation ? "Editar Avaliação" : "Avaliar Fala"}
                  </button>
                ) : evaluation ? (
                   <div className="flex-1 bg-slate-50 p-3 rounded-xl grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Flu</p>
                        <p className="text-xs font-black text-rose-600">{evaluation.fluency}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Arg</p>
                        <p className="text-xs font-black text-rose-600">{evaluation.argumentation}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Pos</p>
                        <p className="text-xs font-black text-rose-600">{evaluation.posture}</p>
                      </div>
                   </div>
                ) : (
                  <div className="flex-1 bg-slate-50 py-3 rounded-xl text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Aguardando...
                  </div>
                )}
                {evaluation ? (
                  <div className="flex min-w-28 items-center justify-center gap-1 rounded-xl bg-slate-50 px-3 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {evaluation.acknowledgedAt ? (
                      <>
                        <CheckCircle2 size={13} className="text-emerald-500" /> Recebido
                      </>
                    ) : (
                      <>
                        <Clock3 size={13} className="text-amber-500" /> Pendente
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })
      )}

      {selectedStudent && (
        <EvaluationModal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          studentName={selectedStudent.name}
          studentId={selectedStudent.id}
          sessionId={sessionId}
          initialData={evaluations.find(e => e.studentId === selectedStudent.id)}
        />
      )}
    </div>
  );
}
