"use client";

import { useState } from "react";
import { Settings, Users, UserPlus } from "lucide-react";
import { DebateSessionStatus } from "@/generated/prisma";
import { DebateSettingsModal } from "./DebateSettingsModal";
import { DebateStudentsModal } from "./DebateStudentsModal";

interface StudentData {
  id: string;
  name: string;
  studentCode: string;
  speakingPercentage: number;
  writingPercentage: number;
}

interface DebateManagementControlsProps {
  debateId: string;
  topic: string;
  startsAt: string;
  capacity: number;
  location: string;
  status: DebateSessionStatus;
  canManage: boolean;
  availableStudents: StudentData[];
}

export function DebateManagementControls({
  debateId,
  topic,
  startsAt,
  capacity,
  location,
  status,
  canManage,
  availableStudents,
}: DebateManagementControlsProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);

  if (!canManage) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status !== DebateSessionStatus.CLOSED && (
        <button
          onClick={() => setIsStudentsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-900/30"
        >
          <UserPlus size={14} />
          Banco de Alunos
        </button>
      )}

      <button
        onClick={() => setIsSettingsOpen(true)}
        className="flex items-center justify-center w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all"
        title="Editar Sessão"
      >
        <Settings size={18} />
      </button>

      {/* Modal de Configurações */}
      <DebateSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        debateId={debateId}
        topic={topic}
        startsAt={startsAt}
        capacity={capacity}
        location={location}
      />

      {/* Modal Banco Geral de Alunos */}
      <DebateStudentsModal
        isOpen={isStudentsOpen}
        onClose={() => setIsStudentsOpen(false)}
        sessionId={debateId}
        availableStudents={availableStudents}
      />
    </div>
  );
}
