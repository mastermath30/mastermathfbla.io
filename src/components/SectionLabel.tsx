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
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105",
        variant === "light" && "bg-[rgba(var(--theme-primary-rgb),0.1)] border border-[rgba(var(--theme-primary-rgb),0.2)] text-[var(--theme-primary)]",
        variant === "dark" && "bg-slate-900/10 dark:bg-white/10 border border-slate-900/20 dark:border-white/20 text-slate-700 dark:text-white/90 backdrop-blur-sm",
        variant === "gradient" && "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-light)] text-white shadow-lg shadow-[rgba(var(--theme-primary-rgb),0.3)]",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </span>
  );
}
