import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Video } from "@/lib/db/schema";
import { formatDuration } from "@/lib/utils";

export function VideoCard({ video, color }: { video: Video; color: string }) {
  return (
    <Link href={`/video/${video.id}`} className="block">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-video bg-muted">
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No thumbnail
          </div>
        )}
        <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {video.source === "youtube" ? "YouTube" : "Upload"}
        </span>
      </div>
      <CardContent className="space-y-2 p-3">
        <div className="line-clamp-2 text-sm font-medium leading-snug">{video.title}</div>
        <div className="flex items-center justify-between">
          <Badge
            className="border-transparent text-white"
            style={{ backgroundColor: color }}
          >
            {video.topicConfidence != null
              ? `${Math.round((video.topicConfidence ?? 0) * 100)}% match`
              : "topic"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDuration(video.durationSec)}
          </span>
        </div>
      </CardContent>
      </Card>
    </Link>
  );
}
