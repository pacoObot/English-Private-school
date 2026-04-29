"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar, type NavItem } from "./Sidebar";
import { MobileShell } from "./MobileShell";

type AppShellProps = {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  subtitle?: string;
  context: string;
  darkSidebar?: boolean;
  sidebarFooter?: ReactNode;
  headerAction?: ReactNode;
};

export function AppShell({
  children,
  navItems,
  title,
  subtitle,
  context,
  darkSidebar,
  sidebarFooter,
  headerAction
}: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar
        items={navItems}
        context={context}
        dark={darkSidebar}
        open={open}
        onClose={() => setOpen(false)}
        footer={sidebarFooter}
      />
      <MobileShell title={title} subtitle={subtitle} onMenuClick={() => setOpen(true)} action={headerAction}>
        {children}
      </MobileShell>
    </div>
  );
}
