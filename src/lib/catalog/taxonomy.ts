/**
 * Default topic taxonomy for zero-cost, dependency-free categorization.
 * Each topic carries weighted keyword signals. This is the fallback provider;
 * an embedding- or LLM-based categorizer can be swapped in via CATEGORIZATION_PROVIDER.
 */
export type TopicDef = {
  name: string;
  color: string;
  /** Strong signals (weight 3). */
  strong: string[];
  /** Supporting signals (weight 1). */
  weak: string[];
};

export const DEFAULT_TOPICS: TopicDef[] = [
  {
    name: "Technology",
    color: "#6366f1",
    strong: ["api", "javascript", "typescript", "python", "rust", "code", "programming", "developer", "software", "database", "docker", "kubernetes", "ai", "machine learning", "llm"],
    weak: ["build", "framework", "server", "deploy", "app", "backend", "frontend", "cloud", "open source"],
  },
  {
    name: "Gaming",
    color: "#a855f7",
    strong: ["gameplay", "boss", "speedrun", "fps", "rpg", "minecraft", "fortnite", "elden ring", "playthrough", "loadout", "esports"],
    weak: ["level", "guide", "build", "character", "quest", "stream", "controller", "co-op"],
  },
  {
    name: "Fitness",
    color: "#22c55e",
    strong: ["workout", "hiit", "gym", "exercise", "cardio", "strength", "yoga", "calisthenics", "fat loss", "muscle"],
    weak: ["reps", "sets", "training", "core", "mobility", "stretch", "home workout", "conditioning"],
  },
  {
    name: "Food & Cooking",
    color: "#f97316",
    strong: ["recipe", "cooking", "bake", "baking", "dinner", "breakfast", "meal", "kitchen", "chef", "salmon", "pasta"],
    weak: ["ingredients", "sauce", "roasted", "crispy", "flavor", "weeknight", "one-pan", "dish"],
  },
  {
    name: "Business & Finance",
    color: "#0ea5e9",
    strong: ["economics", "finance", "market", "investing", "startup", "supply chain", "stocks", "revenue", "pricing", "entrepreneur"],
    weak: ["growth", "strategy", "profit", "fair trade", "prices", "trade", "budget", "money"],
  },
  {
    name: "Education",
    color: "#eab308",
    strong: ["tutorial", "explained", "lesson", "course", "learn", "how to", "guide", "science", "history", "math"],
    weak: ["step-by-step", "beginner", "walkthrough", "concept", "study", "basics", "introduction"],
  },
  {
    name: "Music",
    color: "#ec4899",
    strong: ["song", "music", "guitar", "piano", "cover", "beat", "producer", "remix", "album", "lyrics"],
    weak: ["chords", "melody", "studio", "track", "sound", "mix", "vocals"],
  },
  {
    name: "Travel",
    color: "#14b8a6",
    strong: ["travel", "trip", "destination", "flight", "hotel", "backpacking", "itinerary", "city guide", "vlog"],
    weak: ["explore", "tour", "adventure", "budget travel", "places", "abroad", "journey"],
  },
  {
    name: "Entertainment",
    color: "#f43f5e",
    strong: ["comedy", "sketch", "reaction", "prank", "movie", "trailer", "review", "celebrity", "funny"],
    weak: ["laugh", "story", "drama", "clip", "highlights", "moments"],
  },
];

/** Bucket for anything that doesn't clear the confidence threshold. */
export const UNCATEGORIZED = "Uncategorized";
