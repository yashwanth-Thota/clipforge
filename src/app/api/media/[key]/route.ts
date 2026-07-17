import { NextResponse } from "next/server";
import { getStorage } from "@/lib/storage/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Serves uploaded media in dev (local disk driver). In production, media is
// served directly from R2/Supabase and this route is unused.
export async function GET(_req: Request, { params }: { params: { key: string } }) {
  try {
    const key = decodeURIComponent(params.key);
    const bytes = await getStorage().read(key);
    const ext = key.split(".").pop()?.toLowerCase();
    const type =
      ext === "webm" ? "video/webm" : ext === "mov" ? "video/quicktime" : "video/mp4";
    return new NextResponse(bytes, {
      headers: { "Content-Type": type, "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
