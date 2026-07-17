/**
 * Central, env-driven configuration for the pluggable AI layer and feature flags.
 * This is what the Settings page reads/writes so models are self-configurable.
 */

function flag(name: string, fallback = false): boolean {
  const v = process.env[name];
  if (v == null) return fallback;
  return v === "true" || v === "1" || v === "yes";
}

export const aiConfig = {
  transcription: {
    provider: process.env.TRANSCRIPTION_PROVIDER ?? "local",
    groqApiKey: process.env.GROQ_API_KEY ?? "",
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY ?? "",
    model: process.env.WHISPER_MODEL ?? "whisper-large-v3",
  },
  translation: {
    provider: process.env.TRANSLATION_PROVIDER ?? "libretranslate",
    libretranslateUrl: process.env.LIBRETRANSLATE_URL ?? "https://libretranslate.com",
    libretranslateApiKey: process.env.LIBRETRANSLATE_API_KEY ?? "",
    targetLangs: (process.env.TRANSLATION_TARGET_LANGS ?? "es,hi,pt,fr,de")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  },
  categorization: {
    provider: process.env.CATEGORIZATION_PROVIDER ?? "keyword",
    llmBaseUrl: process.env.LLM_BASE_URL ?? "http://localhost:11434/v1",
    llmApiKey: process.env.LLM_API_KEY ?? "",
    llmModel: process.env.LLM_MODEL ?? "llama3.1:8b",
  },
  music: {
    provider: process.env.MUSIC_PROVIDER ?? "local",
    jamendoClientId: process.env.JAMENDO_CLIENT_ID ?? "",
    pixabayApiKey: process.env.PIXABAY_API_KEY ?? "",
  },
  viral: {
    provider: process.env.VIRAL_PROVIDER ?? "heuristic",
  },
  features: {
    youtubeImport: flag("FEATURE_YOUTUBE_IMPORT", true),
    youtubeDownload: flag("FEATURE_YOUTUBE_DOWNLOAD", false),
    autopost: flag("FEATURE_AUTOPOST", false),
    monetization: flag("FEATURE_MONETIZATION", false),
  },
} as const;

export type AiConfig = typeof aiConfig;

/** Safe-to-expose view of config for the Settings UI (no secrets). */
export function publicAiConfig() {
  return {
    transcription: {
      provider: aiConfig.transcription.provider,
      model: aiConfig.transcription.model,
      hasGroqKey: Boolean(aiConfig.transcription.groqApiKey),
    },
    translation: {
      provider: aiConfig.translation.provider,
      endpoint: aiConfig.translation.libretranslateUrl,
      targetLangs: aiConfig.translation.targetLangs,
    },
    categorization: {
      provider: aiConfig.categorization.provider,
      llmModel: aiConfig.categorization.llmModel,
    },
    music: {
      provider: aiConfig.music.provider,
      hasJamendo: Boolean(aiConfig.music.jamendoClientId),
    },
    viral: { provider: aiConfig.viral.provider },
    features: aiConfig.features,
  };
}
