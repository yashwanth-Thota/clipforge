import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:./local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

// Reuse the client across hot reloads in dev.
const globalForDb = globalThis as unknown as {
  __clipforgeClient?: ReturnType<typeof createClient>;
};

const client =
  globalForDb.__clipforgeClient ??
  createClient({ url, ...(authToken ? { authToken } : {}) });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__clipforgeClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
