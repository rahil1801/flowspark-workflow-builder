import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  "data-testid": dataTestId,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  "data-testid"?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card/70 backdrop-blur",
        "shadow-[var(--shadow-soft)]",
      )}
      data-testid={dataTestId}
    >
      <div className="p-6 sm:p-8 flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 blur-2xl opacity-50 bg-gradient-to-br from-primary/20 via-accent/10 to-chart-3/15 rounded-full" />
          <div className="grid place-items-center h-14 w-14 rounded-2xl border bg-background shadow-sm">
            {icon}
          </div>
        </div>
        <h3 className="mt-5 text-xl">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}
