import type { Transcript, ViralScoringProvider, ViralWindow } from "../types";

const HOOK_WORDS = [
  "secret", "mistake", "never", "always", "why", "how", "best", "worst",
  "stop", "warning", "shocking", "insane", "crazy", "nobody", "everyone",
  "truth", "hack", "trick", "instantly", "finally", "biggest", "you need",
];

function windowScore(text: string): { score: number; reason: string } {
  const lower = text.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  const hooks = HOOK_WORDS.filter((w) => lower.includes(w));
  if (hooks.length) {
    score += Math.min(0.5, hooks.length * 0.15);
    reasons.push(`hooks: ${hooks.slice(0, 3).join(", ")}`);
  }
  const questions = (text.match(/\?/g) ?? []).length;
  if (questions) {
    score += Math.min(0.2, questions * 0.1);
    reasons.push("question");
  }
  const exclaims = (text.match(/!/g) ?? []).length;
  if (exclaims) {
    score += Math.min(0.2, exclaims * 0.1);
    reasons.push("emphasis");
  }
  const numbers = (text.match(/\b\d+\b/g) ?? []).length;
  if (numbers) {
    score += Math.min(0.15, numbers * 0.05);
    reasons.push("specifics");
  }
  return { score: Math.min(1, score), reason: reasons.join("; ") || "baseline" };
}

/**
 * Heuristic viral-moment scorer — zero-cost baseline. Slides a ~30s window over
 * the transcript and ranks segments by hook language, questions, emphasis and
 * concrete numbers. Swap in an LLM scorer later for nuance.
 */
export class HeuristicViralProvider implements ViralScoringProvider {
  readonly id = "heuristic";

  async score(transcript: Transcript, windowSec = 30): Promise<ViralWindow[]> {
    const segs = transcript.segments;
    if (!segs.length) return [];

    const windows: ViralWindow[] = [];
    let i = 0;
    while (i < segs.length) {
      const start = segs[i].start;
      const chunk: string[] = [];
      let j = i;
      while (j < segs.length && segs[j].end - start <= windowSec) {
        chunk.push(segs[j].text);
        j++;
      }
      const end = segs[Math.max(i, j - 1)].end;
      const { score, reason } = windowScore(chunk.join(" "));
      windows.push({ start, end, score, reason });
      i = j > i ? j : i + 1;
    }

    return windows.sort((a, b) => b.score - a.score).slice(0, 5);
  }
}
