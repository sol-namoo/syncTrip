import type { BadgeVariant } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

const DAY_TOKEN_SET = [
  {
    accent: "var(--color-primary)",
    fg: "var(--color-primary-fg)",
    wash: "var(--color-washi-green)",
    colBg: "var(--color-col-bg-day1)",
    buttonVariant: "day1" as ButtonVariant,
    badgeVariant: "sage" as BadgeVariant,
  },
  {
    accent: "var(--color-secondary)",
    fg: "var(--peri-dark)",
    wash: "var(--color-washi-blue)",
    colBg: "var(--color-col-bg-day2)",
    buttonVariant: "day2" as ButtonVariant,
    badgeVariant: "periwinkle" as BadgeVariant,
  },
  {
    accent: "var(--color-tertiary)",
    fg: "var(--marigold-dark)",
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
