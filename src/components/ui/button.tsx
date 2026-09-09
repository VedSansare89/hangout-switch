import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200",
        gradient:
          "text-white shadow-lg shadow-black/10 bg-gradient-to-r hover:brightness-105",
        outline:
          "border-2 bg-white hover:bg-neutral-50 dark:bg-white/10 dark:hover:bg-white/20",
        ghost:
          "hover:bg-black/5 dark:hover:bg-white/10 text-current",
        soft: "bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-current",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600",
        link: "underline-offset-4 hover:underline text-current",
      },
      size: {
        default: "h-11 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-xl px-3.5 text-sm has-[>svg]:px-3",
        lg: "h-14 rounded-2xl px-8 text-base has-[>svg]:px-6",
        xl: "h-16 rounded-[1.25rem] px-10 text-lg has-[>svg]:px-8",
        icon: "size-11 rounded-full",
        "icon-sm": "size-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
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
