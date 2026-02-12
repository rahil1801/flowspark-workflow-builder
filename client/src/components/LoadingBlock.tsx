import { cn } from "@/lib/utils";

export default function LoadingBlock({
  lines = 6,
  "data-testid": dataTestId,
}: {
  lines?: number;
  "data-testid"?: string;
}) {
  return (
    <div
      className="rounded-2xl border bg-card/70 backdrop-blur shadow-[var(--shadow-soft)]"
      data-testid={dataTestId}
    >
      <div className="p-6 sm:p-8 space-y-3">
        <div className="h-5 w-44 rounded-lg skeleton-shimmer" />
        <div className="h-4 w-72 rounded-lg skeleton-shimmer" />
        <div className="pt-3 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-4 rounded-lg skeleton-shimmer",
                i % 3 === 0 ? "w-11/12" : i % 3 === 1 ? "w-10/12" : "w-9/12",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
