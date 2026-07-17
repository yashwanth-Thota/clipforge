import type { TranslateInput, TranslationProvider, TranscriptSegment } from "../types";
import { aiConfig } from "../config";

/**
 * LibreTranslate — free & self-hostable. Translates each caption segment while
 * preserving timing. Point LIBRETRANSLATE_URL at your own instance for
 * unlimited, key-free translation.
 */
export class LibreTranslateProvider implements TranslationProvider {
  readonly id = "libretranslate";

  async translate(input: TranslateInput): Promise<TranscriptSegment[]> {
    const { libretranslateUrl, libretranslateApiKey } = aiConfig.translation;
    const q = input.segments.map((s) => s.text);

    const res = await fetch(`${libretranslateUrl}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q,
        source: input.sourceLang || "auto",
        target: input.targetLang,
        format: "text",
        ...(libretranslateApiKey ? { api_key: libretranslateApiKey } : {}),
      }),
    });
    if (!res.ok) {
      throw new Error(`LibreTranslate error ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as { translatedText: string | string[] };
    const translated = Array.isArray(data.translatedText)
      ? data.translatedText
      : [data.translatedText];

    return input.segments.map((seg, i) => ({
      start: seg.start,
      end: seg.end,
      text: translated[i] ?? seg.text,
    }));
  }
}

export class NoopTranslationProvider implements TranslationProvider {
  readonly id = "none";
  async translate(input: TranslateInput): Promise<TranscriptSegment[]> {
    return input.segments;
  }
}
