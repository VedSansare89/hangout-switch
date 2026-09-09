import { cn } from "@/lib/utils";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 64, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <line x1="60" y1="12" x2="68" y2="2" stroke="#4EA1F5" strokeWidth="6" strokeLinecap="round" />
      <line x1="90" y1="16" x2="98" y2="7" stroke="#F0553F" strokeWidth="6" strokeLinecap="round" />
      <circle cx="48" cy="50" r="34" fill="#4EA1F5" />
      <path d="M30 78 Q26 90 14 96 Q29 93 41 82 Z" fill="#4EA1F5" />
      <rect x="58" y="70" width="46" height="26" rx="13" fill="#F0553F" />
      <circle cx="91" cy="83" r="11" fill="#ffffff" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  markSize?: number;
  showTagline?: boolean;
  textClassName?: string;
}

export function Logo({ className, markSize = 64, showTagline = true, textClassName }: LogoProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <LogoMark size={markSize} />
      <div className="mt-1 flex flex-col items-center leading-[1.05]">
        <span className={cn("font-display text-4xl font-semibold text-[#3E9EFF]", textClassName)}>
          Hangout
        </span>
        <span className={cn("font-display text-4xl font-semibold text-[#F0553F]", textClassName)}>
          Switch
        </span>
      </div>
      {showTagline && (
        <div className="mt-2 flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-[#3E9EFF]">
          <span className="h-px w-5 bg-current opacity-60" />
          PARTY GAME
          <span className="h-px w-5 bg-current opacity-60" />
        </div>
      )}
    </div>
  );
}
