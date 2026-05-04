type ActionNoticeProps = {
  status?: string;
};

const messages: Record<string, { text: string; className: string }> = {
  created: { text: "Registo criado com sucesso.", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  updated: { text: "Alteracoes guardadas.", className: "border-blue-200 bg-blue-50 text-blue-700" },
  deactivated: { text: "Registo desativado.", className: "border-amber-200 bg-amber-50 text-amber-700" },
  activated: { text: "Registo ativado.", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  enrolled: { text: "Matricula criada e fatura gerada.", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  paid: { text: "Fatura marcada como paga.", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cancelled: { text: "Fatura cancelada.", className: "border-slate-200 bg-slate-50 text-slate-700" },
  saved: { text: "Dados guardados.", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  error: { text: "Verifique os campos obrigatorios e tente novamente.", className: "border-rose-200 bg-rose-50 text-rose-700" },
  duplicate_email: { text: "Este email já está em uso por outro utilizador.", className: "border-rose-200 bg-rose-50 text-rose-700" },
  duplicate_student_number: { text: "Este número de aluno já está registado.", className: "border-rose-200 bg-rose-50 text-rose-700" },
  duplicate_staff_number: { text: "Este número de staff já está registado.", className: "border-rose-200 bg-rose-50 text-rose-700" },
  duplicate_enrollment: { text: "Este aluno já está matriculado nesta turma.", className: "border-rose-200 bg-rose-50 text-rose-700" },
  duplicate_attendance: { text: "Já existe um registo de presença para este aluno nesta aula.", className: "border-rose-200 bg-rose-50 text-rose-700" },
  duplicate_evaluation: { text: "Este aluno já foi avaliado nesta sessão.", className: "border-rose-200 bg-rose-50 text-rose-700" }
};

export function ActionNotice({ status }: ActionNoticeProps) {
  if (!status || !messages[status]) {
    return null;
  }

  const message = messages[status];

  return <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${message.className}`}>{message.text}</div>;
}
