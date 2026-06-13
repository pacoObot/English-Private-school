"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  KeyRound, 
  Hash, 
  ArrowRight, 
  GraduationCap, 
  UserPlus, 
  Sparkles, 
  X,
  FileSpreadsheet,
  Copy,
  RefreshCw
} from "lucide-react";
import { PrimaryButton } from "./PrimaryButton";

type ActionNoticeProps = {
  status?: string;
  additionalText?: string;
  newCode?: string;
  newName?: string;
  studentId?: string;
  importStatus?: string;
  errorCount?: number;
  missing?: string;
  invalid?: string;
  duplicate?: string;
  csvErrors?: string;
};

// Mensagens fixas (nao dependem da rota)
const fixedMessages: Record<string, { title: string; text: string; tone: "success" | "error" | "warning" | "info" }> = {
  deactivated: { title: "Registo Desativado", text: "O perfil selecionado foi desativado temporariamente.", tone: "warning" },
  activated: { title: "Perfil Ativado", text: "O perfil selecionado foi reativado e ja esta operacional.", tone: "success" },
  enrolled: { title: "Estudante Inscrito na Turma com Sucesso!", text: "A inscricao e matricula foram guardadas na base de dados com sucesso. O aluno ja se encontra vinculado a turma.", tone: "success" },
  paid: { title: "Pagamento Confirmado!", text: "A fatura correspondente foi marcada como paga no sistema.", tone: "success" },
  cancelled: { title: "Fatura Cancelada", text: "O documento de cobranca foi anulado no sistema.", tone: "info" },
  saved: { title: "Gravacao Efetuada", text: "Informacoes guardadas com sucesso.", tone: "success" },
  error: { title: "Falha na Operacao", text: "Nao foi possivel concluir a acao. Verifique os dados inseridos e tente novamente.", tone: "error" },
  validation_error: { title: "Erro de Validacao", text: "Existem campos obrigatorios em falta ou com dados incorretos. Por favor, corrija as seguintes causas:", tone: "error" },
  duplicate_email: { title: "Conflito de E-mail", text: "Este endereco de e-mail ja esta associado a outro utilizador.", tone: "error" },
  duplicate_student_number: { title: "Numero de Aluno Duplicado", text: "O numero de estudante informado ja existe no sistema.", tone: "error" },
  duplicate_student_code: { title: "Conflito de Codigo", text: "O codigo gerado automaticamente ja existe. Tente novamente.", tone: "error" },
  duplicate_staff_number: { title: "Numero de Funcionario Existente", text: "Este numero de staff ja esta associado a outro registo.", tone: "error" },
  duplicate_enrollment: { title: "Inscricao Duplicada", text: "O estudante selecionado ja se encontra matriculado nesta turma.", tone: "error" },
  duplicate_attendance: { title: "Presenca Duplicada", text: "Ja foi feito o registo de presenca deste aluno para a data indicada.", tone: "error" },
  duplicate_evaluation: { title: "Avaliacao Duplicada", text: "Este participante ja possui uma nota de debate lancada para esta sessao.", tone: "error" },
  invalid_email: { title: "E-mail Invalido", text: "O formato do e-mail introduzido e invalido. Por favor, introduza um e-mail correto ou deixe vazio.", tone: "error" },
  forbidden: { title: "Acesso Nao Autorizado", text: "A sua conta nao dispoe de permissoes para realizar esta acao no sistema.", tone: "error" },
  evaluated: { title: "Avaliacao Registada", text: "A nota do debate foi publicada e o participante foi notificado.", tone: "success" },
  participant_added: { title: "Aluno Inscrito no Debate", text: "O aluno foi adicionado com sucesso a sessao de debate.", tone: "success" },
  participant_removed: { title: "Aluno Removido do Debate", text: "O aluno foi removido da lista de participantes da sessao.", tone: "warning" },
  deleted: { title: "Registo Eliminado", text: "O item selecionado foi removido do sistema com sucesso.", tone: "warning" }
};

