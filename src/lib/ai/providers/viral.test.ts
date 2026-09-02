import { describe, expect, it } from "vitest";
import { HeuristicViralProvider } from "./viral";
import type { Transcript } from "../types";

const provider = new HeuristicViralProvider();

function transcript(segs: { start: number; end: number; text: string }[]): Transcript {
  return { lang: "en", text: segs.map((s) => s.text).join(" "), segments: segs };
}

describe("HeuristicViralProvider.score", () => {
  it("returns [] for an empty transcript", async () => {
    await expect(provider.score(transcript([]))).resolves.toEqual([]);
  });

  it("scores plain copy as baseline zero", async () => {
    const [w] = await provider.score(transcript([{ start: 0, end: 10, text: "the quick brown fox" }]));
    expect(w.score).toBe(0);
    expect(w.reason).toBe("baseline");
  });

  it("caps each signal category and the total at 1", async () => {
    const text =
      "secret mistake never always why best really? really? really? Wait! Wait! Wait! 1 2 3 4 5";
    const [w] = await provider.score(transcript([{ start: 0, end: 10, text }]));
    expect(w.score).toBe(1);
    expect(w.reason).toContain("hooks");
  });

  it("caps hook words at 0.5", async () => {
    const text = "secret mistake never always why best";
    const [w] = await provider.score(transcript([{ start: 0, end: 10, text }]));
    expect(w.score).toBe(0.5);
    expect(w.reason).toBe("hooks: secret, mistake, never");
  });

  it("caps question marks at 0.2", async () => {
    const text = "really? really? really? really? really?";
    const [w] = await provider.score(transcript([{ start: 0, end: 10, text }]));
    expect(w.score).toBe(0.2);
    expect(w.reason).toBe("question");
  });

  it("slides a window over the transcript and never overlaps segments", async () => {
    const segs = [
      { start: 0, end: 10, text: "a" },
      { start: 10, end: 20, text: "b" },
      { start: 20, end: 30, text: "c" },
      { start: 30, end: 40, text: "d" },
    ];
    const windows = await provider.score(transcript(segs));
    expect(windows.map((w) => [w.start, w.end])).toEqual([
      [0, 30],
      [30, 40],
    ]);
  });

  it("includes a segment whose end lands exactly on the window boundary", async () => {
    const segs = [
      { start: 0, end: 10, text: "a" },
      { start: 10, end: 20, text: "b" },
      { start: 20, end: 30, text: "c" },
    ];
    const windows = await provider.score(transcript(segs), 20);
    expect(windows.map((w) => [w.start, w.end])).toEqual([
      [0, 20],
      [20, 30],
    ]);
  });

  it("respects a custom window size", async () => {
    const segs = [
      { start: 0, end: 10, text: "a" },
      { start: 10, end: 20, text: "b" },
      { start: 20, end: 30, text: "c" },
    ];
    expect((await provider.score(transcript(segs), 30)).map((w) => [w.start, w.end])).toEqual([
      [0, 30],
    ]);
    expect((await provider.score(transcript(segs), 10)).map((w) => [w.start, w.end])).toEqual([
      [0, 10],
      [10, 20],
      [20, 30],
    ]);
  });

  it("turns a single segment longer than the window into its own window", async () => {
    const [w] = await provider.score(transcript([{ start: 0, end: 100, text: "secret" }]), 30);
    expect(w.start).toBe(0);
    expect(w.end).toBe(100);
  });

  it("returns at most five windows, best first", async () => {
    const segs = Array.from({ length: 8 }, (_, i) => ({
      start: i * 10,
      end: i * 10 + 5,
      text: "secret mistake never always why best",
    }));
    const windows = await provider.score(transcript(segs), 5);
    expect(windows).toHaveLength(5);
    for (let i = 1; i < windows.length; i++) {
      expect(windows[i - 1].score).toBeGreaterThanOrEqual(windows[i].score);
    }
  });
});
