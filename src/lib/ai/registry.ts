/**
 * Provider registry — the single place that maps configuration to concrete
 * provider instances. Call sites depend only on the interfaces in ./types.
 */
import { aiConfig } from "./config";
import type {
  CategorizationProvider,
  MusicProvider,
  PublishingProvider,
  PublishTarget,
  TranscriptionProvider,
  TranslationProvider,
  ViralScoringProvider,
} from "./types";

import {
  KeywordCategorizationProvider,
  LlmCategorizationProvider,
} from "./providers/categorization";
import { LibreTranslateProvider, NoopTranslationProvider } from "./providers/translation";
import {
  BrowserWhisperProvider,
  GroqWhisperProvider,
  LocalWhisperProvider,
} from "./providers/transcription";
import { JamendoMusicProvider, LocalMusicProvider } from "./providers/music";
import { HeuristicViralProvider } from "./providers/viral";
import {
  InstagramPublishingProvider,
  TikTokPublishingProvider,
  YouTubePublishingProvider,
} from "./providers/publishing";

export function getCategorizationProvider(): CategorizationProvider {
  switch (aiConfig.categorization.provider) {
    case "llm":
      return new LlmCategorizationProvider();
    case "keyword":
    case "embedding": // embedding impl lands later; keyword is a safe default
    default:
      return new KeywordCategorizationProvider();
  }
}

export function getTranscriptionProvider(): TranscriptionProvider {
  switch (aiConfig.transcription.provider) {
    case "groq":
      return new GroqWhisperProvider();
    case "browser":
      return new BrowserWhisperProvider();
    case "local":
    default:
      return new LocalWhisperProvider();
  }
}

export function getTranslationProvider(): TranslationProvider {
  switch (aiConfig.translation.provider) {
    case "none":
      return new NoopTranslationProvider();
    case "libretranslate":
    default:
      return new LibreTranslateProvider();
  }
}

export function getMusicProvider(): MusicProvider {
  switch (aiConfig.music.provider) {
    case "jamendo":
      return new JamendoMusicProvider();
    case "local":
    default:
      return new LocalMusicProvider();
  }
}

export function getViralProvider(): ViralScoringProvider {
  return new HeuristicViralProvider();
}

export function getPublishingProvider(target: PublishTarget): PublishingProvider {
  switch (target) {
    case "youtube":
      return new YouTubePublishingProvider();
    case "tiktok":
      return new TikTokPublishingProvider();
    case "instagram":
      return new InstagramPublishingProvider();
  }
}
