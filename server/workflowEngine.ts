import OpenAI from "openai";
import type { WorkflowStepType } from "@shared/schema";

const MODEL = "meta-llama/llama-3.1-8b-instruct";

function normalizeText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPrompt(stepType: Exclude<WorkflowStepType, "clean_text">, input: string) {
  switch (stepType) {
    case "summarize":
      return `Summarize the following text clearly and concisely:\n\n${input}`;
    case "extract_key_points":
      return `Extract the key bullet points from the following text:\n\n${input}`;
    case "tag_category":
      return `Assign a category label to this text from: Business, Tech, Health, Education, Other.\n\nText:\n${input}`;
  }
}

export async function callLlm(prompt: string): Promise<string> {
  const client = new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,
    apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const resp = await client.chat.completions.create(
      {
        model: MODEL,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
      },
      { signal: controller.signal },
    );

    return (resp.choices[0]?.message?.content || "").trim();
  } catch (err: any) {
    const message = err?.message ? String(err.message) : "LLM request failed";
    throw new Error(message);
  } finally {
    clearTimeout(timeout);
  }
}

export async function runWorkflow(steps: { type: WorkflowStepType }[], inputText: string) {
  let currentText = inputText;
  const stepOutputs: { stepType: WorkflowStepType; output: string }[] = [];

  for (const step of steps) {
    if (step.type === "clean_text") {
      const out = normalizeText(currentText);
      stepOutputs.push({ stepType: step.type, output: out });
      currentText = out;
      continue;
    }

    const prompt = getPrompt(step.type, currentText);
    const out = await callLlm(prompt);
    stepOutputs.push({ stepType: step.type, output: out });
    currentText = out;
  }

  return { stepOutputs, finalOutput: currentText };
}
