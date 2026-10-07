import path from "node:path";
import type { NextConfig } from "next";
import { BASE } from "./lib/base";

const nextConfig: NextConfig = {
  // サイトを置くパス（lib/base.ts）。いまはルートなので付けない
  ...(BASE ? { basePath: BASE } : {}),
  // 2026-10-02〜07 は /v2 に出していた（洋輔さんたちに共有済み）。その URL を / へ送る
  async redirects() {
    return [
      { source: "/v2", destination: "/", permanent: true },
      { source: "/v2/:path*", destination: "/:path*", permanent: true },
    ];
  },
  poweredByHeader: false, // X-Powered-By: Next.js を名乗る必要はない
  // プロジェクトの根を明示する。
  // ~/package-lock.json が存在するため、指定しないと Turbopack が
  // ホームディレクトリを根と誤認し、public/ の素材が全部404になる
  turbopack: { root: path.dirname(new URL(import.meta.url).pathname) },
};

export default nextConfig;
