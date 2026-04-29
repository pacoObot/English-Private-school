"use client";

import type { ReactNode } from "react";
import type { NavItem } from "./Sidebar";
import { AppShell } from "./AppShell";

type DashboardLayoutProps = {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  subtitle?: string;
  context: string;
  darkSidebar?: boolean;
  sidebarFooter?: ReactNode;
  headerAction?: ReactNode;
};

export function DashboardLayout(props: DashboardLayoutProps) {
  return <AppShell {...props} />;
}
