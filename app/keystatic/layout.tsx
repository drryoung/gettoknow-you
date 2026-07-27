import { notFound } from "next/navigation";
import KeystaticApp from "./keystatic";

/**
 * Keystatic Admin UI — development only.
 * In production this layout returns 404 so the editor and its write surface
 * are not publicly reachable (local storage mode has no auth).
 *
 * KeystaticApp stays in the layout so client state survives in-admin
 * navigations. `{children}` must still render so the App Router keeps the
 * `[[...params]]` page slot mounted: Keystatic create/save uses
 * history.pushState, which Next.js patches and restores against that slot.
 * Omitting `{children}` surfaces a Recoverable NotFoundError around
 * <KeystaticApp /> during create, save, and return-to-collection.
 */
export default function KeystaticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return (
    <>
      <KeystaticApp />
      {children}
    </>
  );
}
