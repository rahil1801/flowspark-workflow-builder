import OpenAI from "openai";
import pRetry from "p-retry";
import type { WorkflowStepType } from "../shared/schema.js";

const MODEL = "stepfun/step-3.5-flash:free";

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
    case "sentiment_analysis":
      return `Classify the sentiment (positive, neutral, negative) and explain briefly:\n\n${input}`;
    case "rewrite_professional_tone":
      return `Rewrite the following in a professional, polished tone while preserving meaning:\n\n${input}`;
    case "extract_hashtags":
      return `Extract relevant hashtags for the text. Return comma-separated hashtags only:\n\n${input}`;
    case "translate":
      return `Translate the following text to Spanish. Keep formatting where possible:\n\n${input}`;
    case "extract_entities":
      return `Extract named entities (people, organizations, locations, dates) as concise bullet points:\n\n${input}`;
    case "extract_skills":
      return `Extract skills from the following text. Return a concise bullet list:\n\n${input}`;
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
  const stepOutputs: {
    stepType: WorkflowStepType;
    output: string;
    error?: string;
    durationMs: number;
    attempts: number;
  }[] = [];

  for (const step of steps) {
    const start = Date.now();

    if (step.type === "clean_text") {
      const out = normalizeText(currentText);
      stepOutputs.push({ stepType: step.type, output: out, durationMs: Date.now() - start, attempts: 1 });
      currentText = out;
      continue;
    }

    const prompt = getPrompt(step.type, currentText);
    let attempts = 0;

    try {
      const out = await pRetry(
        async () => {
          attempts += 1;
          return callLlm(prompt);
        },
        { retries: 2, minTimeout: 500, factor: 2 },
      );
      stepOutputs.push({ stepType: step.type, output: out, durationMs: Date.now() - start, attempts });
      currentText = out;
    } catch (err: any) {
      const errorMessage = err?.message || "Step failed";
      stepOutputs.push({
        stepType: step.type,
        output: currentText,
        error: errorMessage,
        durationMs: Date.now() - start,
        attempts,
      });
      break;
    }
  }

  return { stepOutputs, finalOutput: currentText };
}
