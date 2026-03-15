import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const toneClasses = {
  online: "bg-[#17a34a]",
  away: "bg-[#d97706]",
  editing: "bg-[#2563eb]",
  offline: "bg-[#98a2b3]",
} as const;

const sizeClasses = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
} as const;

export type PresenceTone = keyof typeof toneClasses;
export type PresenceDotSize = keyof typeof sizeClasses;

export type PresenceDotProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: PresenceTone;
  size?: PresenceDotSize;
  pulse?: boolean;
};

export function PresenceDot({
  className,
  tone = "online",
  size = "md",
  pulse = false,
  ...props
}: PresenceDotProps) {
  return (
    <span
      className={cn("relative inline-flex", className)}
      aria-label={tone}
      role="status"
      {...props}
    >
      {pulse ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-full opacity-40 animate-ping",
            toneClasses[tone],
            sizeClasses[size],
          )}
        />
      ) : null}
      <span
        aria-hidden="true"
        className={cn(
          "relative rounded-full ring-2 ring-white",
          toneClasses[tone],
          sizeClasses[size],
        )}
      />
    </span>
  );
}
