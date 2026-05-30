import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  online?: boolean;
}

export function Avatar({ className, online, children, ...props }: AvatarProps) {
  return (
    <div className={cn("relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-sm font-bold text-white", className)} {...props}>
      {children}
      {online && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-teal-500" />}
    </div>
  );
}
