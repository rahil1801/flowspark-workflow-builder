import { z } from "zod";

export const WORKFLOW_STEP_TYPES = [
  "clean_text",
  "summarize",
  "extract_key_points",
  "tag_category",
  "sentiment_analysis",
  "rewrite_professional_tone",
  "extract_hashtags",
  "translate",
  "extract_entities",
  "extract_skills",
] as const;

export type WorkflowStepType = (typeof WORKFLOW_STEP_TYPES)[number];

export const workflowStepSchema = z.object({
  type: z.enum(WORKFLOW_STEP_TYPES),
});

export const insertWorkflowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  steps: z.array(workflowStepSchema).min(2, "Minimum 2 steps").max(6, "Maximum 6 steps"),
});

const stepOutputSchema = z.object({
  stepType: z.enum(WORKFLOW_STEP_TYPES),
  output: z.string(),
  error: z.string().optional(),
  durationMs: z.number().nonnegative(),
  attempts: z.number().int().positive(),
});

export const insertRunSchema = z.object({
  workflowId: z.number(),
  inputText: z.string().min(1, "Input text is required"),
  stepOutputs: z.array(stepOutputSchema),
  finalOutput: z.string(),
});

export type Workflow = {
  id: number;
  name: string;
  steps: { type: WorkflowStepType }[];
  createdAt: Date;
};

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type Run = {
  id: number;
  workflowId: number;
  inputText: string;
  stepOutputs: z.infer<typeof stepOutputSchema>[];
  finalOutput: string;
  createdAt: Date;
};

export type InsertRun = z.infer<typeof insertRunSchema>;

export type CreateWorkflowRequest = InsertWorkflow;
export type WorkflowResponse = Workflow;
export type WorkflowsListResponse = Workflow[];

export type RunWorkflowRequest = {
  workflowId: number;
  inputText: string;
};

export type RunWorkflowResponse = Run;
export type RunsHistoryResponse = Array<
  Run & {
    workflowName: string;
  }
>;

export type HealthResponse = {
  backend: "healthy";
  database: "connected" | "error";
  llm: "connected" | "error";
};
