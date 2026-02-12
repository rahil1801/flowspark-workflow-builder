import { z } from "zod";
import {
  WORKFLOW_STEP_TYPES,
  insertWorkflowSchema,
  type HealthResponse,
  type RunWorkflowRequest,
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

const stepOutputSchema = z.object({
  stepType: z.enum(WORKFLOW_STEP_TYPES),
  output: z.string(),
});

const runSchema = z.object({
  id: z.number(),
  workflowId: z.number(),
  inputText: z.string(),
  stepOutputs: z.array(stepOutputSchema),
  finalOutput: z.string(),
  createdAt: z.union([z.string(), z.date()]),
});

const workflowSchema = z.object({
  id: z.number(),
  name: z.string(),
  steps: z.array(z.object({ type: z.enum(WORKFLOW_STEP_TYPES) })),
  createdAt: z.union([z.string(), z.date()]),
});

export const api = {
  workflows: {
    list: {
      method: "GET" as const,
      path: "/api/workflows" as const,
      input: z.undefined(),
      responses: {
        200: z.array(workflowSchema),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/workflows" as const,
      input: insertWorkflowSchema,
      responses: {
        201: workflowSchema,
        400: errorSchemas.validation,
      },
    },
  },
  run: {
    create: {
      method: "POST" as const,
      path: "/api/run" as const,
      input: z.object({
        workflowId: z.coerce.number(),
        inputText: z.string().min(1, "Input text is required"),
      }) satisfies z.ZodType<RunWorkflowRequest>,
      responses: {
        201: runSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    },
  },
  history: {
    list: {
      method: "GET" as const,
      path: "/api/history" as const,
      input: z.undefined(),
      responses: {
        200: z.array(
          runSchema.extend({
            workflowName: z.string(),
          }),
        ),
      },
    },
  },
  health: {
    get: {
      method: "GET" as const,
      path: "/api/health" as const,
      input: z.undefined(),
      responses: {
        200: z.object({
          backend: z.literal("healthy"),
          database: z.union([z.literal("connected"), z.literal("error")]),
          llm: z.union([z.literal("connected"), z.literal("error")]),
        }) satisfies z.ZodType<HealthResponse>,
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>,
): string {
  let url = path;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, String(value));
    }
  }
  return url;
}

export type WorkflowListResponse = z.infer<typeof api.workflows.list.responses[200]>;
export type WorkflowCreateInput = z.infer<typeof api.workflows.create.input>;
export type WorkflowResponse = z.infer<typeof api.workflows.create.responses[201]>;

export type RunCreateInput = z.infer<typeof api.run.create.input>;
export type RunResponse = z.infer<typeof api.run.create.responses[201]>;

export type HistoryResponse = z.infer<typeof api.history.list.responses[200]>;
export type HealthStatusResponse = z.infer<typeof api.health.get.responses[200]>;
