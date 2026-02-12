import { sql } from "drizzle-orm";
import {
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/chat";

export const WORKFLOW_STEP_TYPES = [
  "clean_text",
  "summarize",
  "extract_key_points",
  "tag_category",
] as const;

export type WorkflowStepType = (typeof WORKFLOW_STEP_TYPES)[number];

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  steps: jsonb("steps")
    .$type<{ type: WorkflowStepType }[]>()
    .notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const runs = pgTable("runs", {
  id: serial("id").primaryKey(),
  workflowId: serial("workflow_id").notNull(),
  inputText: text("input_text").notNull(),
  stepOutputs: jsonb("step_outputs")
    .$type<{ stepType: WorkflowStepType; output: string }[]>()
    .notNull(),
  finalOutput: text("final_output").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const workflowStepSchema = z.object({
  type: z.enum(WORKFLOW_STEP_TYPES),
});

export const insertWorkflowSchema = createInsertSchema(workflows)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    name: z.string().min(1, "Name is required"),
    steps: z
      .array(workflowStepSchema)
      .min(2, "Minimum 2 steps")
      .max(4, "Maximum 4 steps"),
  });

export const insertRunSchema = createInsertSchema(runs)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    inputText: z.string().min(1, "Input text is required"),
    stepOutputs: z.array(
      z.object({
        stepType: z.enum(WORKFLOW_STEP_TYPES),
        output: z.string(),
      }),
    ),
  });

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type Run = typeof runs.$inferSelect;
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
