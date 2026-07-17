"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type CaptionTrack = {
  id: string;
  lang: string;
  isOriginal: boolean;
};

export function CaptionsPanel({
  videoId,
  canTranscribe,
  tracks,
  targetLangs,
}: {
  videoId: string;
  canTranscribe: boolean;
  tracks: CaptionTrack[];
  targetLangs: string[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [lang, setLang] = useState(targetLangs[0] ?? "es");

  const original = tracks.find((t) => t.isOriginal);

  async function call(url: string, body?: unknown, label = "working") {
    setBusy(label);
    setMsg(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => call(`/api/videos/${videoId}/transcribe`, undefined, "transcribe")}
          disabled={!canTranscribe || busy !== null}
        >
          {busy === "transcribe" ? "Transcribing…" : original ? "Re-caption" : "Auto-caption"}
        </Button>

        {original && (
          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {targetLangs.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              onClick={() => call(`/api/captions/${original.id}/translate`, { targetLang: lang }, "translate")}
              disabled={busy !== null}
            >
              {busy === "translate" ? "Translating…" : "Translate"}
            </Button>
          </div>
        )}
      </div>

      {!canTranscribe && (
        <p className="text-xs text-muted-foreground">
          Auto-captioning runs on uploaded videos. Set{" "}
          <code className="font-mono">TRANSCRIPTION_PROVIDER=groq</code> with a free{" "}
          <code className="font-mono">GROQ_API_KEY</code> for a zero-infra transcriber.
        </p>
      )}
      {msg && <p className="text-xs text-destructive">{msg}</p>}

      <div className="divide-y rounded-lg border">
        {tracks.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">No caption tracks yet.</div>
        )}
        {tracks.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium uppercase">{t.lang}</span>
              {t.isOriginal && (
                <Badge className="bg-secondary text-secondary-foreground">original</Badge>
              )}
            </div>
            <div className="flex gap-3 text-xs">
              <a className="text-primary hover:underline" href={`/api/captions/${t.id}?format=srt`}>
                .srt
              </a>
              <a className="text-primary hover:underline" href={`/api/captions/${t.id}?format=vtt`}>
                .vtt
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
