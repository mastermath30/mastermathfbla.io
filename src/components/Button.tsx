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
        data-ui-button={variant}
        disabled={disabled || loading}
        className={clsx(
          // Shared button language for primary, secondary, and utility actions.
          "relative inline-flex min-w-0 items-center justify-center gap-2 overflow-hidden rounded-full border border-transparent font-semibold leading-tight tracking-[-0.01em] transition-all duration-200 ease-out",
          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950",
          // Disabled states
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          // Touch-friendly: ensure buttons are clickable on iOS/mobile
          "cursor-pointer select-none touch-manipulation",
          // Accessibility and overflow
          "overflow-hidden group",
          {
            "mm-primary-action shadow-[0_10px_24px_rgba(var(--theme-primary-rgb),0.22)] hover:shadow-[0_12px_28px_rgba(var(--theme-primary-rgb),0.30)] active:scale-[0.99] focus:ring-[var(--theme-primary)]":
              variant === "primary",
            "border-[var(--theme-primary)]/30 bg-white text-[var(--theme-primary-dark)] dark:bg-slate-900 dark:text-[var(--theme-primary-light)] hover:border-[var(--theme-primary)] hover:bg-[var(--accent-soft)] hover:shadow-sm active:scale-[0.99] focus:ring-[var(--theme-primary)]":
              variant === "secondary",
            "bg-transparent text-[var(--theme-primary-dark)] dark:text-[var(--theme-primary-light)] hover:bg-[var(--accent-soft)] active:scale-[0.99] focus:ring-[var(--theme-primary)]":
              variant === "ghost",
            "border-[var(--theme-primary)]/45 bg-white text-[var(--theme-primary-dark)] dark:bg-slate-900 dark:text-[var(--theme-primary-light)] hover:border-[var(--theme-primary)] hover:bg-[var(--accent-soft)] hover:shadow-sm active:scale-[0.99] focus:ring-[var(--theme-primary)]":
              variant === "outline",
            "mm-primary-action shadow-[0_10px_24px_rgba(var(--theme-primary-rgb),0.25)] hover:shadow-[0_14px_30px_rgba(var(--theme-primary-rgb),0.35)] active:scale-[0.99] focus:ring-[var(--theme-primary)]":
              variant === "glow",
          },
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
        }}
        {...props}
      >
        {/* Shimmer effect on hover */}
        {false && (variant === "primary" || variant === "glow") && (
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
