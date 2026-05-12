import { Lock, UserCircle, ChevronRight } from "lucide-react";
import { AppLogo } from "@/components/layout/AppLogo";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PasswordField } from "@/components/ui/PasswordField";
import { loginAction } from "@/features/auth/actions";

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  return (
    <AuthLayout>
      <div className="relative z-10 w-full max-w-[440px] px-4">
        <AppLogo variant="auth" className="mb-8" />

        <section className="rounded-[3.5rem] border border-white bg-white/90 p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-xl">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Portal de Acesso</h2>
            <div className="mt-2 h-1.5 w-10 rounded-full bg-crimson" />
          </div>

          <form action={loginAction} className="space-y-7">
            <FormField 
              name="email" 
              label="Identificação" 
              placeholder="Email ou código de estudante" 
              icon={<UserCircle size={18} />} 
              required
            />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Senha</span>
                <a className="text-[10px] font-black uppercase tracking-[0.1em] text-crimson hover:underline" href="#">
                  Esqueci-me
                </a>
              </div>
              <PasswordField name="password" placeholder="••••••••••••" required />
            </div>
            {searchParams?.error ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center text-[10px] font-black uppercase tracking-widest text-crimson">
                Email, código de estudante ou senha inválidos
              </div>
            ) : null}
            
            <div className="pt-2">
              <button type="submit" className="w-full btn-gradient text-white font-black text-[11px] uppercase tracking-[0.3em] py-5 rounded-[1.5rem] flex items-center justify-center gap-3">
                Aceder ao Sistema
                <ChevronRight size={14} />
              </button>
            </div>
          </form>
        </section>

        {/* Language Selector */}
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex gap-2">
            <button className="px-5 py-2 rounded-full border-2 border-navy flex items-center gap-2 bg-white shadow-sm transition-all group">
              <img src="https://flagcdn.com/w40/pt.png" className="w-4 h-auto rounded-xs" alt="PT" />
              <span className="text-[10px] font-black text-navy">PT</span>
            </button>
            <button className="px-5 py-2 rounded-full border-2 border-slate-100 flex items-center gap-2 bg-white shadow-sm hover:border-crimson transition-all group">
              <img src="https://flagcdn.com/w40/gb.png" className="w-4 h-auto rounded-xs grayscale group-hover:grayscale-0 transition-all" alt="EN" />
              <span className="text-[10px] font-black text-slate-400 group-hover:text-crimson">EN</span>
            </button>
          </div>

          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center leading-relaxed">
            © 2026 Delson PS Ecosystem<br />
            <span className="text-slate-200">Maputo Management Hub</span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