// Mensagens contextuais que mudam conforme a pagina onde o utilizador esta
function getContextualMessage(statusKey: string, currentPath: string): { title: string; text: string; tone: "success" | "error" | "warning" | "info" } | undefined {
  // Verificar primeiro as mensagens fixas
  if (fixedMessages[statusKey]) return fixedMessages[statusKey];

  // Mensagens contextuais por rota para "created" e "updated"
  if (statusKey === "created") {
    if (currentPath.includes("/debate")) return { title: "Sessao de Debate Criada!", text: "A nova sessao de debate foi agendada com sucesso na Arena.", tone: "success" };
    if (currentPath.includes("/admin/classes")) return { title: "Turma Criada com Sucesso!", text: "A nova turma foi registada e esta pronta para receber matriculas.", tone: "success" };
    if (currentPath.includes("/admin/staff")) return { title: "Funcionario Registado!", text: "O novo membro do staff foi adicionado ao sistema com credenciais de acesso.", tone: "success" };
    if (currentPath.includes("/admin/students")) return { title: "Estudante Registado com Sucesso!", text: "O perfil de estudante foi guardado na base de dados com as novas credenciais de acesso.", tone: "success" };
    if (currentPath.includes("/admin/courses")) return { title: "Curso Criado com Sucesso!", text: "O novo curso foi adicionado ao catalogo academico.", tone: "success" };
    if (currentPath.includes("/admin/calendar")) return { title: "Evento Criado!", text: "O evento foi adicionado ao calendario academico.", tone: "success" };
    if (currentPath.includes("/student/debates")) return { title: "Mensagem Enviada!", text: "A sua mensagem foi enviada a secretaria com sucesso.", tone: "success" };
    return { title: "Operacao Concluida!", text: "O novo registo foi criado com sucesso no sistema.", tone: "success" };
  }

  if (statusKey === "updated") {
    if (currentPath.includes("/debate")) return { title: "Sessao Atualizada!", text: "As configuracoes da sessao de debate foram guardadas.", tone: "success" };
    if (currentPath.includes("/admin/classes")) return { title: "Turma Atualizada!", text: "Os dados da turma foram atualizados com sucesso.", tone: "success" };
    if (currentPath.includes("/admin/staff")) return { title: "Dados do Staff Atualizados!", text: "As informacoes do funcionario foram guardadas.", tone: "success" };
    if (currentPath.includes("/admin/students")) return { title: "Dados do Estudante Atualizados!", text: "As informacoes do aluno foram guardadas com sucesso.", tone: "success" };
    if (currentPath.includes("/admin/courses")) return { title: "Curso Atualizado!", text: "Os dados do curso foram guardados com sucesso.", tone: "success" };
    if (currentPath.includes("/teacher/grades")) return { title: "Notas Lancadas!", text: "As notas foram registadas com sucesso para os alunos selecionados.", tone: "success" };
    if (currentPath.includes("/teacher/attendance")) return { title: "Presencas Registadas!", text: "O registo de presencas foi guardado com sucesso.", tone: "success" };
    return { title: "Dados Guardados!", text: "As alteracoes foram registadas no sistema com sucesso.", tone: "success" };
  }

  return undefined;
}

const DEFAULT_PASSWORD = "Delson@2026";

