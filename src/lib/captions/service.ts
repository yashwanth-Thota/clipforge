import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { captions, videos, type Caption } from "../db/schema";
import { getTranscriptionProvider, getTranslationProvider } from "../ai/registry";
import { getStorage } from "../storage/index";
import { parseSegments } from "./format";
import type { TranscriptSegment } from "../ai/types";

export async function listCaptions(videoId: string): Promise<Caption[]> {
  return db.select().from(captions).where(eq(captions.videoId, videoId));
}

/**
 * Auto-caption a video. Uses the configured transcription provider. For uploaded
 * files we hand the provider the local path; YouTube-only imports have no media
 * to transcribe until the download/worker path (Phase 3/4).
 */
export async function transcribeVideo(videoId: string): Promise<Caption> {
  const [video] = await db.select().from(videos).where(eq(videos.id, videoId)).limit(1);
  if (!video) throw new Error("Video not found.");

  if (video.source !== "upload" || !video.storageKey) {
    throw new Error(
      "Only uploaded videos can be transcribed right now. YouTube media download arrives with the Phase 3/4 worker.",
    );
  }

  const storage = getStorage();
  if (typeof storage.resolvePath !== "function") {
    throw new Error(
      "Transcription currently requires the local storage driver. In production, add an R2/Supabase fetch step (Phase 3).",
    );
  }
  const source = storage.resolvePath(video.storageKey);

  // Remove any prior original caption so re-runs stay idempotent.
  await db
    .delete(captions)
    .where(and(eq(captions.videoId, videoId), eq(captions.isOriginal, true)));

  const provider = getTranscriptionProvider();
  const transcript = await provider.transcribe({ source });

  const [row] = await db
    .insert(captions)
    .values({
      videoId,
      lang: transcript.lang,
      format: "json",
      content: JSON.stringify(transcript.segments),
      isOriginal: true,
    })
    .returning();

  await db.update(videos).set({ status: "ready" }).where(eq(videos.id, videoId));
  return row;
}

/** Translate an existing caption track into a target language. */
export async function translateCaption(captionId: string, targetLang: string): Promise<Caption> {
  const [original] = await db.select().from(captions).where(eq(captions.id, captionId)).limit(1);
  if (!original) throw new Error("Caption not found.");

  const segments: TranscriptSegment[] = parseSegments(original.content);
  if (!segments.length) throw new Error("Caption has no segments to translate.");

  const provider = getTranslationProvider();
  const translated = await provider.translate({
    segments,
    sourceLang: original.lang,
    targetLang,
  });

  // Replace an existing translation for the same language, if any.
  await db
    .delete(captions)
    .where(and(eq(captions.videoId, original.videoId!), eq(captions.lang, targetLang)));

  const [row] = await db
    .insert(captions)
    .values({
      videoId: original.videoId,
      lang: targetLang,
      format: "json",
      content: JSON.stringify(translated),
      isOriginal: false,
    })
    .returning();
  return row;
}
