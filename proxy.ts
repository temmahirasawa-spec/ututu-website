import { NextResponse, type NextRequest } from "next/server";

import { siteLock } from "./lib/site-lock";

/** サイト全体のパスワード（lib/site-lock.ts。2026-10-07 天真の指示で非公開に）。Next.js 16 では middleware の名前が proxy になった */
export function proxy(request: NextRequest) {
  return siteLock(request) ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
