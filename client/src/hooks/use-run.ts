import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type RunCreateInput } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useRunWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RunCreateInput) => {
      const validated = api.run.create.input.parse(input);
      const res = await fetch(api.run.create.path, {
        method: api.run.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.run.create.responses[400], await res.json(), "run.create 400");
          throw new Error(err.message);
        }
        if (res.status === 404) {
          const err = parseWithLogging(api.run.create.responses[404], await res.json(), "run.create 404");
          throw new Error(err.message);
        }
        if (res.status === 500) {
          const err = parseWithLogging(api.run.create.responses[500], await res.json(), "run.create 500");
          throw new Error(err.message);
        }
        throw new Error("Failed to run workflow");
      }

      const json = await res.json();
      const parsed = parseWithLogging(api.run.create.responses[201], json, "run.create 201");
      return { ...parsed, createdAt: new Date(parsed.createdAt as any) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.history.list.path] });
    },
  });
}
