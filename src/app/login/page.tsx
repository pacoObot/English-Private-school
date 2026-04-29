import { Lock, UserCircle } from "lucide-react";
import { AppLogo } from "@/components/layout/AppLogo";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { loginAction } from "@/features/auth/actions";

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  return (
    <AuthLayout>
      <div className="relative z-10 w-full max-w-[440px]">
        <AppLogo variant="auth" className="mb-6" />

        <section className="rounded-[3rem] border border-slate-100 bg-white/95 p-8 shadow-soft backdrop-blur-md sm:p-10">
          <div className="mb-9 text-center sm:text-left">
            <h2 className="text-xl font-black text-slate-800">Login</h2>
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-crimson sm:mx-0" />
          </div>

          <form action={loginAction} className="space-y-6">
            <FormField name="email" label="Identificacao" placeholder="super.admin.teste@delsonps.local" icon={<UserCircle size={18} />} />
            <div>
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Senha</span>
                <a className="text-[9px] font-black uppercase tracking-widest text-crimson" href="#">
                  Esqueci-me
                </a>
              </div>
              <FormField name="password" label="" type="password" placeholder="••••••••••••" icon={<Lock size={18} />} />
            </div>
            {searchParams?.error ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-center text-xs font-black uppercase tracking-widest text-crimson">
                Credenciais invalidas
              </div>
            ) : null}
            <PrimaryButton className="w-full rounded-[1.5rem] py-4" tone="dark" type="submit">
              Entrar no Portal
            </PrimaryButton>
          </form>

          <div className="mt-8 rounded-[1.5rem] bg-slate-50 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Sprint 1 · Acesso mockado · PT-PT / EN-US preparado
            </p>
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
