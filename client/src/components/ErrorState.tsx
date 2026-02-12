import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  "data-testid": dataTestId,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  "data-testid"?: string;
}) {
  return (
    <div
      className="rounded-2xl border bg-card/70 backdrop-blur shadow-[var(--shadow-soft)]"
      data-testid={dataTestId}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid place-items-center h-12 w-12 rounded-2xl border bg-background">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground break-words">
              {message || "Please try again."}
            </p>
            {onRetry ? (
              <div className="mt-4">
                <Button
                  variant="secondary"
                  className="rounded-xl"
                  onClick={onRetry}
                  data-testid="error-retry"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
