import { XMLParser } from "fast-xml-parser";

export type YouTubeRef =
  | { kind: "video"; id: string }
  | { kind: "channelId"; id: string }
  | { kind: "handle"; handle: string }
  | { kind: "unknown"; raw: string };

export type ImportedVideo = {
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  sourceUrl: string;
  publishedAt?: string;
};

/** Parse any common YouTube URL/handle into a normalized reference. */
export function parseYouTubeUrl(input: string): YouTubeRef {
  const raw = input.trim();
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return id ? { kind: "video", id } : { kind: "unknown", raw };
    }
    if (host.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return { kind: "video", id: v };
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" && parts[1]) return { kind: "video", id: parts[1] };
      if (parts[0] === "channel" && parts[1]) return { kind: "channelId", id: parts[1] };
      if (parts[0]?.startsWith("@")) return { kind: "handle", handle: parts[0] };
    }
  } catch {
    // not a URL — maybe a bare id or @handle
    if (raw.startsWith("@")) return { kind: "handle", handle: raw };
    if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return { kind: "video", id: raw };
  }
  return { kind: "unknown", raw };
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

/**
 * Fetch metadata for a single video via the free, key-less oEmbed endpoint,
 * then enrich the description from the channel RSS when available. oEmbed alone
 * omits the description, which we need for categorization.
 */
export async function fetchVideo(id: string): Promise<ImportedVideo> {
  const sourceUrl = `https://www.youtube.com/watch?v=${id}`;
  const res = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(sourceUrl)}&format=json`,
  );
  if (!res.ok) throw new Error(`Could not fetch video ${id} (oEmbed ${res.status}).`);
  const data = (await res.json()) as { title: string; author_name?: string };
  return {
    youtubeId: id,
    title: data.title,
    description: data.author_name ? `By ${data.author_name}` : "",
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    sourceUrl,
  };
}

/**
 * List recent uploads for a channel via the free RSS feed. RSS includes the
 * description (media:group > media:description), which powers categorization.
 */
export async function fetchChannelUploads(channelId: string): Promise<ImportedVideo[]> {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
  );
  if (!res.ok) throw new Error(`Could not fetch channel feed (${res.status}).`);
  const xml = await res.text();
  const parsed = parser.parse(xml);
  const entries = parsed?.feed?.entry ?? [];
  const list = Array.isArray(entries) ? entries : [entries];

  return list.map((e: any): ImportedVideo => {
    const id = e["yt:videoId"];
    const group = e["media:group"] ?? {};
    return {
      youtubeId: id,
      title: group["media:title"] ?? e.title ?? "Untitled",
      description: group["media:description"] ?? "",
      thumbnailUrl:
        group["media:thumbnail"]?.["@_url"] ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      sourceUrl: `https://www.youtube.com/watch?v=${id}`,
      publishedAt: e.published,
    };
  });
}
