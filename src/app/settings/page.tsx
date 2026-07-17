import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { publicAiConfig } from "@/lib/ai/config";

export const dynamic = "force-dynamic";

const CAPABILITIES: { key: string; title: string; options: string[]; note: string }[] = [
  {
    key: "transcription",
    title: "Auto-captioning",
    options: ["local", "browser", "groq", "huggingface"],
    note: "Whisper via the self-hosted worker, in-browser WASM, or Groq's free tier.",
  },
  {
    key: "translation",
    title: "Caption translation",
    options: ["libretranslate", "huggingface", "none"],
    note: "LibreTranslate is free and self-hostable for unlimited use.",
  },
  {
    key: "categorization",
    title: "Topic categorization",
    options: ["keyword", "embedding", "llm"],
    note: "Zero-cost keyword engine by default; point LLM at any OpenAI-compatible endpoint.",
  },
  {
    key: "music",
    title: "Copyright-free music",
    options: ["local", "jamendo", "pixabay"],
    note: "Bundled CC0 library, or Jamendo's Creative Commons catalog (free API).",
  },
  {
    key: "viral",
    title: "Viral-moment scoring",
    options: ["heuristic", "llm"],
    note: "Heuristic hooks/questions/emphasis scorer; swap in an LLM for nuance.",
  },
];

export default function SettingsPage() {
  const config = publicAiConfig() as Record<string, any>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Every AI capability is a swappable provider. Defaults are zero-cost. Change the active
          provider via environment variables (see <code className="font-mono">.env.example</code>);
          UI-based overrides are wired to persist for later phases.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CAPABILITIES.map((cap) => {
          const active = config[cap.key]?.provider as string | undefined;
          return (
            <Card key={cap.key}>
              <CardHeader>
                <CardTitle className="text-base">{cap.title}</CardTitle>
                <CardDescription>{cap.note}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {cap.options.map((opt) => (
                  <Badge
                    key={opt}
                    className={
                      opt === active
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }
                  >
                    {opt}
                    {opt === active ? " • active" : ""}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature flags</CardTitle>
          <CardDescription>Extensibility & legal guardrails.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Object.entries(config.features ?? {}).map(([flag, on]) => (
            <Badge
              key={flag}
              className={
                on
                  ? "border-transparent bg-green-600 text-white"
                  : "bg-secondary text-secondary-foreground"
              }
            >
              {flag}: {on ? "on" : "off"}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
