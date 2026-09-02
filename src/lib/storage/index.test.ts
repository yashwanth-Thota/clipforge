import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LocalDiskDriver } from "./index";

let dir: string;
let driver: LocalDiskDriver;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "clipforge-storage-"));
  driver = new LocalDiskDriver(dir);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("LocalDiskDriver.put", () => {
  it("writes nested keys and returns metadata", async () => {
    const data = Buffer.from("hello");
    const stored = await driver.put("a/b/c.mp4", data, "video/mp4");
    expect(stored).toEqual({ key: "a/b/c.mp4", size: 5, url: "/uploads/a/b/c.mp4" });
    await expect(readFile(join(dir, "a/b/c.mp4"), "utf8")).resolves.toBe("hello");
  });

  it("accepts Uint8Array payloads", async () => {
    const stored = await driver.put("clip.webm", new Uint8Array([1, 2, 3]));
    expect(stored.size).toBe(3);
  });

  it("rejects keys that escape the base directory", async () => {
    await expect(driver.put("../../evil.txt", Buffer.from("x"))).rejects.toThrow(/escapes/);
    await expect(driver.put("..", Buffer.from("x"))).rejects.toThrow(/escapes/);
    await expect(driver.put("", Buffer.from("x"))).rejects.toThrow(/escapes/);
  });

  it("rejects absolute keys", async () => {
    await expect(driver.put("/etc/passwd", Buffer.from("x"))).rejects.toThrow(/escapes/);
  });
});
