import clsx from "clsx";

interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  gradient?: "violet" | "blue" | "purple" | "green" | "pink";
}

const gradients = {
  violet: "from-violet-500 to-purple-500",
  blue: "from-blue-400 to-cyan-500",
  purple: "from-purple-400 to-pink-500",
  green: "from-green-400 to-emerald-500",
  pink: "from-pink-400 to-rose-500",
};

export function Avatar({ initials, size = "md", gradient = "violet" }: AvatarProps) {
  return (
    <div
      className={clsx(
        "bg-gradient-to-br text-white font-bold flex items-center justify-center rounded-xl",
        gradients[gradient],
        {
          "w-8 h-8 text-xs": size === "sm",
          "w-10 h-10 text-sm": size === "md",
          "w-14 h-14 text-lg": size === "lg",
          "w-24 h-24 text-2xl rounded-2xl": size === "xl",
        }
      )}
    >
      {initials}
    </div>
  );
}
