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
  ({ variant = "default", hover = true, padding = "md", glow = false, interactive = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "group/card rounded-[24px] transition-all duration-300 ease-out",
          {
            "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_10px_28px_rgba(15,23,42,0.05)] dark:shadow-[0_14px_34px_rgba(2,6,23,0.32)]": variant === "default",
            "bg-transparent border border-slate-300/80 dark:border-slate-700/80": variant === "outline",
            "bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_14px_36px_rgba(2,6,23,0.34)]": variant === "glass",
            "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_10px_28px_rgba(15,23,42,0.055)] dark:shadow-[0_14px_34px_rgba(2,6,23,0.32)]": variant === "gradient",
            "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_14px_36px_rgba(15,23,42,0.07)] dark:shadow-[0_18px_42px_rgba(2,6,23,0.36)]": variant === "elevated",
          },
          hover && "hover:-translate-y-px hover:shadow-[0_16px_42px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_20px_48px_rgba(2,6,23,0.4)]",
          glow && "shadow-[0_0_18px_rgba(var(--theme-primary-rgb),0.035)] dark:shadow-[0_0_22px_rgba(var(--theme-primary-rgb),0.07)] hover:shadow-[0_0_24px_rgba(var(--theme-primary-rgb),0.06)] dark:hover:shadow-[0_0_28px_rgba(var(--theme-primary-rgb),0.1)]",
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
