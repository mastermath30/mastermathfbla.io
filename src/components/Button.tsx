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
          // Base styles with touch-friendly improvements
          "relative inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-[-0.01em] transition-all duration-300 ease-out",
          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950",
          // Disabled states
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          // Touch-friendly: ensure buttons are clickable on iOS/mobile
          "cursor-pointer select-none touch-manipulation",
          // Accessibility and overflow
          "overflow-hidden group",
          {
            "bg-gradient-to-r text-white shadow-[0_14px_36px_rgba(var(--theme-primary-rgb),0.24)] hover:shadow-[0_18px_42px_rgba(var(--theme-primary-rgb),0.32)] hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0 focus:ring-[var(--theme-primary)]":
              variant === "primary",
            "bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus:ring-slate-400":
              variant === "secondary",
            "bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:-translate-y-0.5 active:scale-[0.99] focus:ring-slate-400":
              variant === "ghost",
            "bg-transparent border border-slate-300/90 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 hover:border-[rgba(var(--theme-primary-rgb),0.45)] hover:bg-white/70 dark:hover:bg-slate-900/70 hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-primary-light)] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus:ring-[var(--theme-primary)]":
              variant === "outline",
            "bg-gradient-to-r text-white shadow-lg shadow-[rgba(var(--theme-primary-rgb),0.34)] hover:shadow-xl hover:shadow-[rgba(var(--theme-primary-rgb),0.42)] hover:-translate-y-1 active:scale-[0.99] active:translate-y-0 animate-pulse-glow focus:ring-[var(--theme-primary)]":
              variant === "glow",
          },
          (variant === "primary" || variant === "glow") && "from-[var(--theme-primary)] to-[var(--theme-primary-light)]",
          {
            "min-h-10 px-4 py-2 text-sm": size === "sm",
            "min-h-11 px-5 py-2.5 text-sm sm:text-base": size === "md",
            "min-h-12 px-6 py-3 text-base sm:text-lg": size === "lg",
          },
          className
        )}
        style={{
          // Disable iOS tap highlight for better touch feedback
          WebkitTapHighlightColor: 'transparent',
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
        
        <span className="relative z-10 flex items-center gap-2 text-center">
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
