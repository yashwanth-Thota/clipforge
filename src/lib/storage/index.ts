import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export type StoredObject = {
  key: string;
  size: number;
  url?: string;
};

export interface StorageDriver {
  readonly id: string;
  put(key: string, data: Buffer | Uint8Array, contentType?: string): Promise<StoredObject>;
  read(key: string): Promise<Buffer>;
  /** Absolute local path, when the driver is disk-backed (needed by the transcription reader). */
  resolvePath?(key: string): string;
}

/** Local disk driver — the zero-cost dev/self-host default. */
export class LocalDiskDriver implements StorageDriver {
  readonly id = "local";
  constructor(private baseDir = process.env.STORAGE_LOCAL_DIR ?? "./uploads") {}

  resolvePath(key: string): string {
    return resolve(join(this.baseDir, key));
  }

  async put(key: string, data: Buffer | Uint8Array): Promise<StoredObject> {
    const full = this.resolvePath(key);
    await mkdir(resolve(this.baseDir), { recursive: true });
    await writeFile(full, data);
    return { key, size: data.byteLength, url: `/api/media/${encodeURIComponent(key)}` };
  }

  async read(key: string): Promise<Buffer> {
    return readFile(this.resolvePath(key));
  }
}

/**
 * Cloudflare R2 / Supabase Storage drivers implement the same interface for
 * production (free tiers). Left as typed stubs so call sites are stable.
 */
export class R2Driver implements StorageDriver {
  readonly id = "r2";
  async put(): Promise<StoredObject> {
    throw new Error("R2 storage driver not configured yet (see .env.example R2_* vars).");
  }
  async read(): Promise<Buffer> {
    throw new Error("R2 storage driver not configured yet.");
  }
}

let cached: StorageDriver | null = null;
export function getStorage(): StorageDriver {
  if (cached) return cached;
  switch (process.env.STORAGE_DRIVER) {
    case "r2":
      cached = new R2Driver();
      break;
    case "local":
    default:
      cached = new LocalDiskDriver();
  }
  return cached;
}
