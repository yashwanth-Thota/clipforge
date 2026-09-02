import { describe, expect, it } from "vitest";
import { formatDuration, slugify } from "./utils";

describe("formatDuration", () => {
  it("renders nothing for missing or non-positive durations", () => {
    expect(formatDuration()).toBe("—");
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration(0)).toBe("—");
    expect(formatDuration(-5)).toBe("—");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(45)).toBe("0:45");
    expect(formatDuration(75)).toBe("1:15");
  });

  it("includes hours only when present", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(359999)).toBe("99:59:59");
  });

  it("rounds fractional seconds", () => {
    expect(formatDuration(1.4)).toBe("0:01");
    expect(formatDuration(59.6)).toBe("1:00");
  });
});

describe("slugify", () => {
  it("lowercases and separates runs of non-alphanumeric characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("  spaced  out  ")).toBe("spaced-out");
    expect(slugify("MiXeD CaSe 123")).toBe("mixed-case-123");
  });

  it("strips leading and trailing separators", () => {
    expect(slugify("-leading")).toBe("leading");
    expect(slugify("trailing-")).toBe("trailing");
  });

  it("treats non-ASCII letters as separators and collapses to empty string for symbols only", () => {
    expect(slugify("Café & Crème")).toBe("caf-cr-me");
    expect(slugify("---")).toBe("");
    expect(slugify("")).toBe("");
  });
});
