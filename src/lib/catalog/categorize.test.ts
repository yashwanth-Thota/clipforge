import { describe, expect, it } from "vitest";
import { categorize } from "./categorize";
import { UNCATEGORIZED, type TopicDef } from "./taxonomy";

function topic(name: string, strong: string[], weak: string[] = []): TopicDef {
  return { name, color: "#000000", strong, weak };
}

describe("categorize", () => {
  it("returns Uncategorized with zero confidence for empty input", () => {
    const r = categorize({ title: "", description: "" });
    expect(r.topic).toBe(UNCATEGORIZED);
    expect(r.confidence).toBe(0);
    expect(r.alternatives).toEqual([]);
  });

  it("tolerates a null or missing description", () => {
    const a = categorize({ title: "HIIT workout" });
    const b = categorize({ title: "HIIT workout", description: null });
    expect(a).toEqual(b);
    expect(a.topic).toBe("Fitness");
  });

  it("matches keywords in the description when the title carries no signal", () => {
    const r = categorize({ title: "", description: "full body workout and hiit" });
    expect(r.topic).toBe("Fitness");
    expect(r.confidence).toBe(1);
  });

  it("weights title matches above description matches", () => {
    const t = [topic("T", ["x"])];
    expect(categorize({ title: "x" }, t).scores.T).toBeCloseTo(4.5);
    expect(categorize({ title: "", description: "x" }, t).scores.T).toBeCloseTo(3);
    expect(categorize({ title: "x", description: "x" }, t).scores.T).toBeCloseTo(7.5);
  });

  it("counts repeated keywords and is case-insensitive", () => {
    const r = categorize({ title: "AI ai Ai", description: "" });
    expect(r.scores.Technology).toBeCloseTo(13.5);
    expect(categorize({ title: "RUST", description: "" }).topic).toBe("Technology");
  });

  it("matches whole words only — 'ai' does not match 'brain'", () => {
    const t = [topic("Tech", ["ai"]), topic("Farm", ["farm"])];
    expect(categorize({ title: "brain teaser" }, t).topic).toBe(UNCATEGORIZED);
    expect(categorize({ title: "AI brain" }, t).topic).toBe("Tech");
    expect(categorize({ title: "farm brain" }, t).topic).toBe("Farm");
  });

  it("breaks ties toward the first topic in the taxonomy", () => {
    const t = [topic("First", ["z"]), topic("Second", ["z"])];
    const r = categorize({ title: "z" }, t);
    expect(r.topic).toBe("First");
    expect(r.confidence).toBe(0.5);
    expect(r.alternatives).toEqual([{ topic: "Second", score: 4.5 }]);
  });

  it("marks sub-threshold near-miss ties as Uncategorized with ranked alternatives", () => {
    const six = Array.from({ length: 6 }, (_, i) => topic(`T${i + 1}`, ["x"]));
    const r = categorize({ title: "x" }, six);
    expect(r.topic).toBe(UNCATEGORIZED);
    expect(r.confidence).toBeCloseTo(1 / 6);
    expect(r.alternatives.map((a) => a.topic)).toEqual(["T1", "T2", "T3"]);
    expect(r.alternatives.length).toBe(3);
  });

  it("excludes zero-score topics from alternatives", () => {
    const r = categorize({ title: "how ai works", description: "" });
    expect(r.topic).toBe("Technology");
    expect(r.alternatives).toEqual([]);
  });

  it("keeps only positive alternatives when a runner-up exists", () => {
    const r = categorize({ title: "AI pasta recipe", description: "" });
    expect(r.topic).toBe("Food & Cooking");
    expect(r.alternatives).toEqual([{ topic: "Technology", score: 4.5 }]);
  });
});
