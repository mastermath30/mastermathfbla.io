import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-[13px] font-semibold tracking-[0.01em] text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              "w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300",
              "min-h-12 rounded-2xl bg-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:bg-slate-900/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
              "focus:outline-none focus:ring-2 focus:ring-[rgba(var(--theme-primary-rgb),0.22)] focus:border-[rgba(var(--theme-primary-rgb),0.55)]",
              "hover:border-slate-300/90 dark:hover:border-slate-600/90 hover:shadow-md",
              icon && "pl-11",
              error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1"><span className="inline-block w-1 h-1 rounded-full bg-red-500" />{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-[13px] font-semibold tracking-[0.01em] text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            "w-full resize-none rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-300 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] dark:placeholder:text-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-[rgba(var(--theme-primary-rgb),0.22)] focus:border-[rgba(var(--theme-primary-rgb),0.55)]",
            "hover:border-slate-300/90 dark:hover:border-slate-600/90 hover:shadow-md",
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1"><span className="inline-block w-1 h-1 rounded-full bg-red-500" />{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-[13px] font-semibold tracking-[0.01em] text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={clsx(
              "min-h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 pr-10 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-300 cursor-pointer dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
              "focus:outline-none focus:ring-2 focus:ring-[rgba(var(--theme-primary-rgb),0.22)] focus:border-[rgba(var(--theme-primary-rgb),0.55)]",
              "hover:border-slate-300/90 dark:hover:border-slate-600/90 hover:shadow-md",
              error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1"><span className="inline-block w-1 h-1 rounded-full bg-red-500" />{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
