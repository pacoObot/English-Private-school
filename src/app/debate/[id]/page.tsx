import { CalendarClock, Mic2, Plus, Trash2, Users } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { debateNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { DebateSessionStatus, Role } from "@/generated/prisma";
import { addDebateParticipantAction, evaluateDebateParticipantAction, removeDebateParticipantAction } from "@/features/debate/actions";

export const dynamic = "force-dynamic";

export default async function DebateDetailsPage({ params, searchParams }: { params: { id: string }; searchParams?: { status?: string } }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const debate = await prisma.debateSession.findUnique({
    where: { id: params.id },
    include: {
      moderator: { include: { user: true } },
      participants: { include: { student: { include: { user: true } } } },
      evaluations: true
    }
  });

  if (!debate) notFound();

  const isTeacherOrAdmin = ([Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER] as Role[]).includes(session.role);
  
  let isModerator = false;
  if (!isTeacherOrAdmin) {
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: session.userId } });
    isModerator = !!(studentProfile && debate.moderatorId === studentProfile.id);
  }

  const canEvaluate = isTeacherOrAdmin || isModerator;

  // For adding new participants, get list of students not yet in this debate
  const participantIds = debate.participants.map(p => p.studentId);
  const availableStudents = isTeacherOrAdmin ? await prisma.studentProfile.findMany({
    where: { id: { notIn: participantIds } },
    include: { user: true }
  }) : [];

  return (
    <DashboardLayout
      navItems={debateNav}
      title={debate.topic}
      subtitle={`Sessão: ${debate.status}`}
      context="Debate Arena"
    >
      <div className="space-y-6">
        <ActionNotice status={searchParams?.status} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <BentoCard className="xl:col-span-1">
            <h3 className="mb-6 font-black text-slate-800">Detalhes da Sessão</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data e Hora</p>
                <p className="font-bold text-slate-700">{debate.startsAt.toLocaleString("pt-PT")}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Local</p>
                <p className="font-bold text-slate-700">{debate.location || "Online / A definir"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gestor de Debate</p>
                <p className="font-bold text-slate-700">{debate.moderator?.user.name || "Professor"}</p>
              </div>
            </div>

            {isTeacherOrAdmin && debate.status !== DebateSessionStatus.CLOSED && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Adicionar Participante</h4>
                <form action={addDebateParticipantAction} className="space-y-3">
                  <input type="hidden" name="sessionId" value={debate.id} />
                  <SelectField 
                    name="studentId" 
                    label="Selecionar Estudante"
                    options={availableStudents.map(s => ({ label: `${s.user.name} (${s.studentNumber})`, value: s.id }))} 
                    required 
                  />
                  <PrimaryButton tone="navy" type="submit" className="w-full text-[10px]">
                    <Plus size={14} /> Adicionar
                  </PrimaryButton>
                </form>
              </div>
            )}
          </BentoCard>

          <div className="space-y-5 xl:col-span-2">
            <BentoCard className="p-0">
              <div className="flex items-center justify-between p-6">
                <h3 className="font-black text-slate-800">Participantes e Avaliações</h3>
                <StatusBadge tone="navy">{`${debate.participants.length} Inscritos`}</StatusBadge>
              </div>
              
              <div className="grid gap-3 p-4">
                {debate.participants.length === 0 ? (
                  <p className="text-center text-sm font-bold text-slate-400 py-6">Nenhum participante inscrito nesta sessão.</p>
                ) : (
                  debate.participants.map(p => {
                    const evaluation = debate.evaluations.find(e => e.studentId === p.studentId);
                    // O moderador não pode avaliar a si próprio
                    const isSelf = p.studentId === debate.moderatorId;
                    const allowEval = canEvaluate && !isSelf && debate.status !== DebateSessionStatus.CLOSED;

                    return (
                      <div key={p.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-black text-slate-900">{p.student.user.name}</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{p.student.studentNumber}</p>
                          </div>
                          <div className="flex gap-2">
                            {evaluation && <StatusBadge tone="success">Avaliado</StatusBadge>}
                            {isTeacherOrAdmin && debate.status !== DebateSessionStatus.CLOSED && (
                              <form action={removeDebateParticipantAction}>
                                <input type="hidden" name="sessionId" value={debate.id} />
                                <input type="hidden" name="studentId" value={p.studentId} />
                                <button type="submit" className="rounded-xl p-2 text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></button>
                              </form>
                            )}
                          </div>
                        </div>

                        {allowEval ? (
                          <form action={evaluateDebateParticipantAction} className="grid w-full gap-4 sm:grid-cols-2 md:grid-cols-4">
                            <input type="hidden" name="sessionId" value={debate.id} />
                            <input type="hidden" name="studentId" value={p.studentId} />
                            
                            <FormField name="fluency" label="Fluência (0-10)" type="number" min={0} max={10} defaultValue={evaluation?.fluency?.toString()} required />
                            <FormField name="argumentation" label="Argumentação (0-10)" type="number" min={0} max={10} defaultValue={evaluation?.argumentation?.toString()} required />
                            <FormField name="posture" label="Postura (0-10)" type="number" min={0} max={10} defaultValue={evaluation?.posture?.toString()} required />
                            
                            <div className="col-span-full">
                              <FormField name="feedback" label="Feedback" placeholder="Observações..." defaultValue={evaluation?.feedback ?? ""} />
                            </div>
                            
                            <div className="col-span-full mt-2">
                              <PrimaryButton tone="dark" type="submit" className="w-full sm:w-auto">
                                <Mic2 size={14} /> Salvar Avaliação
                              </PrimaryButton>
                            </div>
                          </form>
                        ) : evaluation ? (
                          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                            <Score label="Fluência" value={evaluation.fluency} />
                            <Score label="Argumentação" value={evaluation.argumentation} />
                            <Score label="Postura" value={evaluation.posture} />
                            {evaluation.feedback && (
                              <div className="col-span-3 mt-2 rounded-xl bg-white p-3 text-sm text-slate-600 shadow-sm">
                                <span className="block mb-1 text-[10px] font-black uppercase text-slate-400">Feedback</span>
                                {evaluation.feedback}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-slate-400 border-t border-slate-100 pt-4">Aguardando avaliação...</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-crimson">{value}/10</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-crimson" style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}
