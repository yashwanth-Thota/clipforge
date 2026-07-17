import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { translateCaption } from "@/lib/captions/service";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({ targetLang: z.string().min(2).max(10) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "targetLang is required (e.g. 'es')." }, { status: 400 });
  }
  try {
    const caption = await translateCaption(params.id, parsed.data.targetLang);
    return NextResponse.json({ caption });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Translation failed" },
      { status: 400 },
    );
  }
}
