import Image from "next/image";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { PresenceDot, type PresenceTone } from "@/components/ui/presence-dot";

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

export type AvatarSize = keyof typeof sizeClasses;

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  status?: PresenceTone;
  showStatus?: boolean;
};

export type AvatarStackUser = {
  id: string;
  name: string;
  src?: string | null;
  status?: PresenceTone;
};

export type AvatarStackProps = HTMLAttributes<HTMLDivElement> & {
  users: AvatarStackUser[];
  size?: AvatarSize;
  max?: number;
};

function getInitials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return letters || "?";
}

export function Avatar({
  className,
  name,
  src,
  size = "md",
  status = "online",
  showStatus = true,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn("relative inline-flex shrink-0", sizeClasses[size], className)}
      title={name}
      {...props}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-[linear-gradient(135deg,#f5ede0_0%,#d9cfbb_100%)] font-semibold text-[#223047] shadow-[0_10px_25px_rgba(66,55,29,0.12)]">
        {src ? (
          <Image src={src} alt={name} fill unoptimized className="object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {showStatus ? (
        <PresenceDot
          tone={status}
          size={size === "lg" ? "md" : "sm"}
          pulse={status === "editing"}
          className="absolute -bottom-0.5 -right-0.5"
        />
      ) : null}
    </div>
  );
}

export function AvatarStack({
  className,
  users,
  size = "md",
  max = 4,
  ...props
}: AvatarStackProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = Math.max(users.length - max, 0);

  return (
    <div className={cn("flex items-center", className)} {...props}>
      <div className="flex items-center">
        {visibleUsers.map((user, index) => (
          <Avatar
            key={user.id}
            name={user.name}
            src={user.src}
            status={user.status}
            size={size}
            className={cn(index > 0 && "-ml-3")}
          />
        ))}
      </div>
      {remainingCount > 0 ? (
        <div
          className={cn(
            "-ml-3 inline-flex items-center justify-center rounded-2xl border border-white/80 bg-[#223047] font-semibold text-white shadow-[0_10px_25px_rgba(34,48,71,0.2)]",
            sizeClasses[size],
          )}
          title={`${remainingCount}명 추가 접속 중`}
        >
          +{remainingCount}
        </div>
      ) : null}
    </div>
  );
}
