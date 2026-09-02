import { describe, expect, it } from "vitest";
import { groupVideosByTopic } from "./group";
import type { Topic, Video } from "../db/schema";

function topic(id: string, name: string, slug: string, color: string): Topic {
  return { id, name, slug, color, createdAt: "2024-01-01 00:00:00" };
}

function video(id: string, topicId?: string | null): Video {
  return {
    id,
    userId: null,
    channelId: null,
    source: "upload",
    sourceUrl: null,
    youtubeId: null,
    storageKey: null,
    title: `video ${id}`,
    description: null,
    thumbnailUrl: null,
    durationSec: null,
    topicId: topicId ?? null,
    topicConfidence: null,
    status: "new",
    createdAt: "2024-01-01 00:00:00",
  };
}

const tech = topic("t1", "Technology", "technology", "#6366f1");
const food = topic("t2", "Food & Cooking", "food-cooking", "#f97316");

describe("groupVideosByTopic", () => {
  it("returns [] for an empty catalog", () => {
    expect(groupVideosByTopic([], [])).toEqual([]);
  });

  it("groups by topic and sorts buckets by descending video count", () => {
    const groups = groupVideosByTopic(
      [video("a", tech.id), video("b", tech.id), video("c", food.id)],
      [tech, food],
    );
    expect(groups.map((g) => g.topic)).toEqual(["Technology", "Food & Cooking"]);
    expect(groups[0].videos.map((v) => v.id)).toEqual(["a", "b"]);
  });

  it("keeps the Uncategorized bucket last even when it has the most videos", () => {
    const groups = groupVideosByTopic(
      [video("a", tech.id), video("b"), video("c"), video("d")],
      [tech],
    );
    expect(groups).toHaveLength(2);
    expect(groups[0].topic).toBe("Technology");
    expect(groups[1]).toMatchObject({
      topic: "Uncategorized",
      slug: "uncategorized",
      color: "#94a3b8",
    });
    expect(groups[1].videos).toHaveLength(3);
  });

  it("routes videos with a dangling topicId into Uncategorized", () => {
    const groups = groupVideosByTopic([video("a", "ghost-topic")], [tech, food]);
    expect(groups).toHaveLength(1);
    expect(groups[0].topic).toBe("Uncategorized");
    expect(groups[0].videos.map((v) => v.id)).toEqual(["a"]);
  });

  it("uses topic metadata (slug, color) from the topic row", () => {
    const groups = groupVideosByTopic([video("a", food.id)], [tech, food]);
    expect(groups[0]).toMatchObject({
      topic: "Food & Cooking",
      slug: "food-cooking",
      color: "#f97316",
    });
  });
});
