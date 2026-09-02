import { beforeEach, describe, expect, it, vi } from "vitest";
import { UNCATEGORIZED } from "./catalog/taxonomy";

beforeEach(() => {
  vi.resetModules();
  process.env.DATABASE_URL = "file::memory:";
});

describe("topicForResult", () => {
  it("returns the topic name for a confident real topic", async () => {
    const { topicForResult } = await import("./videos");
    expect(topicForResult({ topic: "Technology", confidence: 0.9 })).toBe("Technology");
  });

  it("never persists the Uncategorized sentinel, even with positive confidence", async () => {
    const { topicForResult } = await import("./videos");
    expect(topicForResult({ topic: UNCATEGORIZED, confidence: 0.166 })).toBeUndefined();
  });

  it("returns undefined for zero or negative confidence", async () => {
    const { topicForResult } = await import("./videos");
    expect(topicForResult({ topic: "Technology", confidence: 0 })).toBeUndefined();
    expect(topicForResult({ topic: "Technology", confidence: -0.5 })).toBeUndefined();
  });
});
