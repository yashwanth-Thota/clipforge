import type { TranscriptSegment } from "../ai/types";

function pad(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}

function timestamp(totalSeconds: number, sep: "," | "."): string {
  const ms = Math.round((totalSeconds - Math.floor(totalSeconds)) * 1000);
  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(sec)}${sep}${pad(ms, 3)}`;
}

/** Segments -> SubRip (.srt). */
export function segmentsToSrt(segments: TranscriptSegment[]): string {
  return segments
    .map((seg, i) => {
      const start = timestamp(seg.start, ",");
      const end = timestamp(seg.end, ",");
      return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
    })
    .join("\n");
}

/** Segments -> WebVTT (.vtt). */
export function segmentsToVtt(segments: TranscriptSegment[]): string {
  const body = segments
    .map((seg) => {
      const start = timestamp(seg.start, ".");
      const end = timestamp(seg.end, ".");
      return `${start} --> ${end}\n${seg.text}\n`;
    })
    .join("\n");
  return `WEBVTT\n\n${body}`;
}

export function parseSegments(content: string): TranscriptSegment[] {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
