import clsx from "clsx";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "glass" | "gradient" | "elevated";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  glow?: boolean;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", hover = true, padding = "md", glow = true, interactive = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "group/card rounded-[26px] transition-all duration-300 ease-out",
          {
            "bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_44px_rgba(2,6,23,0.35)]": variant === "default",
            "bg-transparent border border-slate-300/80 dark:border-slate-700/80": variant === "outline",
            "bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/30 dark:border-slate-800/70 shadow-[0_18px_48px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_52px_rgba(2,6,23,0.38)]": variant === "glass",
            "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_14px_42px_rgba(15,23,42,0.06)] dark:shadow-[0_18px_46px_rgba(2,6,23,0.35)]": variant === "gradient",
            "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_18px_48px_rgba(15,23,42,0.08)] dark:shadow-[0_22px_54px_rgba(2,6,23,0.4)]": variant === "elevated",
          },
          hover && "hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgba(15,23,42,0.1)] dark:hover:shadow-[0_26px_70px_rgba(2,6,23,0.45)]",
          glow && "shadow-[0_0_24px_rgba(var(--theme-primary-rgb),0.06)] dark:shadow-[0_0_28px_rgba(var(--theme-primary-rgb),0.1)] hover:shadow-[0_0_38px_rgba(var(--theme-primary-rgb),0.12)] dark:hover:shadow-[0_0_42px_rgba(var(--theme-primary-rgb),0.16)]",
          interactive && "cursor-pointer active:scale-[0.98] hover:border-[var(--theme-primary)]/30",
          {
            "p-0": padding === "none",
            "p-5": padding === "sm",
            "p-6 md:p-7": padding === "md",
            "p-8 md:p-10": padding === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("mb-4", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={clsx("text-xl font-bold text-slate-900 dark:text-white tracking-tight", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={clsx("text-slate-600 dark:text-slate-400 text-sm mt-1 leading-relaxed", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("mt-4 pt-4 border-t border-slate-200 dark:border-slate-800", className)} {...props}>
    {children}
  </div>
);
