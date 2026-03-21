import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  neutral:
    "border border-primary/15 bg-page text-primary",
  sage:
    "border border-primary/20 bg-sage/40 text-primary",
  periwinkle:
    "border border-peri-dark-token/20 bg-peri/45 text-peri-dark-token",
  marigold:
    "border border-marigold-dark-token/20 bg-marigold/45 text-marigold-dark-token",
  terra:
    "border border-destructive/20 bg-destructive/10 text-destructive",
  online:
    "border border-primary/30 bg-page text-primary",
  outline:
    "border border-primary/15 bg-white text-foreground",
  primary:
    "border border-primary/20 bg-sage/40 text-primary",
  success:
    "border border-primary/20 bg-sage/40 text-primary",
  warning:
    "border border-tertiary/20 bg-marigold/40 text-tertiary",
  danger:
    "border border-destructive/20 bg-destructive/10 text-destructive",
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