// Dicionário rico de resoluções de problemas para guiar o utilizador
const fieldSolutions: Record<string, { label: string; cause: string; solution: string }> = {
  studentId: {
    label: "Seleção do Estudante",
    cause: "Nenhum aluno foi selecionado para efetuar esta matrícula acadêmica.",
    solution: "Selecione o nome do aluno na lista suspensa (dropdown) 'Aluno' antes de clicar no botão."
  },
  courseId: {
    label: "Seleção do Curso",
    cause: "Nenhum curso foi selecionado para vincular à matrícula.",
    solution: "Escolha um dos cursos ativos na lista suspensa 'Curso'."
  },
  classGroupId: {
    label: "Seleção da Turma",
    cause: "Nenhuma turma foi selecionada para o estudante.",
    solution: "Escolha uma turma correspondente ao curso selecionado na lista suspensa 'Turma'."
  },
  monthlyFeeMt: {
    label: "Valor da Mensalidade",
    cause: "O valor da mensalidade está em falta, é negativo ou igual a zero.",
    solution: "Introduza um valor numérico positivo para a mensalidade no campo 'Mensalidade'."
  },
  name: {
    label: "Nome Completo",
    cause: "O nome completo da pessoa está em falta no formulário.",
    solution: "Preencha o campo 'Nome Completo' no topo com o nome oficial."
  },
  level: {
    label: "Nível Académico",
    cause: "O nível de ensino do aluno não foi selecionado.",
    solution: "Selecione um nível válido (ex: 1º Nível) na lista suspensa 'Nível'."
  },
  email: {
    label: "Endereço de E-mail",
    cause: "O endereço de e-mail é inválido ou já se encontra em uso por outra conta.",
    solution: "Introduza um e-mail válido (ex: nome@dominio.com). Caso o e-mail seja opcional, pode deixá-lo vazio para evitar o conflito."
  },
  role: {
    label: "Cargo / Perfil de Acesso",
    cause: "Nenhum perfil de acesso (Role) foi atribuído para este funcionário.",
    solution: "Escolha uma das funções administrativas ou docentes (ex: Admin, Docente) no menu 'Função'."
  },
  staffNumber: {
    label: "Número de Staff (Funcionário)",
    cause: "O número de identificação de staff indicado já existe no sistema.",
    solution: "Insira um número de staff exclusivo ou deixe vazio se o sistema autogerar."
  },
  studentNumber: {
    label: "Número de Estudante",
    cause: "O número de estudante fornecido já está registado por outro aluno.",
    solution: "Insira um número de estudante exclusivo ou deixe em branco para que o sistema gere um de forma automática."
  },
  enrollment: {
    label: "Matrícula no Curso",
    cause: "O estudante já está matriculado nesta turma específica.",
    solution: "Verifique a lista de matrículas ou selecione uma turma diferente para este aluno."
  }
};

