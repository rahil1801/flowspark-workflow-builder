import { WORKFLOW_STEP_TYPES, type WorkflowStepType } from "@shared/schema";
import { cn } from "@/lib/utils";

const labels: Record<WorkflowStepType, string> = {
  clean_text: "Clean text",
  summarize: "Summarize",
  extract_key_points: "Key points",
  tag_category: "Tag category",
};

const tones: Record<WorkflowStepType, string> = {
  clean_text: "bg-secondary text-secondary-foreground border-border",
  summarize: "bg-primary/10 text-primary border-primary/20",
  extract_key_points: "bg-accent/10 text-accent border-accent/20",
  tag_category: "bg-chart-3/10 text-foreground border-chart-3/20",
};

export function StepTypeBadge({
  type,
  className,
  "data-testid": dataTestId,
}: {
  type: WorkflowStepType;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[type],
        className,
      )}
      data-testid={dataTestId}
    >
      {labels[type]}
    </span>
  );
}

export function StepTypeOptions() {
  return WORKFLOW_STEP_TYPES.map((t) => ({ value: t, label: labels[t] }));
}
