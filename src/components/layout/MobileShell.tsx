"use client";

import type { ReactNode } from "react";
import { MobileHeader } from "./MobileHeader";

type MobileShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  action?: ReactNode;
};

export function MobileShell({ children, title, subtitle, onMenuClick, action }: MobileShellProps) {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <MobileHeader title={title} subtitle={subtitle} onMenuClick={onMenuClick} action={action} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-8">{children}</div>
    </main>
  );
}
