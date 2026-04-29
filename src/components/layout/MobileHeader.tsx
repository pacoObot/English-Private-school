"use client";

import { TopBar } from "./TopBar";

type MobileHeaderProps = {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  action?: React.ReactNode;
};

export function MobileHeader({ title, subtitle, onMenuClick, action }: MobileHeaderProps) {
  return <TopBar title={title} subtitle={subtitle} onMenuClick={onMenuClick} action={action} />;
}
