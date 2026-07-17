import { NextResponse } from "next/server";
import { recategorizeAll } from "@/lib/videos";

export const runtime = "nodejs";

export async function POST() {
  try {
    const updated = await recategorizeAll();
    return NextResponse.json({ updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Recategorize failed" },
      { status: 500 },
    );
  }
}
