import { describe, expect, it, vi } from "vitest";

/** Re-import the config module with a controlled environment. */
async function loadConfig(env: Record<string, string>) {
  vi.resetModules();
  const prior = Object.fromEntries(Object.keys(env).map((k) => [k, process.env[k]]));
  Object.assign(process.env, env);
  try {
    return await import("./config");
  } finally {
    for (const k of Object.keys(env)) {
      if (prior[k] === undefined) delete process.env[k];
      else process.env[k] = prior[k] as string;
    }
  }
}

describe("aiConfig defaults", () => {
  it("uses the zero-cost providers and default feature flags", async () => {
    const { aiConfig } = await loadConfig({});
    expect(aiConfig.categorization.provider).toBe("keyword");
    expect(aiConfig.transcription.provider).toBe("local");
    expect(aiConfig.translation.provider).toBe("libretranslate");
    expect(aiConfig.music.provider).toBe("local");
    expect(aiConfig.viral.provider).toBe("heuristic");
    expect(aiConfig.features).toEqual({
      youtubeImport: true,
      youtubeDownload: false,
      autopost: false,
      monetization: false,
    });
  });
});

describe("flag parsing", () => {
  it("accepts true, 1 and yes", async () => {
    const { aiConfig } = await loadConfig({
      FEATURE_AUTOPOST: "1",
      FEATURE_MONETIZATION: "yes",
    });
    expect(aiConfig.features.autopost).toBe(true);
    expect(aiConfig.features.monetization).toBe(true);
  });

  it("treats anything else as false, overriding the fallback", async () => {
    const { aiConfig } = await loadConfig({
      FEATURE_YOUTUBE_IMPORT: "0",
      FEATURE_AUTOPOST: "banana",
    });
    expect(aiConfig.features.youtubeImport).toBe(false);
    expect(aiConfig.features.autopost).toBe(false);
  });
});

describe("publicAiConfig", () => {
  it("never leaks API keys", async () => {
    const { publicAiConfig } = await loadConfig({
      GROQ_API_KEY: "groq-super-secret",
      LLM_API_KEY: "llm-super-secret",
      JAMENDO_CLIENT_ID: "jamendo-super-secret",
      PIXABAY_API_KEY: "pixabay-super-secret",
    });
    const json = JSON.stringify(publicAiConfig());
    expect(json).not.toContain("super-secret");
    expect(json).not.toContain("groq-super-secret");
    expect(publicAiConfig().transcription.hasGroqKey).toBe(true);
    expect(publicAiConfig().music.hasJamendo).toBe(true);
  });

  it("parses and trims the translation target language list", async () => {
    const { aiConfig, publicAiConfig } = await loadConfig({
      TRANSLATION_TARGET_LANGS: "fr, de,es,,en",
    });
    expect(aiConfig.translation.targetLangs).toEqual(["fr", "de", "es", "en"]);
    expect(publicAiConfig().translation.targetLangs).toEqual(["fr", "de", "es", "en"]);
  });
});
