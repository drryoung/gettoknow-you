import { notFound } from "next/navigation";
import KeystaticApp from "./keystatic";

/**
 * Keystatic Admin UI — development only.
 * In production this layout returns 404 so the editor and its write surface
 * are not publicly reachable (local storage mode has no auth).
 */
export default function KeystaticLayout() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <KeystaticApp />;
}
