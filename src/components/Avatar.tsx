import clsx from "clsx";

interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  gradient?: "themed" | "violet" | "blue" | "purple" | "green" | "pink";
  ring?: boolean;
}

const gradients = {
  violet: "from-violet-500 to-purple-500",
  blue: "from-blue-400 to-cyan-500",
  purple: "from-purple-400 to-pink-500",
  green: "from-green-400 to-emerald-500",
  pink: "from-pink-400 to-rose-500",
  themed: "", // Will use inline style
};

export function Avatar({ initials, size = "md", gradient = "themed", ring = false }: AvatarProps) {
  return (
    <div
      className={clsx(
        "text-white font-bold flex items-center justify-center transition-transform duration-200 hover:scale-105",
        gradient !== "themed" && `bg-gradient-to-br ${gradients[gradient]}`,
        {
          "w-8 h-8 text-xs rounded-lg": size === "sm",
          "w-10 h-10 text-sm rounded-xl": size === "md",
          "w-14 h-14 text-lg rounded-xl": size === "lg",
          "w-24 h-24 text-2xl rounded-2xl": size === "xl",
        },
        ring && "ring-2 ring-white dark:ring-slate-900 ring-offset-2 ring-offset-white dark:ring-offset-slate-900"
      )}
      style={gradient === "themed" ? { background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" } : {}}
    >
      {initials}
    </div>
  );
}
