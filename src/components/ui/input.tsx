import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border bg-[rgba(255,255,255,0.92)] px-4 text-sm text-[#223047] shadow-[0_8px_24px_rgba(70,64,43,0.06)] transition-[border-color,box-shadow,background-color] duration-150 ease-out",
        "border-[var(--line)] placeholder:text-[#7c7f89]",
        "hover:border-[var(--line-strong)] data-[hovered=true]:border-[var(--line-strong)]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d4c5a1] focus-visible:border-[#8e8162]",
        "data-[focused=true]:border-[#8e8162] data-[focused=true]:ring-4 data-[focused=true]:ring-[#d4c5a1]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        (invalid || props["aria-invalid"] === true) &&
          "border-[#c97068] bg-[#fff8f7] text-[#71291f] focus-visible:ring-[#f0b1ac] data-[focused=true]:ring-[#f0b1ac]",
        className,
      )}
      aria-invalid={invalid || props["aria-invalid"]}
      {...props}
    />
  );
});
