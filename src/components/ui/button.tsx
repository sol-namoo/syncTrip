import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] shadow-sm hover:bg-[color:color-mix(in_srgb,var(--color-primary)_92%,black)]",
        default:
          "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] shadow-sm hover:bg-[color:color-mix(in_srgb,var(--color-primary)_92%,black)]",
        destructive:
          "bg-[color:var(--color-danger)] text-[color:var(--color-danger-fg)] shadow-sm hover:bg-[color:color-mix(in_srgb,var(--color-danger)_90%,black)]",
        outline:
          "border border-[color:var(--color-border-card)] bg-transparent text-[color:var(--color-primary)] hover:bg-[color:var(--surface-muted)]",
        secondary:
          "bg-[color:var(--color-secondary)] text-[color:var(--color-secondary-fg)] shadow-sm hover:bg-[color:color-mix(in_srgb,var(--color-secondary)_92%,black)]",
        tertiary:
          "bg-[color:var(--color-tertiary)] text-[color:var(--color-tertiary-fg)] shadow-sm hover:bg-[color:color-mix(in_srgb,var(--color-tertiary)_92%,black)]",
        ghost:
          "bg-transparent text-[color:var(--color-primary)] hover:bg-[color:var(--surface-muted)]",
        link: "text-[color:var(--color-primary)] underline-offset-4 hover:underline",
        day1:
          "border border-[color:var(--color-primary)]/25 bg-[color:var(--sage)]/40 text-[color:var(--color-primary)] hover:bg-[color:var(--sage)]/60",
        day2:
          "border border-[color:var(--peri-dark)]/20 bg-[color:var(--peri)]/50 text-[color:var(--peri-dark)] hover:bg-[color:var(--peri)]/70",
        day3:
          "border border-[color:var(--marigold-dark)]/20 bg-[color:var(--marigold)]/55 text-[color:var(--marigold-dark)] hover:bg-[color:var(--marigold)]/75",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
