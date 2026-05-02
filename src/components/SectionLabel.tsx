import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface SectionLabelProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark" | "gradient";
}

export function SectionLabel({ icon: Icon, children, className, variant = "dark" }: SectionLabelProps) {
  return (
    <span
      className={clsx(
        "inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full px-4 py-2 text-center text-sm leading-tight font-semibold tracking-[-0.01em] transition-colors duration-300",
        variant === "light" && "bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-900/70 dark:text-indigo-300",
        variant === "dark" && "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm",
        variant === "gradient" && "bg-indigo-600 text-white shadow-sm",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </span>
  );
}
