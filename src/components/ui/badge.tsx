import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  neutral:
    "border border-[color:var(--color-primary)]/15 bg-[color:var(--color-bg-page)] text-[color:var(--color-primary)]",
  sage:
    "border border-[color:var(--color-primary)]/20 bg-[color:var(--sage)]/40 text-[color:var(--color-primary)]",
  periwinkle:
    "border border-[color:var(--peri-dark)]/20 bg-[color:var(--peri)]/45 text-[color:var(--peri-dark)]",
  marigold:
    "border border-[color:var(--marigold-dark)]/20 bg-[color:var(--marigold)]/45 text-[color:var(--marigold-dark)]",
  terra:
    "border border-[color:var(--color-danger)]/20 bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]",
  online:
    "border border-[color:var(--color-primary)]/30 bg-[color:var(--color-bg-page)] text-[color:var(--color-primary)]",
  outline:
    "border border-[color:var(--color-primary)]/15 bg-white text-[color:var(--color-ink)]",
  primary:
    "border border-[color:var(--color-primary)]/20 bg-[color:var(--sage)]/40 text-[color:var(--color-primary)]",
  success:
    "border border-[color:var(--color-primary)]/20 bg-[color:var(--sage)]/40 text-[color:var(--color-primary)]",
  warning:
    "border border-[color:var(--color-tertiary)]/20 bg-[color:var(--marigold)]/40 text-[color:var(--color-tertiary)]",
  danger:
    "border border-[color:var(--color-danger)]/20 bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]",
} as const;

export type BadgeVariant = keyof typeof variantClasses;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  tone?: BadgeVariant;
};

export function Badge({ className, variant, tone, ...props }: BadgeProps) {
  const resolvedVariant = variant ?? tone ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-[0.01em]",
        variantClasses[resolvedVariant],
        className,
      )}
      {...props}
    />
  );
}
