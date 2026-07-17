import type { Config } from "drizzle-kit";

const url = process.env.DATABASE_URL ?? "file:./local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

// libSQL/Turso: `dialect: "turso"` works for both local `file:` URLs and remote
// Turso (free tier). authToken is only needed for remote instances.
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: { url, ...(authToken ? { authToken } : {}) },
} satisfies Config;
