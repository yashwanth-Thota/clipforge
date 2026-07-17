import { NextRequest, NextResponse } from "next/server";
import { createUploadVideo } from "@/lib/videos";

export const runtime = "nodejs";

// Note: for large files, move to presigned direct-to-storage uploads (Phase 3).
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Attach a video file as 'file'." }, { status: 400 });
  }
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const video = await createUploadVideo(
      { name: file.name, type: file.type, bytes },
      undefined,
    );
    return NextResponse.json({ video });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
