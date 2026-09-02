import type { Config } from "drizzle-kit";

const url = process.env.DATABASE_URL ?? "file:./local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

// drizzle-kit's "turso" dialect silently fails to open local `file:` URLs in
// 0.23.x (and its types don't even include the mode), so use the plain sqlite
// dialect for local files and reserve "turso" for remote libSQL instances.
const isLocalFile = url.startsWith("file:");
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: (isLocalFile ? "sqlite" : "turso") as unknown as Config["dialect"],
  dbCredentials: isLocalFile
    ? { url }
    : { url, ...(authToken ? { authToken } : {}) },
} satisfies Config;
