import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  label: string;
  value: string | number;
  subtext?: string;
  subtextColor?: string;
  trend?: "up" | "down" | "neutral";
  themed?: boolean;
}

export function StatCard({
  icon: Icon,
  iconColor = "text-violet-500",
  iconBg = "bg-violet-100",
  label,
  value,
  subtext,
  subtextColor = "text-green-600",
  trend,
  themed = false,
}: StatCardProps) {
  return (
    <div className="group bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-xl hover:shadow-[rgba(var(--theme-primary-rgb),0.1)] dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--theme-primary)]/20">
      <div className="flex items-center gap-4">
        <div 
          className={clsx(
            "w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-200 dark:border-slate-700",
            !themed && iconBg
          )}
          style={themed ? { background: 'rgba(var(--theme-primary-rgb), 0.1)' } : {}}
        >
          <Icon 
            className={clsx("w-6 h-6", !themed && iconColor)} 
            style={themed ? { color: 'var(--theme-primary)' } : {}}
          />
        </div>
        <div className="flex-1">
          <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">{value}</p>
          {subtext && (
            <p className={clsx("text-xs mt-0.5 flex items-center gap-1 font-medium", subtextColor)}>
              {trend === "up" && <span className="inline-block w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-current" />}
              {trend === "down" && <span className="inline-block w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-current" />}
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
