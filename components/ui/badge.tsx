import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-bold uppercase tracking-wide", {
  variants: {
    variant: {
      default: "bg-teal-50 text-teal-800",
      confirmed: "bg-teal-100 text-teal-800",
      pending: "bg-amber-100 text-amber-800",
      cancelled: "bg-red-100 text-red-700",
      muted: "bg-slate-100 text-slate-600",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
