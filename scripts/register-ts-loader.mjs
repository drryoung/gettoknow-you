/**
 * Minimal, synchronous, in-thread module hook so plain `node` can run this
 * repo's TypeScript scripts without a bundler. Only appends extensions for
 * relative/absolute specifiers Node cannot otherwise resolve directly
 * (mirrors the extension-less imports already used throughout content/*.ts
 * and keystatic.config.ts, which assume bundler-style resolution).
 *
 * No third-party dependency — uses Node's built-in `module.registerHooks`.
 */
import { registerHooks } from "node:module";

const EXTENSIONS = [".ts", ".tsx", ".mts"];
const KNOWN_RESOLVABLE_EXTENSIONS = /\.(js|mjs|cjs|json|node|ts|tsx|mts|cts)$/;

registerHooks({
  resolve(specifier, context, nextResolve) {
    const isRelativeOrAbsolute =
      specifier.startsWith(".") || specifier.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(specifier);
    const hasExtension = KNOWN_RESOLVABLE_EXTENSIONS.test(specifier);

    if (!isRelativeOrAbsolute || hasExtension) {
      return nextResolve(specifier, context);
    }

    // Prefer a sibling .ts/.tsx/.mts file over a same-named directory,
    // matching the bundler resolution this repo's source already assumes.
    for (const ext of EXTENSIONS) {
      try {
        return nextResolve(specifier + ext, context);
      } catch {
        // Try the next candidate extension.
      }
    }

    return nextResolve(specifier, context);
  },
});
