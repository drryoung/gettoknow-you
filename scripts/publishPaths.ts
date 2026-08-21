/**
 * Conservative classification of working-tree paths for owner publishing.
 *
 * Safe paths are derived from Keystatic storage in keystatic.config.ts and
 * the project's established public media locations. Anything else — including
 * application code, config, tests, scripts, and secrets — is refused.
 */

/** Keystatic collection/singleton storage from keystatic.config.ts. */
export const KEYSTATIC_CONTENT_PREFIXES = [
  "content/works/",
  "content/themes/",
  "content/pages/",
  "content/site/",
] as const;

/** Keystatic singleton files that are not under a collection glob. */
export const KEYSTATIC_CONTENT_FILES = [
  "content/community-charter.mdoc",
  "content/start-here.yaml",
] as const;

/**
 * Media locations:
 * - public/media/works/ — Keystatic Works body-image directory
 * - public/media/posts/ — existing cover images and native video files
 * - public/media/englishos/ — established EnglishOS carousel panel convention
 */
export const SAFE_MEDIA_PREFIXES = [
  "public/media/works/",
  "public/media/posts/",
  "public/media/englishos/",
] as const;

const SENSITIVE_NAME_PATTERN =
  /(^|\/)\.env($|\.)|(^|\/)\.env\.[^/]+$|\.pem$|\.key$|credentials\.json$|secrets?\.(json|ya?ml)$|(^|\/)id_rsa|(^|\/)id_ed25519|\.p12$|\.pfx$/i;

export type ClassifiedPaths = {
  safe: string[];
  unsafe: string[];
  sensitive: string[];
};

export function normalizeRepoPath(raw: string): string {
  return raw.trim().replace(/\\/g, "/").replace(/^\.\//, "");
}

export function isSensitivePath(path: string): boolean {
  const normalized = normalizeRepoPath(path);
  if (!normalized) return false;
  if (normalized.startsWith(".env")) return true;
  return SENSITIVE_NAME_PATTERN.test(normalized);
}

export function isSafeContentPath(path: string): boolean {
  const normalized = normalizeRepoPath(path);
  if (!normalized || normalized.includes("..")) return false;
  if (isSensitivePath(normalized)) return false;

  if ((KEYSTATIC_CONTENT_FILES as readonly string[]).includes(normalized)) {
    return true;
  }

  for (const prefix of KEYSTATIC_CONTENT_PREFIXES) {
    if (normalized.startsWith(prefix)) return true;
  }
  for (const prefix of SAFE_MEDIA_PREFIXES) {
    if (normalized.startsWith(prefix)) return true;
  }
  return false;
}

export function classifyPaths(paths: readonly string[]): ClassifiedPaths {
  const safe: string[] = [];
  const unsafe: string[] = [];
  const sensitive: string[] = [];
  const seen = new Set<string>();

  for (const raw of paths) {
    const path = normalizeRepoPath(raw);
    if (!path || seen.has(path)) continue;
    seen.add(path);

    if (isSensitivePath(path)) {
      sensitive.push(path);
      continue;
    }
    if (isSafeContentPath(path)) {
      safe.push(path);
      continue;
    }
    unsafe.push(path);
  }

  safe.sort();
  unsafe.sort();
  sensitive.sort();
  return { safe, unsafe, sensitive };
}

/**
 * Parse `git status --porcelain=v1 -uall` (with core.quotepath=false).
 * Returns every path mentioned, including both sides of a rename.
 */
export function parseGitStatusPorcelain(text: string): string[] {
  const paths: string[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine) continue;
    if (rawLine.length < 4) continue;
    const payload = rawLine.slice(3);
    if (rawLine.slice(0, 2) === "R " || rawLine.slice(0, 2) === "RM" || rawLine.includes(" -> ")) {
      const parts = payload.split(" -> ");
      for (const part of parts) {
        const path = stripGitQuotes(part);
        if (path) paths.push(path);
      }
      continue;
    }
    const path = stripGitQuotes(payload);
    if (path) paths.push(path);
  }
  return paths;
}

function stripGitQuotes(value: string): string {
  let out = value.trim();
  if (out.startsWith('"') && out.endsWith('"') && out.length >= 2) {
    out = out.slice(1, -1).replace(/\\"/g, '"');
  }
  return normalizeRepoPath(out);
}

export function titleFromFrontmatter(source: string): string | null {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const titleLine = match[1].match(/^title:\s*(.+)$/m);
  if (!titleLine) return null;
  let title = titleLine[1].trim();
  if (
    (title.startsWith('"') && title.endsWith('"')) ||
    (title.startsWith("'") && title.endsWith("'"))
  ) {
    title = title.slice(1, -1);
  }
  title = title.replace(/^>\s*/, "").trim();
  return title || null;
}

export function suggestCommitMessage(
  paths: readonly string[],
  readFile?: (path: string) => string | null
): string {
  const normalized = paths.map(normalizeRepoPath);
  const workFiles = normalized.filter(
    (path) => path.startsWith("content/works/") && path.endsWith(".mdoc")
  );

  if (workFiles.length === 1 && readFile) {
    const source = readFile(workFiles[0]);
    if (source) {
      const title = titleFromFrontmatter(source);
      if (title) return `content: publish ${title}`;
    }
  }

  if (workFiles.length > 1) return "content: update published works";
  if (workFiles.length === 1) return "content: update published works";
  if (normalized.every((path) => path.startsWith("public/media/"))) {
    return "content: update media";
  }
  return "content: update published works";
}

export type PublishDecision =
  | { action: "stop"; reason: string; details?: string[] }
  | { action: "nothing" }
  | { action: "push-only"; localAhead: number }
  | {
      action: "commit-and-push";
      files: string[];
      message: string;
      localAhead: number;
    };

export function decidePublish(input: {
  branch: string;
  expectedBranch?: string;
  remoteAhead: number;
  localAhead: number;
  paths: readonly string[];
  readFile?: (path: string) => string | null;
  commitMessage?: string | null;
}): PublishDecision {
  const expectedBranch = input.expectedBranch ?? "main";
  if (input.branch !== expectedBranch) {
    return {
      action: "stop",
      reason: `Publishing only runs on the ${expectedBranch} branch. This folder is currently on "${input.branch}". Switch back to ${expectedBranch} before publishing.`,
    };
  }

  if (input.remoteAhead > 0) {
    return {
      action: "stop",
      reason:
        "The remote has commits that are not on this computer. Publishing stopped so nothing is overwritten. Pull or review those remote commits first, then try again.",
    };
  }

  const classified = classifyPaths(input.paths);
  if (classified.sensitive.length > 0) {
    return {
      action: "stop",
      reason: "Publishing stopped. Sensitive files must never be published automatically.",
      details: classified.sensitive,
    };
  }
  if (classified.unsafe.length > 0) {
    return {
      action: "stop",
      reason: "Publishing stopped.\n\nThese changes are not ordinary content changes:",
      details: classified.unsafe,
    };
  }

  if (classified.safe.length === 0) {
    if (input.localAhead > 0) {
      return { action: "push-only", localAhead: input.localAhead };
    }
    return { action: "nothing" };
  }

  const message =
    input.commitMessage?.trim() ||
    suggestCommitMessage(classified.safe, input.readFile);

  return {
    action: "commit-and-push",
    files: classified.safe,
    message,
    localAhead: input.localAhead,
  };
}
