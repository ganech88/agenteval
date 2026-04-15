import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center",
        className
      )}
    >
      <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-zinc-400">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
