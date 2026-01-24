export function MathLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background gradient - uses CSS variables for theme colors */}
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="var(--theme-primary, #7c3aed)" />
            <stop offset="100%" stopColor="var(--theme-primary-light, #a855f7)" />
          </linearGradient>
        </defs>
        
        <rect
          x="0"
          y="0"
          width="40"
          height="40"
          rx="10"
          fill="url(#logoGradient)"
        />
        
        {/* Pi symbol */}
        <text
          x="20"
          y="28"
          fontFamily="serif"
          fontSize="24"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
        >
          π
        </text>
      </svg>
    </div>
  );
}
