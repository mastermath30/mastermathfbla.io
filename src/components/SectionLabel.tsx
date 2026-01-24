import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface SectionLabelProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark";
}

export function SectionLabel({ icon: Icon, children, className, variant = "dark" }: SectionLabelProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
        variant === "light" && "bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300",
        variant === "dark" && "bg-slate-900/10 dark:bg-white/10 border border-slate-900/20 dark:border-white/20 text-slate-700 dark:text-white/90",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </span>
  );
}
