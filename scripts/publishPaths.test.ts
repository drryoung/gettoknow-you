import { describe, expect, it } from "vitest";
import {
  classifyPaths,
  decidePublish,
  isSafeContentPath,
  isSensitivePath,
  parseGitStatusPorcelain,
  suggestCommitMessage,
  titleFromFrontmatter,
} from "./publishPaths";

describe("isSensitivePath", () => {
  it("refuses env files, keys, and credentials even under otherwise-safe folders", () => {
    expect(isSensitivePath(".env")).toBe(true);
    expect(isSensitivePath(".env.local")).toBe(true);
    expect(isSensitivePath("content/works/.env")).toBe(true);
    expect(isSensitivePath("secrets.json")).toBe(true);
    expect(isSensitivePath("id_rsa")).toBe(true);
    expect(isSensitivePath("certs/site.pem")).toBe(true);
  });
});

describe("isSafeContentPath", () => {
  it("allows Keystatic-managed content and established media locations", () => {
    expect(isSafeContentPath("content/works/family.mdoc")).toBe(true);
    expect(isSafeContentPath("content/themes/EnglishOS.mdoc")).toBe(true);
    expect(isSafeContentPath("content/pages/home.yaml")).toBe(true);
    expect(isSafeContentPath("content/site/footer.yaml")).toBe(true);
    expect(isSafeContentPath("content/community-charter.mdoc")).toBe(true);
    expect(isSafeContentPath("content/start-here.yaml")).toBe(true);
    expect(isSafeContentPath("public/media/works/family-01.png")).toBe(true);
    expect(isSafeContentPath("public/media/posts/family.jpg")).toBe(true);
    expect(isSafeContentPath("public/media/englishos/mute-english/01/01.png")).toBe(true);
  });

  it("refuses application code, config, tests, scripts, and loaders", () => {
    expect(isSafeContentPath("app/library/[slug]/page.tsx")).toBe(false);
    expect(isSafeContentPath("keystatic.config.ts")).toBe(false);
    expect(isSafeContentPath("package.json")).toBe(false);
    expect(isSafeContentPath("content/loadWorks.ts")).toBe(false);
    expect(isSafeContentPath("content/loadWorks.test.ts")).toBe(false);
    expect(isSafeContentPath("scripts/publishPaths.ts")).toBe(false);
    expect(isSafeContentPath("next.config.mjs")).toBe(false);
    expect(isSafeContentPath("content/about-influences.mdoc")).toBe(false);
  });

  it("refuses path traversal", () => {
    expect(isSafeContentPath("content/works/../../app/page.tsx")).toBe(false);
  });
});

describe("parseGitStatusPorcelain", () => {
  it("reads modified, untracked, and renamed paths", () => {
    const text = [
      " M content/works/family.mdoc",
      "?? public/media/works/family-01.png",
      "R  content/works/old.mdoc -> content/works/new.mdoc",
    ].join("\n");
    expect(parseGitStatusPorcelain(text)).toEqual([
      "content/works/family.mdoc",
      "public/media/works/family-01.png",
      "content/works/old.mdoc",
      "content/works/new.mdoc",
    ]);
  });
});

describe("classifyPaths", () => {
  it("separates ordinary content, unexpected files, and secrets", () => {
    const result = classifyPaths([
      "content/works/family.mdoc",
      "app/page.tsx",
      ".env.local",
      "keystatic.config.ts",
    ]);
    expect(result.safe).toEqual(["content/works/family.mdoc"]);
    expect(result.unsafe).toEqual(["app/page.tsx", "keystatic.config.ts"]);
    expect(result.sensitive).toEqual([".env.local"]);
  });
});

describe("suggestCommitMessage", () => {
  it("uses a work title when exactly one work file changed", () => {
    const message = suggestCommitMessage(["content/works/family.mdoc"], () =>
      ["---", "title: Family", "status: listed", "---", "Body"].join("\n")
    );
    expect(message).toBe("content: publish Family");
  });

  it("uses a generic message when several works changed", () => {
    expect(
      suggestCommitMessage([
        "content/works/a.mdoc",
        "content/works/b.mdoc",
      ])
    ).toBe("content: update published works");
  });
});

describe("titleFromFrontmatter", () => {
  it("reads a plain YAML title", () => {
    expect(titleFromFrontmatter("---\ntitle: Hello world\n---\n")).toBe("Hello world");
  });
});

describe("decidePublish", () => {
  it("stops on the wrong branch", () => {
    const decision = decidePublish({
      branch: "experiment",
      remoteAhead: 0,
      localAhead: 0,
      paths: ["content/works/family.mdoc"],
    });
    expect(decision.action).toBe("stop");
    if (decision.action === "stop") {
      expect(decision.reason).toContain("main");
    }
  });

  it("stops when the remote is ahead", () => {
    const decision = decidePublish({
      branch: "main",
      remoteAhead: 2,
      localAhead: 0,
      paths: ["content/works/family.mdoc"],
    });
    expect(decision.action).toBe("stop");
    if (decision.action === "stop") {
      expect(decision.reason).toContain("remote");
    }
  });

  it("stops when application code changed", () => {
    const decision = decidePublish({
      branch: "main",
      remoteAhead: 0,
      localAhead: 0,
      paths: ["content/works/family.mdoc", "app/page.tsx"],
    });
    expect(decision.action).toBe("stop");
    if (decision.action === "stop") {
      expect(decision.details).toEqual(["app/page.tsx"]);
    }
  });

  it("stops when a secret file is present", () => {
    const decision = decidePublish({
      branch: "main",
      remoteAhead: 0,
      localAhead: 0,
      paths: [".env"],
    });
    expect(decision.action).toBe("stop");
    if (decision.action === "stop") {
      expect(decision.details).toEqual([".env"]);
    }
  });

  it("reports nothing to publish on a clean tree", () => {
    const decision = decidePublish({
      branch: "main",
      remoteAhead: 0,
      localAhead: 0,
      paths: [],
    });
    expect(decision).toEqual({ action: "nothing" });
  });

  it("pushes already-committed local commits when the tree is otherwise clean", () => {
    const decision = decidePublish({
      branch: "main",
      remoteAhead: 0,
      localAhead: 1,
      paths: [],
    });
    expect(decision).toEqual({ action: "push-only", localAhead: 1 });
  });

  it("classifies a normal content-only change as commit-and-push", () => {
    const decision = decidePublish({
      branch: "main",
      remoteAhead: 0,
      localAhead: 0,
      paths: ["content/works/family.mdoc", "public/media/works/family-01.png"],
      readFile: (path) =>
        path.endsWith("family.mdoc") ? "---\ntitle: Family\n---\n" : null,
    });
    expect(decision.action).toBe("commit-and-push");
    if (decision.action === "commit-and-push") {
      expect(decision.files).toEqual([
        "content/works/family.mdoc",
        "public/media/works/family-01.png",
      ]);
      expect(decision.message).toBe("content: publish Family");
    }
  });
});
