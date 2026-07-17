import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`);

/** App users. Auth wiring lands in a later Phase 0 slice; seed creates a demo user. */
export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: createdAt(),
});

/** Connected YouTube channels we watch for new uploads (reference pipeline: "Connect Channel"). */
export const channels = sqliteTable("channels", {
  id: id(),
  userId: text("user_id").references(() => users.id),
  youtubeUrl: text("youtube_url").notNull(),
  channelId: text("channel_id"),
  title: text("title"),
  // idle | watching | error
  status: text("status").notNull().default("idle"),
  lastCheckedAt: text("last_checked_at"),
  createdAt: createdAt(),
});

/** Topic taxonomy used to group the catalog. */
export const topics = sqliteTable("topics", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  color: text("color").notNull().default("#6366f1"),
  createdAt: createdAt(),
});

/** Source videos — either uploaded or imported from YouTube. */
export const videos = sqliteTable("videos", {
  id: id(),
  userId: text("user_id").references(() => users.id),
  channelId: text("channel_id").references(() => channels.id),
  // upload | youtube
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  youtubeId: text("youtube_id"),
  storageKey: text("storage_key"),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  durationSec: integer("duration_sec"),
  topicId: text("topic_id").references(() => topics.id),
  topicConfidence: real("topic_confidence"),
  // new | processing | ready | error
  status: text("status").notNull().default("new"),
  createdAt: createdAt(),
});

/** Short clips cut from a source video (reference pipeline: "AI Clip"). */
export const clips = sqliteTable("clips", {
  id: id(),
  videoId: text("video_id")
    .notNull()
    .references(() => videos.id),
  title: text("title"),
  startSec: real("start_sec").notNull(),
  endSec: real("end_sec").notNull(),
  viralScore: real("viral_score"),
  storageKey: text("storage_key"),
  // draft | rendering | ready | error
  status: text("status").notNull().default("draft"),
  musicTrackId: text("music_track_id"),
  createdAt: createdAt(),
});

/** Captions per source video or clip, per language (auto-caption + translations). */
export const captions = sqliteTable("captions", {
  id: id(),
  videoId: text("video_id").references(() => videos.id),
  clipId: text("clip_id").references(() => clips.id),
  lang: text("lang").notNull(),
  // srt | vtt | json
  format: text("format").notNull().default("json"),
  content: text("content").notNull(),
  isOriginal: integer("is_original", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

/** Library of copyright-free / licensed tracks used to make shorts copyright-safe. */
export const musicTracks = sqliteTable("music_tracks", {
  id: id(),
  title: text("title").notNull(),
  artist: text("artist"),
  // local | jamendo | pixabay | generated
  source: text("source").notNull().default("local"),
  license: text("license").notNull().default("CC0"),
  url: text("url"),
  storageKey: text("storage_key"),
  durationSec: integer("duration_sec"),
  mood: text("mood"),
  createdAt: createdAt(),
});

/** Generic async job queue (transcribe/translate/clip/render/post). DB-backed = zero infra. */
export const jobs = sqliteTable("jobs", {
  id: id(),
  type: text("type").notNull(),
  // queued | running | done | failed
  status: text("status").notNull().default("queued"),
  payload: text("payload", { mode: "json" }),
  result: text("result", { mode: "json" }),
  error: text("error"),
  attempts: integer("attempts").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

/** Auto-post records per platform (reference pipeline: "Auto-Post"). */
export const posts = sqliteTable("posts", {
  id: id(),
  clipId: text("clip_id")
    .notNull()
    .references(() => clips.id),
  // youtube | tiktok | instagram
  platform: text("platform").notNull(),
  // pending | posted | failed
  status: text("status").notNull().default("pending"),
  externalId: text("external_id"),
  error: text("error"),
  postedAt: text("posted_at"),
  createdAt: createdAt(),
});

/** Singleton-ish key/value settings for self-configurable models & flags. */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type Clip = typeof clips.$inferSelect;
export type Caption = typeof captions.$inferSelect;
export type MusicTrack = typeof musicTracks.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Channel = typeof channels.$inferSelect;
