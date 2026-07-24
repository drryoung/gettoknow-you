import { makeRouteHandler } from "@keystatic/next/route-handler";
import { NextResponse } from "next/server";
import config from "../../../../keystatic.config";

/**
 * Keystatic local write/read API — development only.
 * In production every method returns 404 so no filesystem write endpoint
 * is exposed (local storage mode has no authentication).
 */
const handlers = makeRouteHandler({ config });

function unavailable() {
  return new NextResponse("Not Found", { status: 404 });
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") return unavailable();
  return handlers.GET(request);
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return unavailable();
  return handlers.POST(request);
}
