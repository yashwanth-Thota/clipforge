"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RecategorizeButton({ hasVideos }: { hasVideos: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function run() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/categorize", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Re-categorization failed");
      setMsg({
        kind: "success",
        text: data?.updated ? `Re-sorted ${data.updated} videos.` : "Nothing to re-sort.",
      });
      router.refresh();
    } catch (err) {
      setMsg({
        kind: "error",
        text: err instanceof Error ? err.message : "Re-categorization failed",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={run} disabled={loading || !hasVideos}>
        {loading ? "Re-sorting…" : "Re-run categorization"}
      </Button>
      {msg && (
        <p
          role="status"
          className={msg.kind === "error" ? "text-xs text-destructive" : "text-xs text-success"}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
