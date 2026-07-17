import { categorize as keywordCategorize } from "../../catalog/categorize";
import type { CategorizationProvider, CategorizeInput, CategorizeOutput } from "../types";
import { aiConfig } from "../config";

/** Zero-cost, deterministic default. */
export class KeywordCategorizationProvider implements CategorizationProvider {
  readonly id = "keyword";
  async categorize(input: CategorizeInput): Promise<CategorizeOutput> {
    const r = keywordCategorize(input);
    return { topic: r.topic, confidence: r.confidence, alternatives: r.alternatives };
  }
}

/**
 * LLM categorizer against any OpenAI-compatible endpoint (Ollama, Groq, etc.).
 * Falls back to the keyword result if the endpoint is unreachable, so the
 * catalog never blocks on an external service.
 */
export class LlmCategorizationProvider implements CategorizationProvider {
  readonly id = "llm";
  private fallback = new KeywordCategorizationProvider();

  async categorize(input: CategorizeInput): Promise<CategorizeOutput> {
    const { llmBaseUrl, llmApiKey, llmModel } = aiConfig.categorization;
    try {
      const res = await fetch(`${llmBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(llmApiKey ? { Authorization: `Bearer ${llmApiKey}` } : {}),
        },
        body: JSON.stringify({
          model: llmModel,
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "You classify short-form video ideas into a single broad topic. Reply with only the topic name.",
            },
            {
              role: "user",
              content: `Title: ${input.title}\nDescription: ${input.description ?? ""}`,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(`LLM ${res.status}`);
      const data = (await res.json()) as any;
      const topic = String(data?.choices?.[0]?.message?.content ?? "").trim();
      if (!topic) throw new Error("empty LLM response");
      return { topic, confidence: 0.75, alternatives: [] };
    } catch {
      return this.fallback.categorize(input);
    }
  }
}
