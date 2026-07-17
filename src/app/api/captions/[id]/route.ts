import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { captions } from "@/lib/db/schema";
import { parseSegments, segmentsToSrt, segmentsToVtt } from "@/lib/captions/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const format = (req.nextUrl.searchParams.get("format") ?? "json").toLowerCase();
  const [caption] = await db.select().from(captions).where(eq(captions.id, params.id)).limit(1);
  if (!caption) {
    return NextResponse.json({ error: "Caption not found" }, { status: 404 });
  }

  const segments = parseSegments(caption.content);

  if (format === "srt" || format === "vtt") {
    const body = format === "srt" ? segmentsToSrt(segments) : segmentsToVtt(segments);
    return new NextResponse(body, {
      headers: {
        "Content-Type": format === "vtt" ? "text/vtt; charset=utf-8" : "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="captions.${caption.lang}.${format}"`,
      },
    });
  }

  return NextResponse.json({ caption: { ...caption, segments } });
}
