import {
  type CreateWorkflowRequest,
  type WorkflowResponse,
  type WorkflowsListResponse,
  type RunWorkflowResponse,
  type RunsHistoryResponse,
  type Workflow,
  type Run,
} from "../shared/schema.js";
import { nextId, RunModel, WorkflowModel } from "./db.js";

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

function normalizeWorkflow(doc: Workflow): Workflow {
  return {
    id: doc.id,
    name: doc.name,
    steps: doc.steps,
    createdAt: new Date(doc.createdAt),
  };
}

function normalizeRun(doc: Run): Run {
  return {
    id: doc.id,
    workflowId: doc.workflowId,
    inputText: doc.inputText,
    stepOutputs: doc.stepOutputs,
    finalOutput: doc.finalOutput,
    createdAt: new Date(doc.createdAt),
  };
}

export class DatabaseStorage implements IStorage {
  async listWorkflows(): Promise<WorkflowsListResponse> {
    const documents = (await WorkflowModel.find({}).sort({ createdAt: -1 }).lean()) as Workflow[];
    return documents.map((workflow: Workflow) => normalizeWorkflow(workflow));
  }

  async createWorkflow(input: CreateWorkflowRequest): Promise<WorkflowResponse> {
    const created: Workflow = {
      id: await nextId("workflows"),
      name: input.name,
      steps: input.steps,
      createdAt: new Date(),
    };

    await WorkflowModel.create(created);
    return created;
  }

  async getWorkflow(id: number): Promise<WorkflowResponse | undefined> {
    const document = (await WorkflowModel.findOne({ id }).lean()) as Workflow | null;
    if (!document) return undefined;
    return normalizeWorkflow(document);
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

    await RunModel.create(created);
    return created;
  }

  async getRecentRuns(limit: number): Promise<RunsHistoryResponse> {
    const runsDocuments = (await RunModel.find({}).sort({ createdAt: -1 }).limit(limit).lean()) as Run[];
    const runs = runsDocuments.map((run: Run) => normalizeRun(run));

    const workflowIds = Array.from(new Set(runs.map((run: Run) => run.workflowId)));
    const workflows = (await WorkflowModel.find({ id: { $in: workflowIds } }).lean()) as Workflow[];
    const workflowNameById = new Map(workflows.map((workflow: Workflow) => [workflow.id, workflow.name]));

    return runs.map((run: Run) => ({
      ...run,
      workflowName: workflowNameById.get(run.workflowId) || "Unknown workflow",
    }));
  }
}

export const storage = new DatabaseStorage();
