import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // プロジェクトの根を明示する。
  // ~/package-lock.json が存在するため、指定しないと Turbopack が
  // ホームディレクトリを根と誤認し、public/ の素材が全部404になる
  turbopack: { root: path.dirname(new URL(import.meta.url).pathname) },
};

export default nextConfig;
