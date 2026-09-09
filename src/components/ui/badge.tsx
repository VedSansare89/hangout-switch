import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap w-fit",
  {
    variants: {
      variant: {
        default: "border-transparent bg-neutral-900 text-white",
        soft: "border-transparent bg-black/5 text-current dark:bg-white/10",
        outline: "border-current/20 bg-transparent text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
