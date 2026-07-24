import { describe, expect, it, vi, afterEach } from "vitest";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../keystatic.config";
import { getCommunityCharter } from "./loadCharter";

const root = process.cwd();

describe("Community Charter content authority", () => {
  it("uses community-charter.mdoc as the sole charter file", () => {
    expect(existsSync(path.join(root, "content/community-charter.mdoc"))).toBe(true);
    expect(existsSync(path.join(root, "content/community-charter.ts"))).toBe(false);
    expect(existsSync(path.join(root, "content/community-charter.yaml"))).toBe(false);
    expect(existsSync(path.join(root, "content/community-charter.json"))).toBe(false);
  });

  it("keeps the approved Version 0.1 wording and book title emphasis", () => {
    const raw = readFileSync(path.join(root, "content/community-charter.mdoc"), "utf8");
    expect(raw).toContain('version: "0.1"');
    expect(raw).toContain("status: Working Draft");
    expect(raw).toContain("*How to Win Friends and Influence People*");
    expect(raw).toContain("Conversation is the mechanism.");
    expect(raw).toContain("Relationship is the destination.");
    expect(raw).toContain("## Five Principles");
    expect(raw).toContain("## The Ecosystem");
    expect(raw).toContain("## Decision Test");
    expect(raw).not.toContain("<script");
    expect(raw).not.toContain("className=");
  });

  it("loads through the Keystatic reader and required frontmatter", async () => {
    const reader = createReader(root, keystaticConfig);
    const data = await reader.singletons.communityCharter.read();
    expect(data).not.toBeNull();
    expect(data?.title).toBe("GetToKnow.You Community Charter");
    expect(data?.version).toBe("0.1");
    expect(data?.status).toBe("Working Draft");
  });

  it("maps charter content for homepage rendering", async () => {
    const charter = await getCommunityCharter();
    expect(charter.title).toContain("GetToKnow.You");
    expect(charter.version).toBe("0.1");
    expect(charter.body).toBeTruthy();
  });
});

describe("Keystatic local safety", () => {
  it("uses local storage only", () => {
    const src = readFileSync(path.join(root, "keystatic.config.ts"), "utf8");
    expect(src).toContain('kind: "local"');
    expect(src).not.toContain('kind: "github"');
    expect(src).not.toContain("kind: 'github'");
  });

  it("guards the editor UI and API in production source", () => {
    const layout = readFileSync(path.join(root, "app/keystatic/layout.tsx"), "utf8");
    const api = readFileSync(
      path.join(root, "app/api/keystatic/[...params]/route.ts"),
      "utf8"
    );
    expect(layout).toContain('process.env.NODE_ENV === "production"');
    expect(layout).toContain("notFound()");
    expect(api).toContain('process.env.NODE_ENV === "production"');
    expect(api).toMatch(/status:\s*404/);
  });

  it("returns 404 from the Keystatic API when NODE_ENV is production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const route = await import("../app/api/keystatic/[...params]/route");
    const getRes = await route.GET(new Request("http://localhost/api/keystatic"));
    const postRes = await route.POST(
      new Request("http://localhost/api/keystatic", { method: "POST" })
    );
    expect(getRes.status).toBe(404);
    expect(postRes.status).toBe(404);
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });
});

describe("homepage presentation boundaries", () => {
  it("does not hard-code charter body copy in page.tsx", () => {
    const page = readFileSync(path.join(root, "app/page.tsx"), "utf8");
    expect(page).toContain("getCommunityCharter");
    expect(page).not.toContain("Be genuinely curious");
    expect(page).not.toContain("How to Win Friends and Influence People");
    expect(page).not.toContain("Does it help people become genuinely curious");
  });

  it("keeps a restrained Explore pathway without replacing charter authority", () => {
    const page = readFileSync(path.join(root, "app/page.tsx"), "utf8");
    expect(page).toContain('href="/explore"');
    expect(page).toContain("getCommunityCharter");
    expect(page).not.toContain("getListedWorks");
  });
});

describe("charter domain isolation from curated works", () => {
  it("does not treat the works collection as a charter source", () => {
    const config = readFileSync(path.join(root, "keystatic.config.ts"), "utf8");
    expect(config).toContain("communityCharter");
    expect(config).toContain("works");
    expect(existsSync(path.join(root, "content/community-charter.mdoc"))).toBe(true);
    expect(existsSync(path.join(root, "content/works/community-charter.yaml"))).toBe(false);
    expect(existsSync(path.join(root, "content/works/community-charter.mdoc"))).toBe(false);
  });
});
