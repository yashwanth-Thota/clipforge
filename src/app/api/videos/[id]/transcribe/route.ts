import { NextResponse } from "next/server";
import { transcribeVideo } from "@/lib/captions/service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const caption = await transcribeVideo(params.id);
    return NextResponse.json({ caption });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Transcription failed" },
      { status: 400 },
    );
  }
}
