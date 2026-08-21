/**
 * Provider-agnostic external video resolution.
 *
 * GetToKnow.You stores a durable page around a video, not the video file
 * itself — the source of truth is `Work.externalVideoUrl`, an ordinary
 * https(s) URL to wherever the video lives (YouTube today; XHS, a future
 * dedicated host, or any other provider later). This module isolates the
 * one piece of provider-specific knowledge (how to build a YouTube embed
 * URL) so additional providers can be added here without touching rendering
 * components or the content model.
 */
export type VideoEmbedProvider = "youtube" | "external";

export type VideoEmbedInfo = {
  provider: VideoEmbedProvider;
  /** Iframe-embeddable URL, when the provider supports it. Null otherwise. */
  embedUrl: string | null;
  /** Original URL — always safe to link to directly. */
  watchUrl: string;
};

function extractYouTubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./i, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id || null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "live") {
      return segments[1] || null;
    }
  }

  return null;
}

/** Resolve how to present a work's external video URL. Never throws. */
export function resolveVideoEmbed(rawUrl: string): VideoEmbedInfo {
  const watchUrl = rawUrl.trim();
  try {
    const url = new URL(watchUrl);
    const youTubeId = extractYouTubeId(url);
    if (youTubeId) {
      return {
        provider: "youtube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${youTubeId}`,
        watchUrl,
      };
    }
  } catch {
    // Fall through — an unparsable URL is treated as a plain external link.
  }
  return { provider: "external", embedUrl: null, watchUrl };
}
