import { Lock, UserCircle, ChevronRight } from "lucide-react";
import { AppLogo } from "@/components/layout/AppLogo";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import { loginAction } from "@/features/auth/actions";
import { LoginSubmitButton } from "@/components/auth/LoginSubmitButton";
import { getDictionary } from "@/i18n/locale";
import { LoginLanguageToggle } from "@/components/layout/LoginLanguageToggle";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";

export default async function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  const dict = await getDictionary();

  return (
    <AuthLayout>
      <div className="relative z-10 w-full max-w-[440px] px-4">
        <AppLogo variant="auth" className="mb-8" />

        <section className="rounded-[3.5rem] border border-white bg-white/90 p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-xl">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">{dict.loginPortal}</h2>
            <div className="mt-2 h-1.5 w-10 rounded-full bg-crimson" />
          </div>

          <form action={loginAction} className="space-y-7">
            <FormField 
              name="email" 
              label={dict.identification} 
              placeholder={dict.identificationPlaceholder} 
              icon={<UserCircle size={18} />} 
              required
            />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{dict.password}</span>
                <a className="text-[10px] font-black uppercase tracking-[0.1em] text-crimson hover:underline" href="#">
                  {dict.forgotPassword}
                </a>
              </div>
              <PasswordField name="password" placeholder="••••••••••••" required />
            </div>
            {searchParams?.error ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center text-[10px] font-black uppercase tracking-widest text-crimson">
                {dict.invalidCredentials}
              </div>
            ) : null}
            
            <div className="pt-2">
              <LoginSubmitButton label={dict.loginButton} loadingLabel={dict.processing} />
            </div>
          </form>
        </section>

        {/* Language Selector & Install Button */}
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-3">
            <LoginLanguageToggle />
            <PWAInstallButton />
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
