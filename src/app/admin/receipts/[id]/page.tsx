import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { Role } from "@/generated/prisma";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReceiptPrintPage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  const isAdmin = session && (session.role === Role.SUPER_ADMIN || session.role === Role.ADMIN);
  
  const receipt = await prisma.receipt.findUnique({
    where: { id: params.id },
    include: {
      student: { include: { user: true } },
      invoice: true,
    },
  });

  if (!receipt) notFound();

  const isOwner = session && session.role === Role.STUDENT && receipt.student.userId === session.userId;
  
  if (!isAdmin && !isOwner) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Controls - Hidden on print */}
      <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-slate-900 transition-all">
          <ArrowLeft size={18} /> Voltar ao Painel
        </Link>
        <button 
          onClick={() => {}} 
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200 active:scale-95 transition-all"
          // We'll use a client component wrapper or a simple script for window.print()
          id="print-button"
        >
          <Printer size={16} /> Imprimir Recibo
        </button>
      </div>

      {/* Receipt Content */}
      <div className="max-w-3xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">
        <div className="p-12 md:p-16 space-y-12">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                <span className="font-black text-xl">D</span>
              </div>
              <div>
                <h1 className="font-black text-2xl tracking-tighter uppercase text-slate-900">Delson <span className="text-rose-600">PS</span></h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escola de Línguas & Debate</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recibo Nº</p>
              <p className="font-black text-xl text-slate-900">{receipt.receiptNumber}</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aluno</p>
                <p className="font-extrabold text-lg text-slate-900">{receipt.student.user.name}</p>
                <p className="text-xs font-bold text-slate-500 uppercase">ID: {receipt.student.studentCode}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Serviço</p>
                <p className="font-bold text-slate-700">Mensalidade - {receipt.invoice.reference}</p>
              </div>
            </div>
            <div className="space-y-6 text-right md:text-left">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data de Emissão</p>
                <p className="font-bold text-slate-700">{receipt.issuedAt.toLocaleDateString("pt-PT")}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Emitido por</p>
                <p className="font-bold text-slate-700">{receipt.issuedBy}</p>
              </div>
            </div>
          </div>

          {/* Amount Hero */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Pago</p>
            <p className="text-5xl font-black">{receipt.amountMt.toLocaleString("pt-PT")} <span className="text-lg font-bold text-rose-400">MT</span></p>
          </div>

          {/* Footer / Signature */}
          <div className="pt-12 flex flex-col items-center gap-12 border-t border-slate-100">
            <div className="w-full max-w-sm border-t border-slate-200 pt-4 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assinatura Autorizada</p>
            </div>
            <p className="text-[9px] text-slate-400 font-medium max-w-md text-center leading-relaxed">
              Este documento serve como prova oficial de pagamento à Delson PS. 
              Obrigado pela sua confiança. Keep debating, keep learning!
            </p>
          </div>
        </div>
      </div>

      {/* Print script */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('print-button')?.addEventListener('click', () => window.print());
      `}} />

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:p-0 { padding: 0 !important; }
          @page { margin: 2cm; }
        }
      `}} />
    </div>
  );
}
