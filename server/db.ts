const baseUrl = process.env.MONGODB_DATA_API_URL;
const apiKey = process.env.MONGODB_DATA_API_KEY;

if (!baseUrl || !apiKey) {
  throw new Error("MONGODB_DATA_API_URL and MONGODB_DATA_API_KEY must be set.");
}

const mongoBaseUrl = baseUrl;
const mongoApiKey = apiKey;

export const mongoConfig = {
  dataSource: process.env.MONGODB_DATA_SOURCE || "Cluster0",
  database: process.env.MONGODB_DB_NAME || "workflow_builder",
};

export async function mongoAction<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${mongoBaseUrl.replace(/\/$/, "")}/action/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": mongoApiKey,
    },
    body: JSON.stringify({ ...mongoConfig, ...body }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`MongoDB action failed: ${message || res.statusText}`);
  }

  return (await res.json()) as T;
}

export async function pingDatabase() {
  await mongoAction("findOne", {
    collection: "workflows",
    filter: {},
  });
}
