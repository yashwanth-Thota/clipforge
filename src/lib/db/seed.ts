/**
 * Seed default topics, a demo user, sample videos, and a small copyright-free
 * music library. Run with: npm run db:seed
 */
import "dotenv/config";
import { db } from "./client";
import { musicTracks, topics, users, videos } from "./schema";
import { DEFAULT_TOPICS } from "../catalog/taxonomy";
import { categorize } from "../catalog/categorize";
import { slugify } from "../utils";

const SAMPLE_VIDEOS = [
  {
    title: "Building a REST API in Rust from scratch",
    description:
      "Full walkthrough of axum, tokio and sqlx. We cover routing, async handlers, database migrations and deploying the binary.",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    title: "30-minute full body HIIT — no equipment",
    description:
      "A sweaty home workout: burpees, mountain climbers and core finishers. Great for fat loss and conditioning.",
    youtubeId: "aBcDeFgHiJk",
  },
  {
    title: "The economics of the coffee supply chain",
    description:
      "How beans travel from farm to cup, why prices swing, and what fair trade actually means for growers and markets.",
    youtubeId: "kLmNoPqRsTu",
  },
  {
    title: "One-pan lemon garlic salmon dinner",
    description:
      "A quick weeknight recipe. Crispy salmon, roasted veggies and a bright sauce — ready in 20 minutes.",
    youtubeId: "vWxYz012345",
  },
  {
    title: "Elden Ring boss guide: beating Malenia",
    description:
      "Strategy, build tips and dodge timings for the toughest boss. Gameplay commentary and step-by-step phases.",
    youtubeId: "6789abcdefg",
  },
];

const MUSIC = [
  { title: "Sunrise Lo-fi", artist: "ClipForge Library", mood: "chill", license: "CC0" },
  { title: "Neon Drive", artist: "ClipForge Library", mood: "energetic", license: "CC0" },
  { title: "Focus Flow", artist: "ClipForge Library", mood: "calm", license: "CC0" },
];

async function main() {
  console.log("Seeding topics...");
  const topicRows = DEFAULT_TOPICS.map((t) => ({
    name: t.name,
    slug: slugify(t.name),
    color: t.color,
  }));
  await db.insert(topics).values(topicRows).onConflictDoNothing();
  const allTopics = await db.select().from(topics);
  const topicByName = new Map(allTopics.map((t) => [t.name, t]));

  console.log("Seeding demo user...");
  const [demo] = await db
    .insert(users)
    .values({ email: "demo@clipforge.local", name: "Demo Creator" })
    .onConflictDoNothing()
    .returning();
  const demoUser =
    demo ?? (await db.select().from(users))[0];

  console.log("Seeding music library...");
  await db.insert(musicTracks).values(MUSIC).onConflictDoNothing();

  console.log("Seeding sample videos (auto-categorized)...");
  for (const v of SAMPLE_VIDEOS) {
    const result = categorize({ title: v.title, description: v.description });
    const topic = topicByName.get(result.topic);
    await db.insert(videos).values({
      userId: demoUser?.id,
      source: "youtube",
      sourceUrl: `https://youtu.be/${v.youtubeId}`,
      youtubeId: v.youtubeId,
      title: v.title,
      description: v.description,
      thumbnailUrl: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
      topicId: topic?.id,
      topicConfidence: result.confidence,
      status: "ready",
    });
    console.log(`  • ${v.title}  ->  ${result.topic} (${result.confidence.toFixed(2)})`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
