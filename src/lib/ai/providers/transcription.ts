import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import type { TranscribeInput, Transcript, TranscriptionProvider } from "../types";
import { NotImplementedYet } from "../types";
import { aiConfig } from "../config";

/**
 * Groq hosts whisper-large-v3 with a generous free tier and an OpenAI-compatible
 * transcription endpoint. Great zero-to-low-cost default once a key is set.
 */
export class GroqWhisperProvider implements TranscriptionProvider {
  readonly id = "groq";

  async transcribe(input: TranscribeInput): Promise<Transcript> {
    const { groqApiKey, model } = aiConfig.transcription;
    if (!groqApiKey) throw new Error("GROQ_API_KEY is not set for the Groq transcription provider.");

    const bytes = await readFile(input.source);
    const form = new FormData();
    form.append("file", new Blob([bytes]), basename(input.source));
    form.append("model", model);
    form.append("response_format", "verbose_json");
    if (input.lang) form.append("language", input.lang);

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${groqApiKey}` },
      body: form,
    });
    if (!res.ok) throw new Error(`Groq transcription error ${res.status}: ${await res.text()}`);

    const data = (await res.json()) as any;
    const segments: Transcript["segments"] = (data.segments ?? []).map((s: any) => ({
      start: s.start,
      end: s.end,
      text: String(s.text ?? "").trim(),
    }));
    return {
      lang: data.language ?? input.lang ?? "en",
      segments,
      text: data.text ?? segments.map((s) => s.text).join(" "),
    };
  }
}

/**
 * Local Whisper runs inside the self-hostable media worker (faster-whisper /
 * whisper.cpp) — added in Phase 2/3. The web app enqueues a job instead of
 * transcribing inline, since it exceeds serverless time limits.
 */
export class LocalWhisperProvider implements TranscriptionProvider {
  readonly id = "local";
  async transcribe(): Promise<Transcript> {
    throw new Error(
      "The 'local' Whisper provider runs in the self-hostable worker (Phase 3). For a zero-infra transcriber now, set TRANSCRIPTION_PROVIDER=groq with a free GROQ_API_KEY.",
    );
  }
}

/** In-browser transcription via transformers.js — zero server cost, added in Phase 2. */
export class BrowserWhisperProvider implements TranscriptionProvider {
  readonly id = "browser";
  async transcribe(): Promise<Transcript> {
    throw new NotImplementedYet("In-browser Whisper transcription", "Phase 2 (client WASM)");
  }
}
