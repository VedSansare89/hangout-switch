import { getAvatarById } from "@/lib/avatars";
import { cn } from "@/lib/utils";

interface AvatarBadgeProps {
  avatarId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-6 text-sm",
  md: "size-9 text-lg",
  lg: "size-14 text-2xl",
};

export function AvatarBadge({ avatarId, size = "md", className }: AvatarBadgeProps) {
  const avatar = getAvatarById(avatarId);
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        avatar.bg,
        sizeClasses[size],
        className
      )}
    >
      {avatar.emoji}
    </span>
  );
}
