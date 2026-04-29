import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white/70 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={20} />
      </div>
      <h3 className="font-black text-slate-800">{title}</h3>
      <p className="mt-2 text-sm font-medium text-slate-400">{description}</p>
    </div>
  );
}
