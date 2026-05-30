import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("min-h-11 w-full rounded-[10px] border border-input bg-card px-3 py-2 text-sm transition placeholder:text-muted-foreground focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/25", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-24 w-full rounded-[10px] border border-input bg-card px-3 py-2 text-sm transition placeholder:text-muted-foreground focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/25", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("min-h-11 w-full rounded-[10px] border border-input bg-card px-3 py-2 text-sm transition focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/25", className)} {...props} />;
}
