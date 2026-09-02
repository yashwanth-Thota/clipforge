import { afterEach, describe, expect, it, vi } from "vitest";
import { KeywordCategorizationProvider, LlmCategorizationProvider } from "./categorization";

afterEach(() => vi.unstubAllGlobals());

describe("KeywordCategorizationProvider", () => {
  it("returns the keyword engine's topic, confidence and alternatives", async () => {
    const r = await new KeywordCategorizationProvider().categorize({
      title: "Rust API tutorial",
      description: "",
    });
    expect(r.topic).toBe("Technology");
    expect(r.confidence).toBeGreaterThan(0);
    expect(Array.isArray(r.alternatives)).toBe(true);
  });
});

function chatResponse(content: string): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
}

describe("LlmCategorizationProvider", () => {
  it("calls the OpenAI-compatible endpoint with the configured model and no auth header when keyless", async () => {
    const fetchMock = vi.fn(async () => chatResponse("Music"));
    vi.stubGlobal("fetch", fetchMock);

    const r = await new LlmCategorizationProvider().categorize({
      title: "Track name",
      description: "lyrics",
    });

    expect(r).toEqual({ topic: "Music", confidence: 0.75, alternatives: [] });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/chat\/completions$/);
    const headers = new Headers(init.headers);
    expect(headers.has("Authorization")).toBe(false);
    expect(JSON.parse(String(init.body))).toMatchObject({
      model: "llama3.1:8b",
      temperature: 0,
      messages: [
        { role: "system" },
        { role: "user", content: expect.stringContaining("Track name") },
      ],
    });
  });

  it("falls back to the keyword categorizer when the endpoint throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("network down"))));
    const r = await new LlmCategorizationProvider().categorize({
      title: "Rust API tutorial",
      description: "",
    });
    expect(r.topic).toBe("Technology");
    expect(r.confidence).toBeGreaterThan(0);
  });

  it("falls back when the endpoint returns a non-OK status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));
    const r = await new LlmCategorizationProvider().categorize({ title: "Rust", description: "" });
    expect(r.topic).toBe("Technology");
  });

  it("falls back when the model returns an empty topic", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => chatResponse("  ")));
    const r = await new LlmCategorizationProvider().categorize({ title: "Rust", description: "" });
    expect(r.topic).toBe("Technology");
  });
});
