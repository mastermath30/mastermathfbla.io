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
          "relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-all duration-300 ease-out",
          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950",
          // Disabled states
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          // Touch-friendly: ensure buttons are clickable on iOS/mobile
          "cursor-pointer select-none touch-manipulation",
          // Accessibility and overflow
          "overflow-hidden group",
          {
            "bg-indigo-600 text-white shadow-[0_10px_24px_rgba(79,70,229,0.18)] hover:bg-indigo-700 hover:shadow-[0_12px_28px_rgba(79,70,229,0.22)] active:scale-[0.99] focus:ring-indigo-500":
              variant === "primary",
            "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-sm active:scale-[0.99] focus:ring-slate-400":
              variant === "secondary",
            "bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 active:scale-[0.99] focus:ring-slate-400":
              variant === "ghost",
            "bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-indigo-300 hover:shadow-sm active:scale-[0.99] focus:ring-indigo-500":
              variant === "outline",
            "bg-indigo-600 text-white shadow-[0_10px_24px_rgba(79,70,229,0.2)] hover:bg-indigo-700 hover:shadow-[0_14px_30px_rgba(79,70,229,0.25)] active:scale-[0.99] focus:ring-indigo-500":
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
