import {
  type CreateWorkflowRequest,
  type WorkflowResponse,
  type WorkflowsListResponse,
  type RunWorkflowResponse,
  type RunsHistoryResponse,
  type Workflow,
  type Run,
} from "@shared/schema";
import { mongoAction } from "./db";

export interface IStorage {
  listWorkflows(): Promise<WorkflowsListResponse>;
  createWorkflow(input: CreateWorkflowRequest): Promise<WorkflowResponse>;
  getWorkflow(id: number): Promise<WorkflowResponse | undefined>;
  createRun(input: {
    workflowId: number;
    inputText: string;
    stepOutputs: {
      stepType: string;
      output: string;
      error?: string;
      durationMs: number;
      attempts: number;
    }[];
    finalOutput: string;
  }): Promise<RunWorkflowResponse>;
  getRecentRuns(limit: number): Promise<RunsHistoryResponse>;
}

async function nextId(key: string): Promise<number> {
  const result = await mongoAction<{ document: { _id: string; seq: number } }>("findOneAndUpdate", {
    collection: "counters",
    filter: { _id: key },
    update: { $inc: { seq: 1 }, $setOnInsert: { _id: key } },
    upsert: true,
    returnDocument: "after",
  });
  return result.document?.seq ?? 1;
}

function stripMongoMeta<T extends { _id?: unknown }>(doc: T): Omit<T, "_id"> {
  const { _id, ...rest } = doc;
  return rest;
}

export class DatabaseStorage implements IStorage {
  async listWorkflows(): Promise<WorkflowsListResponse> {
    const result = await mongoAction<{ documents: (Workflow & { _id?: unknown })[] }>("find", {
      collection: "workflows",
      filter: {},
      sort: { createdAt: -1 },
    });
    return result.documents.map((w) => ({ ...stripMongoMeta(w), createdAt: new Date(w.createdAt) }));
  }

  async createWorkflow(input: CreateWorkflowRequest): Promise<WorkflowResponse> {
    const created: Workflow = {
      id: await nextId("workflows"),
      name: input.name,
      steps: input.steps,
      createdAt: new Date(),
    };
    await mongoAction("insertOne", { collection: "workflows", document: created });
    return created;
  }

  async getWorkflow(id: number): Promise<WorkflowResponse | undefined> {
    const result = await mongoAction<{ document?: (Workflow & { _id?: unknown }) | null }>("findOne", {
      collection: "workflows",
      filter: { id },
    });
    if (!result.document) return undefined;
    const wf = stripMongoMeta(result.document);
    return { ...wf, createdAt: new Date(wf.createdAt) };
  }

  async createRun(input: {
    workflowId: number;
    inputText: string;
    stepOutputs: {
      stepType: string;
      output: string;
      error?: string;
      durationMs: number;
      attempts: number;
    }[];
    finalOutput: string;
  }): Promise<RunWorkflowResponse> {
    const created: Run = {
      id: await nextId("runs"),
      workflowId: input.workflowId,
      inputText: input.inputText,
      stepOutputs: input.stepOutputs as Run["stepOutputs"],
      finalOutput: input.finalOutput,
      createdAt: new Date(),
    };
    await mongoAction("insertOne", { collection: "runs", document: created });
    return created;
  }

  async getRecentRuns(limit: number): Promise<RunsHistoryResponse> {
    const runsResult = await mongoAction<{ documents: (Run & { _id?: unknown })[] }>("find", {
      collection: "runs",
      filter: {},
      sort: { createdAt: -1 },
      limit,
    });

    const runs = runsResult.documents.map((r) => ({ ...stripMongoMeta(r), createdAt: new Date(r.createdAt) }));
    const workflowIds = Array.from(new Set(runs.map((r) => r.workflowId)));

    const wfResult = await mongoAction<{ documents: (Workflow & { _id?: unknown })[] }>("find", {
      collection: "workflows",
      filter: { id: { $in: workflowIds } },
    });
    const wfMap = new Map(wfResult.documents.map((w) => [w.id, w.name]));

    return runs.map((r) => ({
      ...r,
      workflowName: wfMap.get(r.workflowId) || "Unknown workflow",
    }));
  }
}

export const storage = new DatabaseStorage();
