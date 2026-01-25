import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "glow";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group",
          {
            "bg-gradient-to-r text-white hover:shadow-xl hover:shadow-[rgba(var(--theme-primary-rgb),0.35)] hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] active:translate-y-0 focus:ring-[var(--theme-primary)]":
              variant === "primary",
            "bg-slate-200 dark:bg-slate-950 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus:ring-slate-400":
              variant === "secondary",
            "bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:scale-[1.02] active:scale-[0.98] focus:ring-slate-400":
              variant === "ghost",
            "bg-transparent border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-primary-light)] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus:ring-[var(--theme-primary)]":
              variant === "outline",
            "bg-gradient-to-r text-white shadow-lg shadow-[rgba(var(--theme-primary-rgb),0.4)] hover:shadow-xl hover:shadow-[rgba(var(--theme-primary-rgb),0.5)] hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] active:translate-y-0 animate-pulse-glow focus:ring-[var(--theme-primary)]":
              variant === "glow",
          },
          (variant === "primary" || variant === "glow") && "from-[var(--theme-primary)] to-[var(--theme-primary-light)]",
          {
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          className
        )}
        style={{
          ...(variant === "primary" || variant === "glow" ? {
            background: `linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))`,
          } : {}),
        }}
        {...props}
      >
        {/* Shimmer effect on hover */}
        {(variant === "primary" || variant === "glow") && (
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        
        {/* Loading spinner */}
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
