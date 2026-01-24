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
}

export function StatCard({
  icon: Icon,
  iconColor = "text-violet-500",
  iconBg = "bg-violet-100",
  label,
  value,
  subtext,
  subtextColor = "text-green-600",
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={clsx("w-6 h-6", iconColor)} />
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{value}</p>
          {subtext && (
            <p className={clsx("text-xs mt-0.5 flex items-center gap-1", subtextColor)}>
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
