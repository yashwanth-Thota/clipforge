import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { CaptionsPanel } from "@/components/captions-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiConfig } from "@/lib/ai/config";
import { listCaptions } from "@/lib/captions/service";
import { db } from "@/lib/db/client";
import { videos } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function VideoPage({ params }: { params: { id: string } }) {
  const [video] = await db.select().from(videos).where(eq(videos.id, params.id)).limit(1);

  if (!video) {
    return (
      <div className="space-y-4">
        <Link href="/catalog" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>
        <p className="text-sm">Video not found.</p>
      </div>
    );
  }

  const captionRows = await listCaptions(video.id);
  const canTranscribe = video.source === "upload" && Boolean(video.storageKey);
  const mediaUrl =
    canTranscribe && video.storageKey
      ? `/api/media/${encodeURIComponent(video.storageKey)}`
      : null;

  return (
    <div className="space-y-6">
      <Link href="/catalog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to catalog
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border bg-black">
            {mediaUrl ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={mediaUrl} controls className="aspect-video w-full" />
            ) : video.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.thumbnailUrl} alt={video.title} className="aspect-video w-full object-cover" />
            ) : (
              <div className="flex aspect-video items-center justify-center text-sm text-white/60">
                No preview
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-secondary text-secondary-foreground">
              {video.source === "youtube" ? "YouTube" : "Upload"}
            </Badge>
            {video.sourceUrl && (
              <a
                href={video.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Source ↗
              </a>
            )}
          </div>
          <h1 className="text-xl font-bold leading-snug">{video.title}</h1>
          {video.description && (
            <p className="text-sm text-muted-foreground">{video.description}</p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Captions & translations</CardTitle>
          </CardHeader>
          <CardContent>
            <CaptionsPanel
              videoId={video.id}
              canTranscribe={canTranscribe}
              tracks={captionRows.map((c) => ({
                id: c.id,
                lang: c.lang,
                isOriginal: c.isOriginal,
              }))}
              targetLangs={aiConfig.translation.targetLangs}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
