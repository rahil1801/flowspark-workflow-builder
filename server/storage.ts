import { db } from "./db";
import {
  workflows,
  runs,
  type CreateWorkflowRequest,
  type WorkflowResponse,
  type WorkflowsListResponse,
  type RunWorkflowResponse,
  type RunsHistoryResponse,
} from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  listWorkflows(): Promise<WorkflowsListResponse>;
  createWorkflow(input: CreateWorkflowRequest): Promise<WorkflowResponse>;
  getWorkflow(id: number): Promise<WorkflowResponse | undefined>;

  createRun(input: {
    workflowId: number;
    inputText: string;
    stepOutputs: { stepType: string; output: string }[];
    finalOutput: string;
  }): Promise<RunWorkflowResponse>;

  getRecentRuns(limit: number): Promise<RunsHistoryResponse>;
}

export class DatabaseStorage implements IStorage {
  async listWorkflows(): Promise<WorkflowsListResponse> {
    return db.select().from(workflows).orderBy(desc(workflows.createdAt));
  }

  async createWorkflow(input: CreateWorkflowRequest): Promise<WorkflowResponse> {
    const [created] = await db.insert(workflows).values(input).returning();
    return created;
  }

  async getWorkflow(id: number): Promise<WorkflowResponse | undefined> {
    const [wf] = await db.select().from(workflows).where(eq(workflows.id, id));
    return wf;
  }

  async createRun(input: {
    workflowId: number;
    inputText: string;
    stepOutputs: { stepType: string; output: string }[];
    finalOutput: string;
  }): Promise<RunWorkflowResponse> {
    const [created] = await db
      .insert(runs)
      .values({
        workflowId: input.workflowId,
        inputText: input.inputText,
        stepOutputs: input.stepOutputs as any,
        finalOutput: input.finalOutput,
      })
      .returning();
    return created;
  }

  async getRecentRuns(limit: number): Promise<RunsHistoryResponse> {
    const rows = await db
      .select({
        id: runs.id,
        workflowId: runs.workflowId,
        inputText: runs.inputText,
        stepOutputs: runs.stepOutputs,
        finalOutput: runs.finalOutput,
        createdAt: runs.createdAt,
        workflowName: workflows.name,
      })
      .from(runs)
      .innerJoin(workflows, eq(runs.workflowId, workflows.id))
      .orderBy(desc(runs.createdAt))
      .limit(limit);

    return rows as any;
  }
}

export const storage = new DatabaseStorage();
