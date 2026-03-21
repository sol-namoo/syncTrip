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
          "bg-primary text-primary-foreground shadow-sm hover:brightness-95",
        default:
          "bg-primary text-primary-foreground shadow-sm hover:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:brightness-95",
        outline:
          "border border-border-card-token bg-transparent text-primary hover:bg-surface-muted-token",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:brightness-95",
        tertiary:
          "bg-tertiary text-tertiary-foreground shadow-sm hover:brightness-95",
        ghost:
          "bg-transparent text-primary hover:bg-surface-muted-token",
        link: "text-primary underline-offset-4 hover:underline",
        day1:
          "border border-primary/25 bg-sage/40 text-primary hover:bg-sage/60",
        day2:
          "border border-peri-dark-token/20 bg-peri/50 text-peri-dark-token hover:bg-peri/70",
        day3:
          "border border-marigold-dark-token/20 bg-marigold/55 text-marigold-dark-token hover:bg-marigold/75",
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
