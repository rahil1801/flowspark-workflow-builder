import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type WorkflowCreateInput } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useWorkflows() {
  return useQuery({
    queryKey: [api.workflows.list.path],
    queryFn: async () => {
      const res = await fetch(api.workflows.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch workflows");
      const json = await res.json();
      const parsed = parseWithLogging(api.workflows.list.responses[200], json, "workflows.list");
      return parsed.map((w) => ({ ...w, createdAt: new Date(w.createdAt as any) }));
    },
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: WorkflowCreateInput) => {
      const validated = api.workflows.create.input.parse(input);
      const res = await fetch(api.workflows.create.path, {
        method: api.workflows.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.workflows.create.responses[400], await res.json(), "workflows.create 400");
          throw new Error(err.message);
        }
        throw new Error("Failed to create workflow");
      }

      const json = await res.json();
      const parsed = parseWithLogging(api.workflows.create.responses[201], json, "workflows.create 201");
      return { ...parsed, createdAt: new Date(parsed.createdAt as any) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.workflows.list.path] });
    },
  });
}
