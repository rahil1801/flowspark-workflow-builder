import AppShell from "@/components/AppShell";
import { useMemo, useState } from "react";
import { useCreateWorkflow } from "@/hooks/use-workflows";
import { WORKFLOW_STEP_TYPES, type WorkflowStepType } from "@shared/schema";
import { StepTypeBadge, StepTypeOptions } from "@/components/StepTypeBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Check, Plus, Trash2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@shared/routes";
import { z } from "zod";

const display: Record<WorkflowStepType, string> = {
  clean_text: "Clean text",
  summarize: "Summarize",
  extract_key_points: "Extract key points",
  tag_category: "Tag category",
  sentiment_analysis: "Sentiment analysis",
  rewrite_professional_tone: "Rewrite in professional tone",
  extract_hashtags: "Extract hashtags",
  translate: "Translate",
  extract_entities: "Extract entities",
  extract_skills: "Extract skills",
};

const templates: { name: string; steps: WorkflowStepType[] }[] = [
  { name: "Blog Post Analyzer", steps: ["clean_text", "summarize", "extract_hashtags"] },
  { name: "Resume Optimizer", steps: ["clean_text", "rewrite_professional_tone", "extract_skills"] },
  { name: "News Analyzer", steps: ["summarize", "extract_entities", "sentiment_analysis"] },
];

const createSchema = api.workflows.create.input;

function validateLocal(input: unknown) {
  const result = createSchema.safeParse(input);
  if (!result.success) {
    return result.error.format();
  }
  return null;
}

