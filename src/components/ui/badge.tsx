import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const toneClasses = {
  neutral: "bg-[rgba(34,48,71,0.08)] text-[#223047]",
  primary: "bg-[rgba(31,58,95,0.12)] text-[var(--primary)]",
  success: "bg-[rgba(15,123,108,0.14)] text-[var(--success)]",
  warning: "bg-[rgba(183,121,31,0.16)] text-[var(--warning)]",
  danger: "bg-[rgba(185,56,47,0.12)] text-[var(--danger)]",
  outline: "border border-[var(--line)] bg-transparent text-[#4b5363]",
} as const;

export type BadgeTone = keyof typeof toneClasses;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-[0.01em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
