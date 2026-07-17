import { RecategorizeButton } from "@/components/recategorize-button";
import { VideoCard } from "@/components/video-card";
import { Badge } from "@/components/ui/badge";
import { listVideosGrouped } from "@/lib/videos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  let groups: Awaited<ReturnType<typeof listVideosGrouped>> = [];
  let error: string | null = null;
  try {
    groups = await listVideosGrouped();
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load catalog";
  }

  const total = groups.reduce((n, g) => n + g.videos.length, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
          <p className="text-sm text-muted-foreground">
            {total} videos across {groups.length} topics — grouped automatically from their
            descriptions.
          </p>
        </div>
        <RecategorizeButton />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          {error} — did you run <code className="font-mono">npm run db:push</code> and{" "}
          <code className="font-mono">npm run db:seed</code>?
        </div>
      )}

      {!error && total === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No videos yet. Import a YouTube URL or upload a file from the dashboard.
        </div>
      )}

      {groups.map((group) => (
        <section key={group.slug} className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: group.color }}
              aria-hidden
            />
            <h2 className="text-lg font-semibold">{group.topic}</h2>
            <Badge className="bg-secondary text-secondary-foreground">
              {group.videos.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {group.videos.map((video) => (
              <VideoCard key={video.id} video={video} color={group.color} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
