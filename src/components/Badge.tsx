import clsx from "clsx";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "info" | "violet" | "purple" | "gradient";
  size?: "sm" | "md";
  pulse?: boolean;
  icon?: React.ReactNode;
}

export function Badge({ 
  variant = "default", 
  size = "sm", 
  pulse = false,
  icon,
  className, 
  children, 
  ...props 
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200",
        {
          "bg-slate-200 dark:bg-slate-950 text-slate-700 dark:text-slate-200": variant === "default",
          "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/20": variant === "success",
          "bg-yellow-500/15 text-yellow-700 dark:text-yellow-200 border border-yellow-500/20": variant === "warning",
          "bg-blue-500/15 text-blue-700 dark:text-blue-200 border border-blue-500/20": variant === "info",
          "bg-violet-500/15 text-violet-700 dark:text-violet-200 border border-violet-500/20": variant === "violet",
          "bg-purple-500/15 text-purple-700 dark:text-purple-200 border border-purple-500/20": variant === "purple",
          "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-light)] text-white shadow-sm": variant === "gradient",
        },
        {
          "px-2.5 py-0.5 text-xs": size === "sm",
          "px-3.5 py-1.5 text-sm": size === "md",
        },
        pulse && "animate-pulse",
        className
      )}
      {...props}
    >
      {pulse && variant === "success" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
