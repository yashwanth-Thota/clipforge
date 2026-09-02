import { DEFAULT_TOPICS, UNCATEGORIZED, type TopicDef } from "./taxonomy";

export type CategorizeInput = {
  title: string;
  description?: string | null;
};

export type CategorizeResult = {
  topic: string;
  confidence: number; // 0..1
  scores: Record<string, number>;
  alternatives: { topic: string; score: number }[];
};

const STRONG_WEIGHT = 3;
const WEAK_WEIGHT = 1;
// Title matches count more than description matches.
const TITLE_MULTIPLIER = 1.5;
const MIN_CONFIDENCE = 0.18;

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  // Word-ish boundary so "ai" doesn't match "brain"; lookahead so adjacent
  // repeats ("ai ai") each count instead of sharing the separator.
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?:^|[^a-z0-9])${escaped}(?=[^a-z0-9]|$)`, "gi");
  const matches = haystack.match(re);
  return matches ? matches.length : 0;
}

function scoreTopic(topic: TopicDef, title: string, description: string): number {
  let score = 0;
  for (const kw of topic.strong) {
    score += countOccurrences(title, kw) * STRONG_WEIGHT * TITLE_MULTIPLIER;
    score += countOccurrences(description, kw) * STRONG_WEIGHT;
  }
  for (const kw of topic.weak) {
    score += countOccurrences(title, kw) * WEAK_WEIGHT * TITLE_MULTIPLIER;
    score += countOccurrences(description, kw) * WEAK_WEIGHT;
  }
  return score;
}

/**
 * Deterministic keyword categorizer — the zero-cost default. Given a title and
 * (optionally) a description, returns the best-matching topic with a normalized
 * confidence and ranked alternatives.
 */
export function categorize(
  input: CategorizeInput,
  taxonomy: TopicDef[] = DEFAULT_TOPICS,
): CategorizeResult {
  const title = (input.title ?? "").toLowerCase();
  const description = (input.description ?? "").toLowerCase();

  const scores: Record<string, number> = {};
  for (const topic of taxonomy) {
    scores[topic.name] = scoreTopic(topic, title, description);
  }

  const ranked = Object.entries(scores)
    .map(([topic, score]) => ({ topic, score }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const total = ranked.reduce((sum, r) => sum + r.score, 0);

  if (!top || top.score === 0 || total === 0) {
    return { topic: UNCATEGORIZED, confidence: 0, scores, alternatives: [] };
  }

  // Confidence blends "how dominant is the winner" with "did it clear the floor".
  const dominance = top.score / total;
  const confidence = Math.min(1, dominance);

  if (confidence < MIN_CONFIDENCE) {
    return { topic: UNCATEGORIZED, confidence, scores, alternatives: ranked.slice(0, 3) };
  }

  return {
    topic: top.topic,
    confidence,
    scores,
    alternatives: ranked.slice(1, 4).filter((r) => r.score > 0),
  };
}
