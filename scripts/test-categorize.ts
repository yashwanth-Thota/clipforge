/**
 * Quick, dependency-light check of the categorization engine.
 * Run: npm run test:categorize
 */
import { categorize } from "../src/lib/catalog/categorize";

const cases: { input: { title: string; description: string }; expect: string }[] = [
  {
    input: {
      title: "Building a REST API in Rust from scratch",
      description: "axum, tokio, sqlx, routing, async handlers and database migrations.",
    },
    expect: "Technology",
  },
  {
    input: {
      title: "30-minute full body HIIT — no equipment",
      description: "burpees, mountain climbers and core finishers for fat loss.",
    },
    expect: "Fitness",
  },
  {
    input: {
      title: "One-pan lemon garlic salmon dinner",
      description: "A quick weeknight recipe with roasted veggies, ready in 20 minutes.",
    },
    expect: "Food & Cooking",
  },
  {
    input: {
      title: "Elden Ring boss guide: beating Malenia",
      description: "Strategy, build tips and dodge timings. Gameplay commentary.",
    },
    expect: "Gaming",
  },
  {
    input: {
      title: "The economics of the coffee supply chain",
      description: "Why prices swing and what fair trade means for growers and markets.",
    },
    expect: "Business & Finance",
  },
];

let passed = 0;
for (const c of cases) {
  const r = categorize(c.input);
  const ok = r.topic === c.expect;
  passed += ok ? 1 : 0;
  const mark = ok ? "PASS" : "FAIL";
  console.log(
    `[${mark}] "${c.input.title}"\n       -> ${r.topic} (${r.confidence.toFixed(2)}), expected ${c.expect}`,
  );
}

console.log(`\n${passed}/${cases.length} passed.`);
if (passed !== cases.length) process.exit(1);
