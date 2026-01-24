import clsx from "clsx";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "info" | "violet" | "purple";
  size?: "sm" | "md";
}

export function Badge({ 
  variant = "default", 
  size = "sm", 
  className, 
  children, 
  ...props 
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 font-medium rounded-full",
        {
          "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200": variant === "default",
          "bg-green-500/15 text-green-700 dark:text-green-300": variant === "success",
          "bg-yellow-500/15 text-yellow-700 dark:text-yellow-200": variant === "warning",
          "bg-blue-500/15 text-blue-700 dark:text-blue-200": variant === "info",
          "bg-violet-500/15 text-violet-700 dark:text-violet-200": variant === "violet",
          "bg-purple-500/15 text-purple-700 dark:text-purple-200": variant === "purple",
        },
        {
          "px-2 py-0.5 text-xs": size === "sm",
          "px-3 py-1 text-sm": size === "md",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
