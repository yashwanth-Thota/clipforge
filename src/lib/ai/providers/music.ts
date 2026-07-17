import type { MusicProvider, MusicQuery, MusicResult } from "../types";
import { aiConfig } from "../config";

const CURATED_CC0: MusicResult[] = [
  { title: "Sunrise Lo-fi", artist: "ClipForge Library", license: "CC0", source: "local", url: undefined },
  { title: "Neon Drive", artist: "ClipForge Library", license: "CC0", source: "local", url: undefined },
  { title: "Focus Flow", artist: "ClipForge Library", license: "CC0", source: "local", url: undefined },
  { title: "Golden Hour", artist: "ClipForge Library", license: "CC0", source: "local", url: undefined },
];

/** Zero-cost default: a small bundled CC0 library, filtered by mood. */
export class LocalMusicProvider implements MusicProvider {
  readonly id = "local";
  async suggest(query: MusicQuery): Promise<MusicResult[]> {
    if (!query.mood) return CURATED_CC0;
    const mood = query.mood.toLowerCase();
    const match = CURATED_CC0.filter((t) => t.title.toLowerCase().includes(mood));
    return match.length ? match : CURATED_CC0;
  }
}

/**
 * Jamendo — large catalog of Creative Commons music with a free API. Set
 * JAMENDO_CLIENT_ID to enable. Falls back to the curated library on any error.
 */
export class JamendoMusicProvider implements MusicProvider {
  readonly id = "jamendo";
  private fallback = new LocalMusicProvider();

  async suggest(query: MusicQuery): Promise<MusicResult[]> {
    const clientId = aiConfig.music.jamendoClientId;
    if (!clientId) return this.fallback.suggest(query);
    try {
      const params = new URLSearchParams({
        client_id: clientId,
        format: "json",
        limit: "10",
        audioformat: "mp32",
        include: "licenses",
        ...(query.mood ? { tags: query.mood } : {}),
      });
      const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?${params.toString()}`);
      if (!res.ok) throw new Error(`Jamendo ${res.status}`);
      const data = (await res.json()) as any;
      return (data.results ?? []).map((t: any) => ({
        title: t.name,
        artist: t.artist_name,
        url: t.audio,
        license: t.license_ccurl ? "CC" : "unknown",
        source: "jamendo",
      }));
    } catch {
      return this.fallback.suggest(query);
    }
  }
}
