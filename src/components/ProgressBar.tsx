import clsx from "clsx";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "themed" | "violet" | "green" | "yellow" | "blue" | "purple";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  color = "themed",
  size = "md",
  showLabel = false,
  animated = false,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      <div
        className={clsx(
          "w-full bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden",
          {
            "h-1.5": size === "sm",
            "h-2.5": size === "md",
            "h-3.5": size === "lg",
          }
        )}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-700 ease-out relative",
            {
              "bg-gradient-to-r from-violet-600 to-purple-500": color === "violet",
              "bg-gradient-to-r from-green-500 to-emerald-500": color === "green",
              "bg-gradient-to-r from-yellow-500 to-amber-400": color === "yellow",
              "bg-gradient-to-r from-blue-500 to-cyan-500": color === "blue",
              "bg-gradient-to-r from-purple-500 to-pink-500": color === "purple",
            }
          )}
          style={{ 
            width: `${percentage}%`,
            ...(color === "themed" ? { background: "linear-gradient(90deg, var(--theme-primary), var(--theme-primary-light))" } : {})
          }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
      {showLabel && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-mono">{percentage.toFixed(0)}%</p>
      )}
    </div>
  );
}
