import AppShell from "@/components/AppShell";
import { useWorkflows } from "@/hooks/use-workflows";
import LoadingBlock from "@/components/LoadingBlock";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { StepTypeBadge } from "@/components/StepTypeBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Wand2 } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function Workflows() {
  const workflows = useWorkflows();

  return (
    <AppShell
      title="Workflows"
      subtitle="Browse what you've created. (Creation happens on the Create page.)"
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Workflows" }]}
      actions={
        <Link href="/workflows/new" className="w-full sm:w-auto">
          <Button
            className="rounded-xl"
            onClick={() => {}}
            data-testid="workflows-new"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            New workflow
          </Button>
        </Link>
      }
    >
      {workflows.isLoading ? (
        <LoadingBlock lines={10} data-testid="workflows-loading" />
      ) : workflows.error ? (
        <ErrorState
          title="Couldn’t load workflows"
          message={(workflows.error as Error).message}
          onRetry={() => workflows.refetch()}
          data-testid="workflows-error"
        />
      ) : !workflows.data?.length ? (
        <EmptyState
          icon={<Wand2 className="h-5 w-5 text-primary" />}
          title="No workflows yet"
          description="Create your first workflow to start running text transformations."
          action={
            <Link href="/workflows/new" className="w-full sm:w-auto">
              <Button className="rounded-xl" onClick={() => {}} data-testid="workflows-empty-create">
                Create workflow <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          }
          data-testid="workflows-empty"
        />
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="workflows-grid"
        >
          {workflows.data.map((w) => (
            <Card
              key={w.id}
              className={cn(
                "rounded-2xl border bg-card/70 backdrop-blur",
                "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all duration-300",
              )}
              data-testid={`workflow-card-${w.id}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold truncate" data-testid={`workflow-name-${w.id}`}>
                      {w.name}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground" data-testid={`workflow-created-${w.id}`}>
                      Created {format(new Date(w.createdAt), "PP")}
                    </div>
                  </div>
                  <Link
                    href="/run"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`workflow-run-link-${w.id}`}
                  >
                    Run <ArrowRight className="inline h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-2" data-testid={`workflow-steps-${w.id}`}>
                  {w.steps.map((s, idx) => (
                    <StepTypeBadge key={`${s.type}-${idx}`} type={s.type} />
                  ))}
                </div>

                <div className="mt-5">
                  <Button
                    variant="secondary"
                    className="w-full rounded-xl"
                    onClick={() => (window.location.href = "/run")}
                    data-testid={`workflow-run-button-${w.id}`}
                  >
                    Run this workflow
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
