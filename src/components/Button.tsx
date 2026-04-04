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
          "relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 ease-out",
          // Glass baseline
          "glass-medium",
          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950",
          // Disabled states
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          // Touch-friendly: ensure buttons are clickable on iOS/mobile
          "cursor-pointer select-none touch-manipulation",
          // Accessibility and overflow
          "overflow-hidden group",
          // Liquid glass highlight/refraction layer (most visible in dark mode)
          "before:content-[''] before:absolute before:inset-[1px] before:rounded-[calc(theme(borderRadius.xl)-1px)] before:pointer-events-none before:bg-gradient-to-br before:from-white/50 before:via-white/15 before:to-transparent dark:before:from-white/20 dark:before:via-white/5 dark:before:to-white/0 before:opacity-80 dark:before:opacity-100",
          {
            "bg-gradient-to-r text-white shadow-[0_0_0_1px_rgba(var(--theme-primary-rgb),0.28),0_0_26px_rgba(var(--theme-primary-rgb),0.38)] hover:shadow-[0_0_0_1px_rgba(var(--theme-primary-rgb),0.34),0_0_38px_rgba(var(--theme-primary-rgb),0.62)] hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0 focus:ring-[var(--theme-primary)] animate-pulse-glow":
              variant === "primary",
            "bg-slate-200/70 dark:bg-[color-mix(in_srgb,rgb(15_23_42)_78%,transparent)] text-slate-800 dark:text-slate-100 hover:bg-slate-300/80 dark:hover:bg-[color-mix(in_srgb,rgb(30_41_59)_82%,transparent)] hover:-translate-y-0.5 hover:shadow-lg dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_28px_rgba(2,6,23,0.35)] active:translate-y-0 focus:ring-slate-400":
              variant === "secondary",
            "bg-white/35 dark:bg-[color-mix(in_srgb,rgb(15_23_42)_68%,transparent)] text-slate-700 dark:text-slate-200 hover:bg-slate-100/65 dark:hover:bg-[color-mix(in_srgb,rgb(30_41_59)_74%,transparent)] hover:translate-y-[-1px] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_22px_rgba(2,6,23,0.30)] active:scale-[0.99] focus:ring-slate-400":
              variant === "ghost",
            "bg-white/30 dark:bg-[color-mix(in_srgb,rgb(15_23_42)_72%,transparent)] border-2 border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-primary-light)] hover:-translate-y-0.5 hover:shadow-md dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_24px_rgba(2,6,23,0.32)] active:translate-y-0 focus:ring-[var(--theme-primary)]":
              variant === "outline",
            "bg-gradient-to-r text-white shadow-[0_0_0_1px_rgba(var(--theme-primary-rgb),0.32),0_0_32px_rgba(var(--theme-primary-rgb),0.52)] hover:shadow-[0_0_0_1px_rgba(var(--theme-primary-rgb),0.38),0_0_44px_rgba(var(--theme-primary-rgb),0.72)] hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99] active:translate-y-0 animate-pulse-glow focus:ring-[var(--theme-primary)]":
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
        
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
