import AppShell from "@/components/AppShell";
import { useMemo, useState } from "react";
import { useWorkflows } from "@/hooks/use-workflows";
import { useRunWorkflow } from "@/hooks/use-run";
import LoadingBlock from "@/components/LoadingBlock";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { StepTypeBadge } from "@/components/StepTypeBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, FileText, PlayCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RunWorkflow() {
  const workflows = useWorkflows();
  const run = useRunWorkflow();

  const [workflowId, setWorkflowId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [showJson, setShowJson] = useState(false);

  const selected = useMemo(() => {
    const id = Number(workflowId);
    if (!id || !workflows.data) return null;
    return workflows.data.find((w) => w.id === id) ?? null;
  }, [workflowId, workflows.data]);

  async function onRun() {
    if (!workflowId) {
      toast({
        title: "Pick a workflow",
        description: "Select a workflow from the dropdown first.",
        variant: "destructive",
      });
      return;
    }
    if (!inputText.trim()) {
      toast({
        title: "Add some input text",
        description: "Paste or type something to process.",
        variant: "destructive",
      });
      return;
    }

    run.mutate(
      { workflowId: Number(workflowId), inputText },
      {
        onError: (e) => {
          toast({
            title: "Run failed",
            description: e instanceof Error ? e.message : "Unknown error",
            variant: "destructive",
          });
        },
        onSuccess: () => {
          toast({
            title: "Run complete",
            description: "Scroll to inspect each step output.",
          });
        },
      },
    );
  }

  const output = run.data;

  function copyText(value: string, successMessage: string) {
    navigator.clipboard.writeText(value);
    toast({ title: successMessage });
  }

  return (
    <AppShell
      title="Run workflow"
      subtitle="Select a workflow, provide input text, then inspect each step output with clarity."
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Run" }]}
      actions={
        <Button
          onClick={onRun}
          disabled={run.isPending}
          className={cn(
            "rounded-xl shadow-sm hover:shadow-md transition-all",
            "bg-gradient-to-b from-primary to-primary/85",
          )}
          data-testid="run-submit"
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          {run.isPending ? "Running..." : "Run"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 rounded-2xl border bg-card/70 backdrop-blur shadow-[var(--shadow-soft)]">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl">Inputs</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose workflow + paste text.
                </p>
              </div>
              <Button
                variant="secondary"
                className="rounded-xl"
                onClick={() => {
                  setWorkflowId("");
                  setInputText("");
                }}
                data-testid="run-reset"
              >
                Reset
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Workflow</label>
                {workflows.isLoading ? (
                  <div className="mt-2 h-12 rounded-xl skeleton-shimmer" />
                ) : workflows.error ? (
                  <div className="mt-2">
                    <ErrorState
                      title="Couldn’t load workflows"
                      message={(workflows.error as Error).message}
                      onRetry={() => workflows.refetch()}
                      data-testid="run-workflows-error"
                    />
                  </div>
                ) : workflows.data && workflows.data.length === 0 ? (
                  <div className="mt-2">
                    <EmptyState
                      icon={<Sparkles className="h-5 w-5 text-primary" />}
                      title="No workflows yet"
                      description="Create one first — then come back to run it."
                      action={
                        <Button
                          className="rounded-xl"
                          onClick={() => (window.location.href = "/workflows/new")}
                          data-testid="run-empty-create"
                        >
                          Create workflow <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      }
                      data-testid="run-workflows-empty"
                    />
                  </div>
                ) : (
                  <Select
                    value={workflowId}
                    onValueChange={(v) => setWorkflowId(v)}
                  >
                    <SelectTrigger
                      className={cn(
                        "mt-2 h-12 rounded-xl bg-background/60",
                        "border-2 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all",
                      )}
                      data-testid="run-workflow-select"
                    >
                      <SelectValue placeholder="Select a workflow…" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl" data-testid="run-workflow-select-content">
                      {workflows.data?.map((w) => (
                        <SelectItem
                          key={w.id}
                          value={String(w.id)}
                          data-testid={`run-workflow-option-${w.id}`}
                        >
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selected ? (
                  <div className="mt-3 rounded-2xl border bg-background/55 p-4" data-testid="run-selected-meta">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {selected.name}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Steps: {selected.steps.length}
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {selected.steps.map((s, idx) => (
                          <StepTypeBadge key={`${s.type}-${idx}`} type={s.type} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium">Input text</label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste text to process…"
                  className={cn(
                    "mt-2 min-h-[220px] rounded-xl bg-background/60",
                    "border-2 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all",
                  )}
                  data-testid="run-input-text"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span data-testid="run-input-count">
                    {inputText.trim().length} chars
                  </span>
                  <button
                    type="button"
                    className="hover:text-foreground transition-colors"
                    onClick={() => navigator.clipboard.writeText(inputText)}
                    data-testid="run-copy-input"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <Button
                onClick={onRun}
                disabled={run.isPending || !workflows.data?.length}
                className={cn(
                  "w-full h-12 rounded-xl",
                  "bg-gradient-to-b from-primary to-primary/85",
                  "shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all",
                )}
                data-testid="run-submit-bottom"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                {run.isPending ? "Running…" : "Run workflow"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-7 space-y-6">
          {run.isPending ? (
            <LoadingBlock lines={10} data-testid="run-loading" />
          ) : run.error ? (
            <ErrorState
              title="Run failed"
              message={(run.error as Error).message}
              onRetry={onRun}
              data-testid="run-error"
            />
          ) : !output ? (
            <EmptyState
              icon={<FileText className="h-5 w-5 text-primary" />}
              title="No output yet"
              description="Run a workflow to see step-by-step outputs and the final result."
              action={
                <Button
                  variant="secondary"
                  className="rounded-xl"
                  onClick={() => {
                    const el = document.querySelector("[data-testid='run-input-text']");
                    (el as HTMLElement | null)?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  data-testid="run-empty-scroll"
                >
                  Jump to inputs <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              }
              data-testid="run-empty"
            />
          ) : (
            <>
              <Card className="rounded-2xl border bg-card/70 backdrop-blur shadow-[var(--shadow-soft)]">
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl">Step outputs</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Each step is captured as a standalone output.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => copyText(
                        output.stepOutputs
                          .map((s) => `[${s.stepType}]\n${s.output}\n`)
                          .join("\n"),
                        "Copied step outputs",
                      )}
                      data-testid="run-copy-steps"
                    >
                      Copy all
                    </button>
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowJson((v) => !v)}
                      data-testid="run-json-toggle"
                    >
                      {showJson ? "View text" : "View JSON"}
                    </button>
                  </div>

                  <div className="mt-6 space-y-4" data-testid="run-step-outputs">
                    {output.stepOutputs.map((s, idx) => (
                      <div
                        key={`${s.stepType}-${idx}`}
                        className={cn(
                          "rounded-2xl border bg-background/55 p-4 sm:p-5",
                          "shadow-[0_18px_60px_-45px_rgba(10,20,40,0.35)]",
                        )}
                        data-testid={`run-step-card-${idx}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border bg-card text-xs text-muted-foreground">
                              {idx + 1}
                            </span>
                            <StepTypeBadge type={s.stepType} data-testid={`run-step-type-${idx}`} />
                          </div>
                          <button
                            type="button"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => copyText(s.output, "Step output copied")}
                            data-testid={`run-copy-step-${idx}`}
                          >
                            Copy
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-3">
                          <span>Duration: {s.durationMs}ms</span>
                          <span>Attempts: {s.attempts}</span>
                          {s.error ? <span className="text-destructive">Error: {s.error}</span> : null}
                        </div>
                        {showJson ? (
                          <pre className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">{JSON.stringify(s, null, 2)}</pre>
                        ) : (
                          <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{s.output}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border bg-card/70 backdrop-blur shadow-[var(--shadow-soft)]">
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl">Final output</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        The workflow’s final, consolidated result.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      className="rounded-xl"
                      onClick={() => copyText(output.finalOutput, "Final output copied")}
                      data-testid="run-copy-final"
                    >
                      Copy
                    </Button>
                  </div>

                  <div
                    className="mt-6 rounded-2xl border bg-background/55 p-4 sm:p-5"
                    data-testid="run-final-output"
                  >
                    {showJson ? (
                      <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
                        {JSON.stringify(output, null, 2)}
                      </pre>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                        {output.finalOutput}
                      </pre>
                    )}
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
