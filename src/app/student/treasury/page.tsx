import { ActionNotice } from "@/components/ui/ActionNotice";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { DataTable } from "@/components/ui/DataTable";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentSession } from "@/features/auth/current-user";
import { studentNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getLocale, getDictionary } from "@/i18n/locale";
import { Download, Wallet, CreditCard } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudentTreasuryPage({ searchParams }: { searchParams?: { status?: string } }) {
  const session = await getCurrentSession();
  const locale = await getLocale();
  const dict = await getDictionary();
  const student = session
    ? await prisma.studentProfile.findFirst({
        where: { userId: session.userId },
        include: {
          invoices: { 
            include: { receipt: true },
            orderBy: { createdAt: "desc" }
          },
        }
      })
    : null;

  const pendingInvoices = student?.invoices.filter(inv => inv.status === "PENDING") ?? [];
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amountMt, 0);

  return (
    <DashboardLayout
      navItems={studentNav.map(item => ({ ...item, active: item.label === "Tesouraria" }))}
      title={dict.treasuryTitle}
      subtitle={dict.treasurySub}
      context="Student Portal"
      darkSidebar
    >
      <div className="space-y-6">
        <ActionNotice status={searchParams?.status} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BentoCard className="bg-gradient-to-br from-navy to-blue-600 text-white md:col-span-2" dark>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">
                  {locale === "en-US" ? "Total Outstanding Balance" : "Saldo Devedor Total"}
                </p>
                <h3 className="text-4xl font-black">{totalPending.toLocaleString()} MT</h3>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <PrimaryButton tone="light" className="text-navy">
                <CreditCard size={16} /> {dict.payNow}
              </PrimaryButton>
            </div>
          </BentoCard>

          <BentoCard className="bg-slate-900 text-white" dark>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {locale === "en-US" ? "Next Due Date" : "Próximo Vencimento"}
            </p>
            {pendingInvoices.length > 0 ? (
              <>
                <h3 className="mt-2 text-2xl font-black text-rose-500">
                  {pendingInvoices[0].dueDate.toLocaleDateString(locale)}
                </h3>
                <p className="mt-1 text-xs font-bold text-slate-300">
                  Ref: {pendingInvoices[0].reference}
                </p>
              </>
            ) : (
              <h3 className="mt-2 text-2xl font-black text-emerald-500 text-sm">
                {locale === "en-US" ? "All settled!" : "Tudo em dia!"}
              </h3>
            )}
          </BentoCard>
        </div>

        <BentoCard className="p-0">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">
              {locale === "en-US" ? "Financial History" : "Histórico Financeiro"}
            </h3>
            <StatusBadge tone="navy">
              {student?.invoices.length ?? 0} {locale === "en-US" ? "Transactions" : "Transações"}
            </StatusBadge>
          </div>
          <DataTable
            emptyMessage={locale === "en-US" ? "No invoices found." : "Nenhuma fatura encontrada."}
            headers={[
              locale === "en-US" ? "Reference" : "Referência", 
              locale === "en-US" ? "Date" : "Data", 
              locale === "en-US" ? "Due Date" : "Vencimento", 
              dict.amount, 
              dict.status, 
              locale === "en-US" ? "Actions" : "Ações"
            ]}
            rows={(student?.invoices ?? []).map((invoice) => {
              const statusLabel = invoice.status === "PAID" 
                ? dict.paid 
                : invoice.status === "PENDING" 
                  ? dict.pending 
                  : dict.overdue;

              return [
                <span key={invoice.id} className="font-black text-slate-700">{invoice.reference}</span>,
                invoice.createdAt.toLocaleDateString(locale),
                invoice.dueDate.toLocaleDateString(locale),
                <span key={`val-${invoice.id}`} className="font-bold">{invoice.amountMt} MT</span>,
                <StatusBadge key={`st-${invoice.id}`} tone={invoice.status === "PAID" ? "success" : invoice.status === "OVERDUE" ? "danger" : "warning"}>
                  {statusLabel}
                </StatusBadge>,
                <div key={`act-${invoice.id}`} className="flex gap-2">
                   {invoice.status === "PAID" && invoice.receipt && (
                     <Link href={`/admin/receipts/${invoice.receipt.id}`}>
                        <PrimaryButton tone="light" className="py-1 px-3 h-8 text-[10px]">
                          <Download size={12} /> {dict.receipt}
                        </PrimaryButton>
                     </Link>
                   )}
                   {invoice.status === "PENDING" && (
                      <PrimaryButton tone="dark" className="py-1 px-3 h-8 text-[10px]">
                        {locale === "en-US" ? "Pay" : "Pagar"}
                      </PrimaryButton>
                   )}
                </div>
              ];
            })}
          />
        </BentoCard>
      </div>
    </DashboardLayout>
  );
}
