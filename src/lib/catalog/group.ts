import type { Topic, Video } from "../db/schema";
import { UNCATEGORIZED } from "./taxonomy";

export type CatalogGroup = {
  topic: string;
  slug: string;
  color: string;
  videos: Video[];
};

/**
 * Group videos by their assigned topic for the catalog view. Videos without a
 * topic fall into an "Uncategorized" bucket that always sorts last.
 */
export function groupVideosByTopic(videos: Video[], topics: Topic[]): CatalogGroup[] {
  const topicById = new Map(topics.map((t) => [t.id, t]));
  const buckets = new Map<string, CatalogGroup>();

  for (const video of videos) {
    const topic = video.topicId ? topicById.get(video.topicId) : undefined;
    const name = topic?.name ?? UNCATEGORIZED;
    const key = topic?.slug ?? "uncategorized";
    if (!buckets.has(key)) {
      buckets.set(key, {
        topic: name,
        slug: key,
        color: topic?.color ?? "#94a3b8",
        videos: [],
      });
    }
    buckets.get(key)!.videos.push(video);
  }

  return Array.from(buckets.values()).sort((a, b) => {
    if (a.slug === "uncategorized") return 1;
    if (b.slug === "uncategorized") return -1;
    return b.videos.length - a.videos.length;
  });
}