export function ActionNotice({ 
  status: propStatus, 
  additionalText,
  newCode: propNewCode,
  newName: propNewName,
  studentId: propStudentId,
  importStatus: propImportStatus,
  errorCount: propErrorCount,
  missing: propMissing,
  invalid: propInvalid,
  duplicate: propDuplicate,
  csvErrors: propCsvErrors
}: ActionNoticeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  // Estados locais
  const [status, setStatus] = useState<string | undefined>(propStatus);
  const [newCode, setNewCode] = useState<string | undefined>(propNewCode);
  const [newName, setNewName] = useState<string | undefined>(propNewName);
  const [studentId, setStudentId] = useState<string | undefined>(propStudentId);
  const [importStatus, setImportStatus] = useState<string | undefined>(propImportStatus);
  const [errorCount, setErrorCount] = useState<number | undefined>(propErrorCount);
  const [missing, setMissing] = useState<string | undefined>(propMissing);
  const [invalid, setInvalid] = useState<string | undefined>(propInvalid);
  const [duplicate, setDuplicate] = useState<string | undefined>(propDuplicate);
  const [csvErrors, setCsvErrors] = useState<string | undefined>(propCsvErrors);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincronizar os estados locais com as props recebidas reativamente
  useEffect(() => {
    setStatus(propStatus);
    setNewCode(propNewCode);
    setNewName(propNewName);
    setStudentId(propStudentId);
    setImportStatus(propImportStatus);
    setErrorCount(propErrorCount);
    setMissing(propMissing);
    setInvalid(propInvalid);
    setDuplicate(propDuplicate);
    setCsvErrors(propCsvErrors);

    if (propStatus) {
      setShow(true);
    } else {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlStatus = params.get("status");
        if (urlStatus) {
          setStatus(urlStatus);
          setNewCode(params.get("newCode") || undefined);
          setNewName(params.get("newName") ? decodeURIComponent(params.get("newName")!) : undefined);
          setStudentId(params.get("studentId") || undefined);
          setImportStatus(params.get("importStatus") || undefined);
          const urlErrorCount = params.get("errorCount");
          setErrorCount(urlErrorCount ? parseInt(urlErrorCount, 10) : undefined);
          setMissing(params.get("missing") || undefined);
          setInvalid(params.get("invalid") || undefined);
          setDuplicate(params.get("duplicate") || undefined);
          setCsvErrors(params.get("csvErrors") || undefined);
          setShow(true);
        } else {
          setShow(false);
        }
      }
    }
  }, [propStatus, propNewCode, propNewName, propStudentId, propImportStatus, propErrorCount, propMissing, propInvalid, propDuplicate, propCsvErrors]);

  // Define se o feedback exige um Popup Modal Centralizado Estratégico ou um Toast fluido de Canto
  // Modais Estratégicos: Criar alunos (mostra credenciais críticas), Matricular alunos ou erros de validação graves
  const isStrategicModal = status === "created" || status === "enrolled" || status === "validation_error" || status === "forbidden";

  const handleClose = useCallback(() => {
    setShow(false);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.delete("status");
      params.delete("newCode");
      params.delete("newName");
      params.delete("studentId");
      params.delete("importStatus");
      params.delete("errorCount");
      params.delete("missing");
      params.delete("invalid");
      params.delete("duplicate");
      params.delete("csvErrors");
      
      const query = params.toString();
      const cleanUrl = window.location.pathname + (query ? `?${query}` : "");
      router.push(cleanUrl);
    }
  }, [router]);

  const handleCopyCredentials = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const textToCopy = `Código de Acesso: ${newCode}\nSenha Padrão: ${DEFAULT_PASSWORD}\nPortal: ${window.location.origin}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [newCode]);

  const handleCopyCode = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard && newCode) {
      navigator.clipboard.writeText(newCode).then(() => {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      });
    }
  }, [newCode]);

  const handleCopyPass = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(DEFAULT_PASSWORD).then(() => {
        setCopiedPass(true);
        setTimeout(() => setCopiedPass(false), 2000);
      });
    }
  }, []);

  // Autohide apenas para Toasts normais e não-bloqueantes (ex: sucessos comuns, avisos leves)
  useEffect(() => {
    if (show && !isStrategicModal) {
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, isStrategicModal, status, handleClose]);

  if (!mounted || !status || !show) return null;

  const message = getContextualMessage(status, pathname) || {
    title: "Notificacao",
    text: additionalText || "Acao processada no sistema.",
    tone: "info" as const
  };

  // Configurações visuais por tom
  const toneConfigs = {
    success: {
      bgGradient: "from-emerald-50 via-teal-50/20 to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900",
      iconBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30",
      icon: <CheckCircle2 size={32} className="animate-bounce" />,
      border: "border-emerald-100 dark:border-emerald-900/50",
      buttonTone: "navy" as const
    },
    error: {
      bgGradient: "from-rose-50 via-rose-50/10 to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900",
      iconBg: "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/30",
      icon: <XCircle size={32} />,
      border: "border-rose-100 dark:border-rose-900/50",
      buttonTone: "rose" as const
    },
    warning: {
      bgGradient: "from-amber-50 via-amber-50/10 to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900",
      iconBg: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30",
      icon: <AlertTriangle size={32} />,
      border: "border-amber-100 dark:border-amber-900/50",
      buttonTone: "dark" as const
    },
    info: {
      bgGradient: "from-blue-50 via-blue-50/10 to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900",
      iconBg: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30",
      icon: <Info size={32} />,
      border: "border-blue-100 dark:border-blue-900/50",
      buttonTone: "navy" as const
    }
  };

  const config = toneConfigs[message.tone];

  // Retrocompatibilidade e unificação de causas de erro
  let computedMissing = missing;
  let computedInvalid = invalid;
  let computedDuplicate = duplicate;

  if (status === "invalid_email") {
    computedInvalid = computedInvalid ? computedInvalid + ",email" : "email";
  }
  if (status === "duplicate_email") {
    computedDuplicate = computedDuplicate ? computedDuplicate + ",email" : "email";
  }
  if (status === "duplicate_student_number") {
    computedDuplicate = computedDuplicate ? computedDuplicate + ",studentNumber" : "studentNumber";
  }
  if (status === "duplicate_student_code") {
    computedDuplicate = computedDuplicate ? computedDuplicate + ",studentCode" : "studentCode";
  }
  if (status === "duplicate_staff_number") {
    computedDuplicate = computedDuplicate ? computedDuplicate + ",staffNumber" : "staffNumber";
  }
  if (status === "duplicate_enrollment") {
    computedDuplicate = computedDuplicate ? computedDuplicate + ",enrollment" : "enrollment";
  }
  if (status === "duplicate_attendance") {
    computedDuplicate = computedDuplicate ? computedDuplicate + ",attendance" : "attendance";
  }
  if (status === "duplicate_evaluation") {
    computedDuplicate = computedDuplicate ? computedDuplicate + ",evaluation" : "evaluation";
  }

  // Caso especial: Importação de estudantes via CSV
  const isCSVImport = importStatus && importStatus.startsWith("success:");
  const csvSuccessCount = isCSVImport ? importStatus?.split(":")[1] : "0";

  // RENDERIZAÇÃO 1: FORMATO TOAST FLUIDO E NÃO-BLOQUEANTE (Para sucessos ordinários)
  if (!isStrategicModal) {
    return (
      <div className="fixed top-6 right-6 z-[100] max-w-sm w-full pointer-events-auto animate-in slide-in-from-right-10 duration-300">
        <div 
          className={`bg-white dark:bg-slate-900 rounded-[1.8rem] shadow-2xl border ${config.border} bg-gradient-to-r ${config.bgGradient} p-4 pr-10 flex items-center gap-4 relative`}
        >
          {/* Botão de Fechar Rápido (X) */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 h-6 w-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all outline-none"
          >
            <X size={12} />
          </button>

          {/* Ícone menor e mais discreto */}
          <div className={`h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
            {message.tone === "success" ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Info size={20} />}
          </div>

          {/* Título e Texto do Toast */}
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
              {message.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-normal">
              {message.text}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // RENDERIZAÇÃO 2: FORMATO POPUP MODAL ESTRATÉGICO (Credenciais e Diagnóstico de Erros)
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border ${config.border} bg-gradient-to-b ${config.bgGradient} transition-all duration-300 scale-100 translate-y-0 p-6 md:p-8 relative`}
      >
        {/* Botão de Fechar Rápido (X) */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all outline-none"
        >
          <X size={16} />
        </button>

        {/* Ícone e Título */}
        <div className="text-center space-y-4 mb-6">
          <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto ${config.iconBg}`}>
            {config.icon}
          </div>
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {message.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold max-w-sm mx-auto">
              {message.text}
            </p>
          </div>
        </div>

        {/* Conteúdo específico: Credenciais ao criar ou matricular Aluno */}
        {(status === "created" || status === "enrolled") && newCode ? (
          <div className="space-y-4 mb-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Box de Código DPS / Username */}
              <div className="relative rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3.5 shadow-sm group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Hash size={12} />
                    <p className="text-[9px] font-black uppercase tracking-widest">Código (Identificação)</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    title="Copiar Código de Acesso"
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-navy dark:hover:text-white transition-all flex items-center justify-center"
                  >
                    {copiedCode ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="text-xl font-black text-navy dark:text-white tracking-wider select-all">{newCode}</p>
                {copiedCode && (
                  <span className="absolute bottom-1.5 right-4 text-[9px] font-bold text-emerald-600 animate-pulse">Copiado!</span>
                )}
              </div>

              {/* Box de Senha Inicial */}
              <div className="relative rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3.5 shadow-sm group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <KeyRound size={12} />
                    <p className="text-[9px] font-black uppercase tracking-widest">Senha Inicial</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPass}
                    title="Copiar Senha"
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-navy dark:hover:text-white transition-all flex items-center justify-center"
                  >
                    {copiedPass ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="text-xl font-black text-navy dark:text-white tracking-wider select-all">{DEFAULT_PASSWORD}</p>
                {copiedPass && (
                  <span className="absolute bottom-1.5 right-4 text-[9px] font-bold text-emerald-600 animate-pulse">Copiado!</span>
                )}
              </div>
            </div>

            {/* Botão Unificado para Copiar Credenciais Completas */}
            <button
              type="button"
              onClick={handleCopyCredentials}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-black uppercase tracking-widest transition-all ${
                copied 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-250/20" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-250 border border-slate-200/50 dark:border-slate-700/50"
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle2 size={14} className="animate-pulse" /> Copiado com Sucesso!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copiar Todos os Dados de Acesso
                </>
              )}
            </button>

            {/* Sugestão de matrícula e debate */}
            {status === "created" && (
              <div className="rounded-2xl bg-blue-50/50 dark:bg-slate-950 border border-blue-100/50 dark:border-slate-800 p-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-350">
                <div className="flex items-center gap-1.5 text-navy dark:text-blue-400 font-bold">
                  <Sparkles size={14} className="text-amber-500 animate-pulse" />
                  <p className="font-black uppercase tracking-widest text-[9px]">Sugestão Recomendada</p>
                </div>
                <p className="font-semibold leading-relaxed">
                  Para que o estudante novo possa participar nas aulas e nos debates académicos, deve agora <strong>Matricular este Aluno</strong> numa turma. De seguida, poderá aceder à <strong>Arena Debate</strong>.
                </p>
              </div>
            )}

            {/* Instruções de Login */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-600 dark:text-slate-350">
              <div className="flex items-center gap-1">
                <Sparkles size={13} className="text-amber-500" />
                <p className="font-black uppercase tracking-widest text-[9px] text-slate-500">Instruções para o Utilizador:</p>
              </div>
              <ul className="space-y-1.5 font-semibold">
                <li className="flex items-start gap-1">
                  <span className="text-navy dark:text-rose-400">1.</span>
                  <span>Aceder ao portal em <strong className="font-extrabold text-slate-850 dark:text-white">localhost:3000</strong></span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-navy dark:text-rose-400">2.</span>
                  <span>Usar o Código <strong className="font-extrabold text-navy dark:text-rose-300">{newCode}</strong> (ou e-mail)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-navy dark:text-rose-400">3.</span>
                  <span>Usar a senha padrão <strong className="font-extrabold text-slate-850 dark:text-white">{DEFAULT_PASSWORD}</strong></span>
                </li>
              </ul>
              <p className="text-[9px] font-bold text-slate-400 italic mt-1 border-t border-slate-100 dark:border-slate-800/40 pt-1.5">
                Recomenda-se a alteração da senha no primeiro acesso à conta.
              </p>
            </div>
          </div>
        ) : null}

        {/* Diagnóstico Detalhado do Erro com Resoluções de Problemas */}
        {(computedMissing || computedInvalid || computedDuplicate) && (
          <div className="rounded-[1.5rem] bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-5 mb-6 text-xs text-left overflow-y-auto max-h-[220px] custom-scrollbar">
            <h4 className="font-black text-rose-800 dark:text-rose-400 uppercase tracking-widest text-[9px] flex items-center gap-1.5 mb-3 border-b border-rose-100/50 dark:border-rose-900/30 pb-2.5">
              <AlertTriangle size={13} className="text-rose-500 animate-pulse" />
              Diagnóstico do Problema & Resolução
            </h4>
            <div className="space-y-3.5">
              {/* Seção de Elementos em Falta */}
              {computedMissing && (
                <div className="space-y-2">
                  <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Elementos em falta:</p>
                  <ul className="space-y-2">
                    {computedMissing.split(",").map(field => {
                      const details = fieldSolutions[field] || {
                        label: field,
                        cause: "Este campo é obrigatório e está em falta no formulário.",
                        solution: "Por favor, preencha este campo antes de submeter."
                      };
                      return (
                        <li key={field} className="bg-white/70 dark:bg-slate-900/60 rounded-xl p-3 border border-rose-100/30 space-y-1">
                          <p className="font-black text-rose-900 dark:text-rose-200 text-[10px] uppercase tracking-wide flex items-center gap-1.5">
                            <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                            {details.label}
                          </p>
                          <p className="text-rose-700 dark:text-rose-350 font-semibold leading-relaxed">{details.cause}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium italic border-t border-rose-100/20 pt-1 mt-1">
                            <span className="font-black text-navy dark:text-rose-300 not-italic uppercase tracking-widest text-[8px] mr-1">Como solucionar:</span> {details.solution}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Seção de Elementos Inválidos */}
              {computedInvalid && (
                <div className="space-y-2">
                  <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Campos incorretos:</p>
                  <ul className="space-y-2">
                    {computedInvalid.split(",").map(field => {
                      const details = fieldSolutions[field] || {
                        label: field,
                        cause: "O valor introduzido possui formato incorreto.",
                        solution: "Por favor, corrija o valor introduzido."
                      };
                      return (
                        <li key={field} className="bg-white/70 dark:bg-slate-900/60 rounded-xl p-3 border border-rose-100/30 space-y-1">
                          <p className="font-black text-rose-900 dark:text-rose-200 text-[10px] uppercase tracking-wide flex items-center gap-1.5">
                            <XCircle size={12} className="text-rose-500 shrink-0" />
                            {details.label}
                          </p>
                          <p className="text-rose-700 dark:text-rose-350 font-semibold leading-relaxed">{details.cause}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium italic border-t border-rose-100/20 pt-1 mt-1">
                            <span className="font-black text-navy dark:text-rose-300 not-italic uppercase tracking-widest text-[8px] mr-1">Como solucionar:</span> {details.solution}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Seção de Elementos Duplicados */}
              {computedDuplicate && (
                <div className="space-y-2">
                  <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Conflitos de dados (Já existentes):</p>
                  <ul className="space-y-2">
                    {computedDuplicate.split(",").map(field => {
                      const details = fieldSolutions[field] || {
                        label: field,
                        cause: "Este dado já existe registado no sistema.",
                        solution: "Altere o valor ou utilize outro registo para evitar duplicações."
                      };
                      return (
                        <li key={field} className="bg-white/70 dark:bg-slate-900/60 rounded-xl p-3 border border-rose-100/30 space-y-1">
                          <p className="font-black text-rose-900 dark:text-rose-200 text-[10px] uppercase tracking-wide flex items-center gap-1.5">
                            <RefreshCw size={12} className="text-blue-500 shrink-0" />
                            {details.label}
                          </p>
                          <p className="text-rose-700 dark:text-rose-350 font-semibold leading-relaxed">{details.cause}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium italic border-t border-rose-100/20 pt-1 mt-1">
                            <span className="font-black text-navy dark:text-rose-300 not-italic uppercase tracking-widest text-[8px] mr-1">Como solucionar:</span> {details.solution}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conteúdo específico: Importação de CSV */}
        {isCSVImport ? (
          <div className="space-y-4 mb-6">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3">
              <div className="flex items-center gap-2 text-navy dark:text-rose-400">
                <FileSpreadsheet size={16} />
                <p className="font-black uppercase tracking-widest text-[9px]">Relatório de Importação CSV</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-2xl font-black text-emerald-600">{csvSuccessCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Sucessos</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-2xl font-black text-rose-500">{errorCount ?? 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Falhas / Erros</p>
                </div>
              </div>
            </div>
            {csvErrors && (
              <div className="rounded-[1.5rem] bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 text-left">
                <p className="text-[9px] font-black text-rose-800 dark:text-rose-400 uppercase tracking-widest mb-2 border-b border-rose-100/50 dark:border-rose-900/30 pb-1.5 flex items-center gap-1">
                  <AlertTriangle size={11} className="text-rose-500" /> Detalhes dos Erros de Importação:
                </p>
                <ul className="space-y-1.5 text-[11px] font-semibold text-rose-700 dark:text-rose-350 list-disc pl-4 leading-normal">
                  {csvErrors.split("|").map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {/* Informações adicionais gerais */}
        {additionalText && !isCSVImport && (
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-center mb-6">
            {additionalText}
          </div>
        )}

        {/* Ações / Botões */}
        <div className="flex flex-col gap-3">
          {/* Matrícula inteligente e Arena Debate: Botões especiais para alunos criados */}
          {status === "created" && studentId && pathname === "/admin/students" ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href={`/admin/students?tab=matricular&studentId=${studentId}`}
                onClick={() => setShow(false)}
                className="flex-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-navy text-white hover:bg-blue-950 text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:scale-[1.01] px-4 text-center"
              >
                <GraduationCap size={16} /> Matricular Agora
                <ArrowRight size={14} />
              </a>
              <a
                href="/debate"
                onClick={() => setShow(false)}
                className="flex-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:scale-[1.01] px-4 text-center"
              >
                <Sparkles size={16} /> Arena Debate
              </a>
              <button
                onClick={handleClose}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-250 dark:border-slate-700 dark:hover:bg-slate-750 text-xs font-black uppercase tracking-widest transition-all px-4"
              >
                Fechar
              </button>
            </div>
          ) : status === "enrolled" ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href="/debate"
                onClick={() => setShow(false)}
                className="flex-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:scale-[1.01] text-center"
              >
                <Sparkles size={16} /> Ir para a Arena Debate
                <ArrowRight size={14} />
              </a>
              <button
                onClick={handleClose}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-250 dark:border-slate-700 dark:hover:bg-slate-750 text-xs font-black uppercase tracking-widest transition-all px-6"
              >
                Concluir
              </button>
            </div>
          ) : (
            <PrimaryButton 
              tone={config.buttonTone} 
              onClick={handleClose}
              className="w-full"
            >
              Ok, Entendi
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
