import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";
import { publicAiConfig } from "@/lib/ai/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Returns the effective (env-derived) config plus any DB overrides. */
export async function GET() {
  const overrides = await db.select().from(settings);
  const overrideMap = Object.fromEntries(overrides.map((s) => [s.key, s.value]));
  return NextResponse.json({ config: publicAiConfig(), overrides: overrideMap });
}

/** Persist a settings override (e.g. chosen provider) for later phases to consume. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { key?: string; value?: unknown } | null;
  if (!body?.key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }
  await db
    .insert(settings)
    .values({ key: body.key, value: body.value ?? null })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: body.value ?? null, updatedAt: new Date().toISOString() },
    });
  return NextResponse.json({ ok: true });
}
