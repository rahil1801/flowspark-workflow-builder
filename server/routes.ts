import type { Express } from "express";
import type { Server } from "http";
import { z } from "zod";
import { api } from "@shared/routes.js";
import { storage } from "./storage.js";
import { runWorkflow, callLlm } from "./workflowEngine.js";
import { pingDatabase } from "./db.js";

async function seedDatabase() {
  const existing = await storage.listWorkflows();
  if (existing.length > 0) return;

  await storage.createWorkflow({
    name: "Blog Post Analyzer",
    steps: [{ type: "clean_text" }, { type: "summarize" }, { type: "extract_hashtags" }],
  });

  await storage.createWorkflow({
    name: "Resume Optimizer",
    steps: [
      { type: "clean_text" },
      { type: "rewrite_professional_tone" },
      { type: "extract_skills" },
    ],
  });

  await storage.createWorkflow({
    name: "News Analyzer",
    steps: [{ type: "summarize" }, { type: "extract_entities" }, { type: "sentiment_analysis" }],
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.get(api.workflows.list.path, async (_req, res) => {
    const workflows = await storage.listWorkflows();
    res.json(workflows);
  });

  app.post(api.workflows.create.path, async (req, res) => {
    try {
      const input = api.workflows.create.input.parse(req.body);
      const created = await storage.createWorkflow(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      throw err;
    }
  });

  app.post(api.run.create.path, async (req, res) => {
    try {
      const input = api.run.create.input.parse(req.body);
      const wf = await storage.getWorkflow(input.workflowId);
      if (!wf) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      const { stepOutputs, finalOutput } = await runWorkflow(
        wf.steps as any,
        input.inputText,
      );

      const run = await storage.createRun({
        workflowId: wf.id,
        inputText: input.inputText,
        stepOutputs: stepOutputs as any,
        finalOutput,
      });

      res.status(201).json(run);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join("."),
        });
      }
      return res.status(500).json({ message: err?.message ?? "Internal error" });
    }
  });

  app.get(api.history.list.path, async (_req, res) => {
    const runs = await storage.getRecentRuns(5);
    res.json(runs);
  });

  app.get(api.health.get.path, async (_req, res) => {
    let database: "connected" | "error" = "connected";
    let llm: "connected" | "error" = "connected";

    try {
      await pingDatabase();
    } catch {
      database = "error";
    }

    try {
      const out = await callLlm("Respond with the word OK only.");
      if (!out.toUpperCase().includes("OK")) {
        llm = "error";
      }
    } catch {
      llm = "error";
    }

    res.json({ backend: "healthy", database, llm });
  });

  await seedDatabase();

  return httpServer;
}