function StepPicker({
  selected,
  onToggle,
}: {
  selected: WorkflowStepType[];
  onToggle: (t: WorkflowStepType) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {WORKFLOW_STEP_TYPES.map((t) => {
        const on = selected.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => onToggle(t)}
            data-testid={`step-toggle-${t}`}
            className={cn(
              "group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
              "bg-background/60 hover:bg-background/85",
              on
                ? "border-primary/30 shadow-[0_12px_40px_-28px_rgba(30,64,175,0.55)]"
                : "border-border",
            )}
          >
            <div
              className={cn(
                "mt-0.5 grid h-6 w-6 place-items-center rounded-lg border transition-colors",
                on ? "bg-primary text-primary-foreground border-primary/20" : "bg-card border-border",
              )}
            >
              {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">{display[t]}</div>
                <StepTypeBadge type={t} className="hidden sm:inline-flex" />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t === "clean_text" && "Normalize spacing, punctuation, and remove noise."}
                {t === "summarize" && "Compact the input into an executive summary."}
                {t === "extract_key_points" && "Pull the key bullets for quick scanning."}
                {t === "tag_category" && "Assign a category tag for sorting later."}
                {t === "sentiment_analysis" && "Classify sentiment and provide concise rationale."}
                {t === "rewrite_professional_tone" && "Rewrite text in a polished professional style."}
                {t === "extract_hashtags" && "Generate relevant hashtags for social posting."}
                {t === "translate" && "Translate into another language while preserving intent."}
                {t === "extract_entities" && "Pull entities like people, orgs, places, dates."}
                {t === "extract_skills" && "Extract role-specific skills from the text."}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function CreateWorkflow() {
  const create = useCreateWorkflow();
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<WorkflowStepType[]>(["clean_text", "summarize"]);

  const errors = useMemo(() => validateLocal({ name, steps }), [name, steps]);

  const selectedPretty = useMemo(() => {
    const options = StepTypeOptions();
    return steps.map((s) => options.find((o) => o.value === s)?.label ?? s);
  }, [steps]);

  function toggleStep(t: WorkflowStepType) {
    setSteps((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      // Keep stable order based on WORKFLOW_STEP_TYPES for a tidy mental model
      const order = new Map(WORKFLOW_STEP_TYPES.map((s, i) => [s, i] as const));
      return next.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
    });
  }

  async function onSubmit() {
    const err = validateLocal({ name, steps });
    if (err) {
      toast({
        title: "Fix validation issues",
        description: "Name is required and you must choose 2–4 steps.",
        variant: "destructive",
      });
      return;
    }

    create.mutate(
      {
        name,
        steps: steps.map((type) => ({ type })),
      },
      {
        onSuccess: () => {
          toast({
            title: "Workflow created",
            description: "You can run it right away.",
          });
          setName("");
          setSteps(["clean_text", "summarize"]);
        },
      },
    );
  }

  const nameError =
    errors && "name" in errors && (errors as any).name?._errors?.[0]
      ? (errors as any).name._errors[0]
      : null;

  const stepsError =
    errors && "steps" in errors && (errors as any).steps?._errors?.[0]
      ? (errors as any).steps._errors[0]
      : null;

  return (
    <AppShell
      title="Create workflow"
      subtitle="Name it and pick 2–4 steps. Keep it simple; make it repeatable."
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Create workflow" }]}
      actions={
        <Button
          onClick={onSubmit}
          disabled={create.isPending}
          className={cn(
            "rounded-xl shadow-sm hover:shadow-md transition-all",
            "bg-gradient-to-b from-primary to-primary/85",
          )}
          data-testid="create-submit"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {create.isPending ? "Creating..." : "Create workflow"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 rounded-2xl border bg-card/70 backdrop-blur shadow-[var(--shadow-soft)]">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl">Definition</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Give it a clean name. The steps define the transformation pipeline.
                </p>
              </div>
              <Button
                variant="secondary"
                className="rounded-xl"
                onClick={() => {
                  setName("");
                  setSteps(["clean_text", "summarize"]);
                }}
                data-testid="create-reset"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Workflow name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Support ticket triage"
                  className={cn(
                    "mt-2 h-12 rounded-xl bg-background/60",
                    "border-2 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all",
                    nameError ? "border-destructive/50 focus:border-destructive focus:ring-destructive/10" : "",
                  )}
                  data-testid="create-name"
                />
                {nameError ? (
                  <p className="mt-2 text-xs text-destructive" data-testid="create-name-error">
                    {nameError}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Keep it short — it appears in the run dropdown and history.
                  </p>
                )}
              </div>

              <div className="pt-2">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <label className="text-sm font-medium">Steps</label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Select between 2 and 4. Click again to remove.
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground" data-testid="create-steps-count">
                    {steps.length} / 4
                  </div>
                </div>

                <div className="mt-3">
                  <StepPicker selected={steps} onToggle={toggleStep} />
                </div>

                {stepsError ? (
                  <p className="mt-3 text-xs text-destructive" data-testid="create-steps-error">
                    {stepsError}
                  </p>
                ) : null}
              </div>

              <div className="pt-2">
                <label className="text-sm font-medium">Workflow templates</label>
                <p className="mt-1 text-xs text-muted-foreground">Quick-start from curated templates.</p>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.name}
                      type="button"
                      className="rounded-2xl border bg-background/60 p-4 text-left hover:bg-background/85 transition-colors"
                      onClick={() => {
                        setName(template.name);
                        setSteps(template.steps);
                      }}
                      data-testid={`template-${template.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {template.steps.map((step) => (
                          <StepTypeBadge key={`${template.name}-${step}`} type={step} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-5 rounded-2xl border bg-card/70 backdrop-blur shadow-[var(--shadow-soft)]">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl">Preview</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This is what will be saved.
            </p>

            <div className="mt-6 rounded-2xl border bg-background/55 p-4">
              <div className="text-xs text-muted-foreground">Name</div>
              <div className="mt-1 text-base font-semibold" data-testid="preview-name">
                {name.trim() || "—"}
              </div>

              <div className="mt-4 text-xs text-muted-foreground">Steps</div>
              <div className="mt-2 flex flex-wrap gap-2" data-testid="preview-steps">
                {steps.length ? (
                  steps.map((s) => <StepTypeBadge key={s} type={s} />)
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>

              <div className="mt-5 border-t pt-4">
                <div className="text-xs text-muted-foreground">Readable summary</div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {selectedPretty.map((s, idx) => (
                    <li key={`${s}-${idx}`} className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-lg border bg-card text-xs text-muted-foreground">
                        {idx + 1}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={onSubmit}
                disabled={create.isPending}
                className={cn(
                  "w-full rounded-xl",
                  "bg-gradient-to-b from-primary to-primary/85",
                  "shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all",
                )}
                data-testid="create-submit-bottom"
              >
                {create.isPending ? "Creating..." : "Create workflow"}
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Validation: <span className={cn(errors ? "text-destructive" : "text-accent")} data-testid="create-validation">
                  {errors ? "needs attention" : "looks good"}
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
