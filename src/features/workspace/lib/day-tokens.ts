import type { BadgeVariant } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

const DAY_TOKEN_SET = [
  {
    accent: "var(--color-primary)",
    fg: "var(--color-primary-fg)",
    dot: "#2563EB",
    wash: "var(--color-washi-green)",
    colBg: "var(--color-col-bg-day1)",
    buttonVariant: "day1" as ButtonVariant,
    badgeVariant: "sage" as BadgeVariant,
  },
  {
    accent: "var(--color-secondary)",
    fg: "var(--color-secondary-fg)",
    dot: "#0F766E",
    wash: "var(--color-washi-blue)",
    colBg: "var(--color-col-bg-day2)",
    buttonVariant: "day2" as ButtonVariant,
    badgeVariant: "periwinkle" as BadgeVariant,
  },
  {
    accent: "var(--color-tertiary)",
    fg: "var(--color-tertiary-fg)",
    dot: "#D97706",
    wash: "var(--color-washi-yellow)",
    colBg: "var(--color-col-bg-day3)",
    buttonVariant: "day3" as ButtonVariant,
    badgeVariant: "marigold" as BadgeVariant,
  },
] as const;

export function getDayTokens(dayNumber: number) {
  const safeIndex = Math.max(dayNumber - 1, 0) % DAY_TOKEN_SET.length;
  return DAY_TOKEN_SET[safeIndex];
}
