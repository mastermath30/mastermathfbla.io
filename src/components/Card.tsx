import clsx from "clsx";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "glass" | "gradient";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  glow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", hover = true, padding = "md", glow = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-2xl transition-all duration-300",
          {
            "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 shadow-sm": variant === "default",
            "bg-transparent border border-slate-300 dark:border-slate-700": variant === "outline",
            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-lg": variant === "glass",
            "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-700/50": variant === "gradient",
          },
          hover && "hover:-translate-y-1",
          glow && "shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.2)] dark:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.25)] hover:shadow-[0_0_45px_rgba(var(--theme-primary-rgb),0.35)] dark:hover:shadow-[0_0_45px_rgba(var(--theme-primary-rgb),0.45)]",
          {
            "p-0": padding === "none",
            "p-4": padding === "sm",
            "p-6": padding === "md",
            "p-8": padding === "lg",
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
  <h3 className={clsx("text-xl font-bold text-slate-900 dark:text-white", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={clsx("text-slate-600 dark:text-slate-400 text-sm mt-1", className)} {...props}>
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
