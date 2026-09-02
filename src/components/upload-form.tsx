"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    setLoading(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/videos/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setMsg({ kind: "success", text: `Uploaded “${data.video.title}”.` });
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          aria-label="Video file to upload"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-xs"
          required
        />
        <Button type="submit" variant="secondary" disabled={loading}>
          {loading ? "Uploading…" : "Upload"}
        </Button>
      </div>
      {msg && (
        <p
          role="status"
          className={msg.kind === "error" ? "text-xs text-destructive" : "text-xs text-success"}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}
