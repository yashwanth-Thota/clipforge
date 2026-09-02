import { eq } from "drizzle-orm";
import { db } from "./db/client";
import { topics, videos, type Video } from "./db/schema";
import { getCategorizationProvider } from "./ai/registry";
import { groupVideosByTopic, type CatalogGroup } from "./catalog/group";
import { UNCATEGORIZED, DEFAULT_TOPICS } from "./catalog/taxonomy";
import {
  fetchChannelUploads,
  fetchVideo,
  parseYouTubeUrl,
  type ImportedVideo,
} from "./ingest/youtube";
import { getStorage } from "./storage/index";
import { slugify } from "./utils";

/** Find or create a topic row by display name, coloring from the taxonomy. */
async function ensureTopic(name: string): Promise<string> {
  const slug = slugify(name);
  const existing = await db.select().from(topics).where(eq(topics.slug, slug)).limit(1);
  if (existing[0]) return existing[0].id;
  const color = DEFAULT_TOPICS.find((t) => t.name === name)?.color ?? "#94a3b8";
  const [row] = await db.insert(topics).values({ name, slug, color }).returning();
  return row.id;
}

/** Pick a persistable topic name from a categorize result. The keyword engine can
 * return the Uncategorized sentinel with a positive confidence on sub-threshold
 * ties; persisting that would create a real "Uncategorized" topic row. */
export function topicForResult(result: {
  topic: string;
  confidence: number;
}): string | undefined {
  return result.topic !== UNCATEGORIZED && result.confidence > 0 ? result.topic : undefined;
}

async function persistImported(v: ImportedVideo, userId?: string): Promise<Video> {
  const categorizer = getCategorizationProvider();
  const result = await categorizer.categorize({ title: v.title, description: v.description });
  const name = topicForResult(result);
  const topicId = name ? await ensureTopic(name) : undefined;

  const [row] = await db
    .insert(videos)
    .values({
      userId,
      source: "youtube",
      sourceUrl: v.sourceUrl,
      youtubeId: v.youtubeId,
      title: v.title,
      description: v.description,
      thumbnailUrl: v.thumbnailUrl,
      topicId,
      topicConfidence: result.confidence,
      status: "ready",
    })
    .returning();
  return row;
}

/** Import one video or a whole channel's recent uploads from a YouTube URL. */
export async function importFromYouTube(
  url: string,
  userId?: string,
): Promise<{ imported: Video[]; kind: string }> {
  const ref = parseYouTubeUrl(url);
  if (ref.kind === "video") {
    const v = await fetchVideo(ref.id);
    return { imported: [await persistImported(v, userId)], kind: "video" };
  }
  if (ref.kind === "channelId") {
    const uploads = await fetchChannelUploads(ref.id);
    const imported: Video[] = [];
    for (const v of uploads) imported.push(await persistImported(v, userId));
    return { imported, kind: "channel" };
  }
  if (ref.kind === "handle") {
    throw new Error(
      "Handle URLs (@name) need channelId resolution — paste a channel URL that contains /channel/UC..., or a video URL. (Resolver arrives in Phase 4.)",
    );
  }
  throw new Error("Unrecognized YouTube URL. Paste a video, /channel/UC..., or youtu.be link.");
}

/** Store an uploaded video file and create its catalog row. */
export async function createUploadVideo(
  file: { name: string; type: string; bytes: Buffer },
  userId?: string,
): Promise<Video> {
  const storage = getStorage();
  const key = `${crypto.randomUUID()}-${file.name}`;
  const stored = await storage.put(key, file.bytes, file.type);

  const title = file.name.replace(/\.[^.]+$/, "");
  const categorizer = getCategorizationProvider();
  const result = await categorizer.categorize({ title, description: "" });
  const name = topicForResult(result);
  const topicId = name ? await ensureTopic(name) : undefined;

  const [row] = await db
    .insert(videos)
    .values({
      userId,
      source: "upload",
      storageKey: stored.key,
      title,
      topicId,
      topicConfidence: result.confidence,
      status: "new",
    })
    .returning();
  return row;
}

export async function listVideosGrouped(): Promise<CatalogGroup[]> {
  const [allVideos, allTopics] = await Promise.all([
    db.select().from(videos),
    db.select().from(topics),
  ]);
  const sorted = [...allVideos].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return groupVideosByTopic(sorted, allTopics);
}

/** Re-run categorization across the whole catalog (e.g. after switching providers). */
export async function recategorizeAll(): Promise<number> {
  const categorizer = getCategorizationProvider();
  const rows = await db.select().from(videos);
  let updated = 0;
  for (const v of rows) {
    const result = await categorizer.categorize({ title: v.title, description: v.description });
    const name = topicForResult(result);
    const topicId = name ? await ensureTopic(name) : null;
    await db
      .update(videos)
      .set({ topicId, topicConfidence: result.confidence })
      .where(eq(videos.id, v.id));
    updated++;
  }
  return updated;
}
