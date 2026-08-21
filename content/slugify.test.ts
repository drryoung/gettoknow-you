import { describe, expect, it } from "vitest";
import { slugifyTitle } from "./slugify";

describe("slugifyTitle", () => {
  it("lowercases and hyphenates an ordinary title", () => {
    expect(slugifyTitle("Before You Build")).toBe("before-you-build");
  });

  it("strips punctuation and collapses whitespace/hyphens", () => {
    expect(slugifyTitle("Conversation — Missed Teenage Opportunity!")).toBe(
      "conversation-missed-teenage-opportunity"
    );
    expect(slugifyTitle("  Extra   Spaces  ")).toBe("extra-spaces");
  });

  it("keeps the ASCII portion of a mixed CJK + English title", () => {
    // The exact real-world title this behaviour was designed around.
    expect(
      slugifyTitle(
        "哑巴英语：会回答，却不会继续 【EnglishOS — You can answer. But can you continue?】"
      )
    ).toBe("englishos-you-can-answer-but-can-you-continue");
  });

  it("produces a stable non-empty fallback for an all-CJK title", () => {
    const slug = slugifyTitle("哑巴英语");
    expect(slug.length).toBeGreaterThan(0);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("never produces uppercase letters, spaces, or a leading/trailing hyphen", () => {
    const slug = slugifyTitle("A Title: With / Slashes & Symbols!!");
    expect(slug).toBe(slug.toLowerCase());
    expect(slug).not.toMatch(/\s/);
    expect(slug.startsWith("-")).toBe(false);
    expect(slug.endsWith("-")).toBe(false);
  });
});
