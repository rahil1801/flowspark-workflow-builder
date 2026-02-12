import AppShell from "@/components/AppShell";
import { useHealth } from "@/hooks/use-health";
import LoadingBlock from "@/components/LoadingBlock";
import ErrorState from "@/components/ErrorState";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Activity, Database, Server, Sparkles } from "lucide-react";

function Indicator({
  label,
  status,
  icon,
  testId,
}: {
  label: string;
  status: "connected" | "error" | "healthy";
  icon: React.ReactNode;
  testId: string;
}) {
  const ok = status === "connected" || status === "healthy";
  return (
    <div
      className={cn(
        "rounded-2xl border bg-background/55 p-5",
        "shadow-[0_18px_60px_-50px_rgba(10,20,40,0.35)]",
      )}
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-1 text-lg font-semibold">
            {ok ? "Healthy" : "Error"}
          </div>
        </div>
        <div className={cn("grid place-items-center h-11 w-11 rounded-2xl border bg-card", ok ? "text-accent" : "text-destructive")}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-2.5 w-2.5 rounded-full",
            ok ? "bg-accent" : "bg-destructive",
          )}
        />
        <span className="text-sm text-muted-foreground">
          {ok ? "All good" : "Needs attention"}
        </span>
      </div>
    </div>
  );
}

export default function Status() {
  const health = useHealth();

  return (
    <AppShell
      title="Status"
      subtitle="A quick read on backend, database, and LLM connectivity."
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Status" }]}
      actions={
        <div className="text-xs text-muted-foreground" data-testid="status-refresh-note">
          Auto-refresh every 10 seconds
        </div>
      }
    >
      {health.isLoading ? (
        <LoadingBlock lines={8} data-testid="status-loading" />
      ) : health.error ? (
        <ErrorState
          title="Couldn’t fetch status"
          message={(health.error as Error).message}
          onRetry={() => health.refetch()}
          data-testid="status-error"
        />
      ) : health.data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="status-loaded">
          <Card className="lg:col-span-7 rounded-2xl border bg-card/70 backdrop-blur shadow-[var(--shadow-soft)]">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl">System checks</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                If something is red, workflows may fail to run.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Indicator
                  label="Backend"
                  status={health.data.backend}
                  icon={<Server className="h-5 w-5" />}
                  testId="status-backend"
                />
                <Indicator
                  label="Database"
                  status={health.data.database}
                  icon={<Database className="h-5 w-5" />}
                  testId="status-database"
                />
                <Indicator
                  label="LLM"
                  status={health.data.llm}
                  icon={<Sparkles className="h-5 w-5" />}
                  testId="status-llm"
                />
                <Indicator
                  label="Heartbeat"
                  status={"healthy"}
                  icon={<Activity className="h-5 w-5" />}
                  testId="status-heartbeat"
                />
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-5 rounded-2xl border bg-card/70 backdrop-blur shadow-[var(--shadow-soft)]">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl">Raw payload</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Useful for debugging backend wiring.
              </p>

              <div className="mt-6 rounded-2xl border bg-background/55 p-4" data-testid="status-raw">
                <pre className="text-xs leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(health.data, null, 2)}
                </pre>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                Tip: If LLM is error, check the OpenRouter AI Integrations env vars on the server.
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}
