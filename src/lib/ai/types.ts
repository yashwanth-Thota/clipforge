/**
 * Provider contracts for the pluggable AI layer. Each capability has a small
 * interface so implementations (free/open-source, self-hosted, or hosted) can be
 * swapped via environment config without touching call sites.
 */

export type TranscriptSegment = {
  start: number; // seconds
  end: number; // seconds
  text: string;
};

export type Transcript = {
  lang: string;
  segments: TranscriptSegment[];
  text: string;
};

export type TranscribeInput = {
  /** Local path or URL to an audio/video file. */
  source: string;
  /** Optional hint; providers may auto-detect. */
  lang?: string;
};

export interface TranscriptionProvider {
  readonly id: string;
  transcribe(input: TranscribeInput): Promise<Transcript>;
}

export type TranslateInput = {
  segments: TranscriptSegment[];
  sourceLang: string;
  targetLang: string;
};

export interface TranslationProvider {
  readonly id: string;
  translate(input: TranslateInput): Promise<TranscriptSegment[]>;
}

export type CategorizeInput = {
  title: string;
  description?: string | null;
};

export type CategorizeOutput = {
  topic: string;
  confidence: number;
  alternatives: { topic: string; score: number }[];
};

export interface CategorizationProvider {
  readonly id: string;
  categorize(input: CategorizeInput): Promise<CategorizeOutput>;
}

export type MusicQuery = {
  mood?: string;
  maxDurationSec?: number;
};

export type MusicResult = {
  title: string;
  artist?: string;
  url?: string;
  storageKey?: string;
  license: string;
  source: string;
};

export interface MusicProvider {
  readonly id: string;
  suggest(query: MusicQuery): Promise<MusicResult[]>;
}

export type ViralWindow = {
  start: number;
  end: number;
  score: number; // 0..1
  reason?: string;
};

export interface ViralScoringProvider {
  readonly id: string;
  score(transcript: Transcript): Promise<ViralWindow[]>;
}

export type PublishTarget = "youtube" | "tiktok" | "instagram";

export type PublishInput = {
  target: PublishTarget;
  filePath: string;
  title: string;
  description?: string;
  tags?: string[];
};

export type PublishResult = {
  externalId: string;
  url?: string;
};

export interface PublishingProvider {
  readonly id: string;
  readonly target: PublishTarget;
  publish(input: PublishInput): Promise<PublishResult>;
}

/** Thrown by providers whose implementation arrives in a later phase. */
export class NotImplementedYet extends Error {
  constructor(what: string, phase: string) {
    super(`${what} is not implemented yet — arrives in ${phase}.`);
    this.name = "NotImplementedYet";
  }
}
