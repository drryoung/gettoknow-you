/**
 * Optional catch-all so every /keystatic/* path (dashboard, create, item,
 * collection list) resolves to the same App Router page. Keystatic reads the
 * real URL on the client; this page exists to keep the catch-all segment
 * mounted across pushState-driven navigations.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ params?: string[] }>;
}) {
  // Next.js 15 passes params as a Promise — await so soft restores of the
  // catch-all segment reconcile cleanly after Keystatic create/save redirects.
  await params;
  return null;
}
