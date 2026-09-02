import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchChannelUploads, fetchVideo, parseYouTubeUrl } from "./youtube";

afterEach(() => vi.unstubAllGlobals());

describe("parseYouTubeUrl", () => {
  it("parses watch URLs with and without extra query params", () => {
    expect(parseYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      kind: "video",
      id: "dQw4w9WgXcQ",
    });
    expect(parseYouTubeUrl("https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s&list=PLabc")).toEqual({
      kind: "video",
      id: "dQw4w9WgXcQ",
    });
    expect(parseYouTubeUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      kind: "video",
      id: "dQw4w9WgXcQ",
    });
  });

  it("parses youtu.be short links and trims surrounding whitespace", () => {
    expect(parseYouTubeUrl("  https://youtu.be/dQw4w9WgXcQ  ")).toEqual({
      kind: "video",
      id: "dQw4w9WgXcQ",
    });
  });

  it("treats a youtu.be URL with no id as unknown", () => {
    expect(parseYouTubeUrl("https://youtu.be/")).toEqual({
      kind: "unknown",
      raw: "https://youtu.be/",
    });
  });

  it("parses shorts and channel URLs", () => {
    expect(parseYouTubeUrl("https://youtube.com/shorts/dQw4w9WgXcQ")).toEqual({
      kind: "video",
      id: "dQw4w9WgXcQ",
    });
    expect(parseYouTubeUrl("https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw")).toEqual({
      kind: "channelId",
      id: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
    });
  });

  it("parses @handles in URLs and as bare input", () => {
    expect(parseYouTubeUrl("https://www.youtube.com/@jacksfilms")).toEqual({
      kind: "handle",
      handle: "@jacksfilms",
    });
    expect(parseYouTubeUrl("@standupmaths")).toEqual({ kind: "handle", handle: "@standupmaths" });
  });

  it("parses a bare 11-char video id but rejects other lengths", () => {
    expect(parseYouTubeUrl("dQw4w9WgXcQ")).toEqual({ kind: "video", id: "dQw4w9WgXcQ" });
    expect(parseYouTubeUrl("dQw4w9WgXc")).toEqual({ kind: "unknown", raw: "dQw4w9WgXc" });
  });

  it("rejects lookalike ids that are not URL-safe", () => {
    expect(parseYouTubeUrl("abcdefghijk!")).toEqual({ kind: "unknown", raw: "abcdefghijk!" });
  });

  it("rejects non-YouTube URLs and garbage input", () => {
    const raw = "https://example.com/watch?v=dQw4w9WgXcQ";
    expect(parseYouTubeUrl(raw)).toEqual({ kind: "unknown", raw });
    const junk = "definitely not a url";
    expect(parseYouTubeUrl(junk)).toEqual({ kind: "unknown", raw: junk });
  });

  it("does not mistake playlist URLs for videos", () => {
    expect(parseYouTubeUrl("https://youtube.com/playlist?list=PL9tY0BWXOZFuFEG5TZ")).toEqual({
      kind: "unknown",
      raw: "https://youtube.com/playlist?list=PL9tY0BWXOZFuFEG5TZ",
    });
  });
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("fetchVideo", () => {
  it("maps oEmbed title and author into an imported video", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(200, { title: "A Great Video", author_name: "Some Creator" }),
      ),
    );

    const v = await fetchVideo("dQw4w9WgXcQ");
    expect(v).toEqual({
      youtubeId: "dQw4w9WgXcQ",
      title: "A Great Video",
      description: "By Some Creator",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
  });

  it("handles a missing author_name", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(200, { title: "No Author" })));
    expect((await fetchVideo("dQw4w9WgXcQ")).description).toBe("");
  });

  it("rejects on a non-OK oEmbed response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(404, { error: "nope" })));
    await expect(fetchVideo("dQw4w9WgXcQ")).rejects.toThrow(/oEmbed/);
  });
});

const SINGLE_ENTRY_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/">
  <entry>
    <yt:videoId>abc123def45</yt:videoId>
    <yt:channelId>UC123</yt:channelId>
    <title>Fallback entry title</title>
    <published>2024-05-01T10:00:00+00:00</published>
    <media:group>
      <media:title>Real media title</media:title>
      <media:description>The media description.</media:description>
      <media:thumbnail url="https://i.ytimg.com/vi/abc123def45/mqdefault.jpg"/>
    </media:group>
  </entry>
</feed>`;

const BARE_ENTRY_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
  <entry>
    <yt:videoId>zzz111yyy22</yt:videoId>
    <title>Entry title only</title>
  </entry>
</feed>`;

describe("fetchChannelUploads", () => {
  it("parses a single-entry feed (non-array) and prefers media: fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(SINGLE_ENTRY_RSS, { status: 200 })),
    );

    const [v] = await fetchChannelUploads("UC123");
    expect(v).toEqual({
      youtubeId: "abc123def45",
      title: "Real media title",
      description: "The media description.",
      thumbnailUrl: "https://i.ytimg.com/vi/abc123def45/mqdefault.jpg",
      sourceUrl: "https://www.youtube.com/watch?v=abc123def45",
      publishedAt: "2024-05-01T10:00:00+00:00",
    });
  });

  it("falls back to entry fields and the default thumbnail when media: is absent", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(BARE_ENTRY_RSS, { status: 200 })));

    const [v] = await fetchChannelUploads("UC123");
    expect(v.title).toBe("Entry title only");
    expect(v.description).toBe("");
    expect(v.thumbnailUrl).toBe("https://i.ytimg.com/vi/zzz111yyy22/hqdefault.jpg");
    expect(v.publishedAt).toBeUndefined();
  });

  it("returns [] for a feed with no entries", async () => {
    const empty = `<?xml version="1.0" encoding="UTF-8"?><feed/>`;
    vi.stubGlobal("fetch", vi.fn(async () => new Response(empty, { status: 200 })));
    await expect(fetchChannelUploads("UC123")).resolves.toEqual([]);
  });

  it("rejects on a non-OK feed response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(500, {})));
    await expect(fetchChannelUploads("UC123")).rejects.toThrow(/feed/);
  });
});
