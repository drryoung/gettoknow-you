import { describe, expect, it } from "vitest";
import { resolveVideoEmbed } from "./videoEmbed";

describe("resolveVideoEmbed", () => {
  it("builds a privacy-friendly embed for a standard YouTube watch URL", () => {
    const info = resolveVideoEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(info.provider).toBe("youtube");
    expect(info.embedUrl).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(info.watchUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it("resolves youtu.be short links", () => {
    const info = resolveVideoEmbed("https://youtu.be/dQw4w9WgXcQ");
    expect(info.provider).toBe("youtube");
    expect(info.embedUrl).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("resolves YouTube Shorts links", () => {
    const info = resolveVideoEmbed("https://www.youtube.com/shorts/dQw4w9WgXcQ");
    expect(info.provider).toBe("youtube");
    expect(info.embedUrl).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("is not restricted to YouTube — treats Xiaohongshu as a plain external link", () => {
    const info = resolveVideoEmbed("https://www.xiaohongshu.com/explore/abc123");
    expect(info.provider).toBe("external");
    expect(info.embedUrl).toBeNull();
    expect(info.watchUrl).toBe("https://www.xiaohongshu.com/explore/abc123");
  });

  it("treats an ordinary https video/player URL from an unknown host as a plain link", () => {
    const info = resolveVideoEmbed("https://future-video-host.example/watch/xyz");
    expect(info.provider).toBe("external");
    expect(info.embedUrl).toBeNull();
    expect(info.watchUrl).toBe("https://future-video-host.example/watch/xyz");
  });

  it("never throws on a malformed URL", () => {
    expect(() => resolveVideoEmbed("not a url")).not.toThrow();
    const info = resolveVideoEmbed("not a url");
    expect(info.provider).toBe("external");
    expect(info.embedUrl).toBeNull();
  });
});
