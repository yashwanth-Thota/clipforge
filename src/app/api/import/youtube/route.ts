import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { aiConfig } from "@/lib/ai/config";
import { importFromYouTube } from "@/lib/videos";

export const runtime = "nodejs";

const bodySchema = z.object({ url: z.string().min(5) });

export async function POST(req: NextRequest) {
  if (!aiConfig.features.youtubeImport) {
    return NextResponse.json({ error: "YouTube import is disabled." }, { status: 403 });
  }
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a YouTube URL." }, { status: 400 });
  }
  try {
    const { imported, kind } = await importFromYouTube(parsed.data.url);
    return NextResponse.json({ kind, count: imported.length, videos: imported });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Import failed" },
      { status: 400 },
    );
  }
}
