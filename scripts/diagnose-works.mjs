/**
 * Development-only diagnostic: explains why every Work record in
 * content/works is (or is not) publicly eligible, using the same
 * authoritative rules as the site (content/loadWorks.ts). Run with:
 *
 *   npm run diagnose:works
 *
 * Never prints draft body content — only structural metadata (status,
 * publicationState, contentMode) and the exclusion reasons.
 */
import { getWorkEligibilityReports } from "../content/loadWorks.ts";

function pad(value, width) {
  const text = String(value ?? "");
  return text.length >= width ? text.slice(0, width) : text + " ".repeat(width - text.length);
}

const reports = await getWorkEligibilityReports();
reports.sort((a, b) => a.slug.localeCompare(b.slug));

const header = `${pad("Slug", 42)} ${pad("Eligible", 9)} ${pad("Status", 10)} ${pad(
  "Editorial",
  11
)} ${pad("Content mode", 13)} Reasons`;
console.log(header);
console.log("-".repeat(header.length));

let excludedCount = 0;
for (const report of reports) {
  if (!report.eligible) excludedCount += 1;
  const line = `${pad(report.slug, 42)} ${pad(report.eligible ? "yes" : "no", 9)} ${pad(
    report.status ?? "—",
    10
  )} ${pad(report.publicationState ?? "—", 11)} ${pad(report.contentMode ?? "—", 13)} ${
    report.reasons.join("; ") || "—"
  }`;
  console.log(line);
}

console.log("-".repeat(header.length));
console.log(
  `${reports.length} record(s) checked — ${reports.length - excludedCount} eligible, ${excludedCount} excluded.`
);
