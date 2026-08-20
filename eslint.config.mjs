import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 移植元の原本。配信もビルドもしないので見なくてよい
    "reference/**",
    // three.js と GLTFLoader は自家ビルドの配布物。整形も型付けもしない
    "lib/three/*.min.js",
  ]),
]);

export default eslintConfig;
