import AppShell from "@/components/AppShell";
import { useHistory } from "@/hooks/use-history";
import LoadingBlock from "@/components/LoadingBlock";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { History as HistoryIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

function clip(s: string, n: number) {
  const t = s.trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n - 1)}…`;
}

export default function History() {
  const history = useHistory();

  const runs = history.data ? history.data.slice(0, 5) : [];

  return (
    <AppShell
      title="History"
      subtitle="The last five runs — quick previews to keep you oriented."
      breadcrumb={[{ label: "Home", href: "/" }, { label: "History" }]}
      actions={
        <Button
          variant="secondary"
          className="rounded-xl"
          onClick={() => history.refetch()}
          data-testid="history-refresh"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", history.isFetching ? "animate-spin" : "")} />
          Refresh
        </Button>
      }
    >
      {history.isLoading ? (
        <LoadingBlock lines={10} data-testid="history-loading" />
      ) : history.error ? (
        <ErrorState
          title="Couldn’t load history"
          message={(history.error as Error).message}
          onRetry={() => history.refetch()}
          data-testid="history-error"
        />
      ) : !runs.length ? (
        <EmptyState
          icon={<HistoryIcon className="h-5 w-5 text-primary" />}
          title="No runs yet"
          description="Once you run a workflow, it will show up here."
          action={
            <Button
              className="rounded-xl"
              onClick={() => (window.location.href = "/run")}
              data-testid="history-go-run"
            >
              Go run one
            </Button>
          }
          data-testid="history-empty"
        />
      ) : (
        <div className="space-y-6" data-testid="history-list">
          {runs.map((r, idx) => (
            <Card
              key={r.id}
              className={cn(
                "rounded-2xl border bg-card/70 backdrop-blur",
                "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all duration-300",
              )}
              data-testid={`history-item-${idx}`}
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Workflow</div>
                    <div className="mt-1 text-lg font-semibold truncate" data-testid={`history-workflow-${idx}`}>
                      {r.workflowName}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground" data-testid={`history-time-${idx}`}>
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="rounded-xl"
                      onClick={() => navigator.clipboard.writeText(r.finalOutput)}
                      data-testid={`history-copy-final-${idx}`}
                    >
                      Copy final
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `Input:\n${r.inputText}\n\nFinal:\n${r.finalOutput}`,
                        )
                      }
                      data-testid={`history-copy-both-${idx}`}
                    >
                      Copy all
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border bg-background/55 p-4">
                    <div className="text-xs text-muted-foreground">Input preview</div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap" data-testid={`history-input-${idx}`}>
                      {clip(r.inputText, 220) || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-background/55 p-4">
                    <div className="text-xs text-muted-foreground">Final output preview</div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap" data-testid={`history-final-${idx}`}>
                      {clip(r.finalOutput, 240) || "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 text-xs text-muted-foreground">
                  Step outputs:{" "}
                  <span className="text-foreground/80" data-testid={`history-steps-count-${idx}`}>
                    {r.stepOutputs.length}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
