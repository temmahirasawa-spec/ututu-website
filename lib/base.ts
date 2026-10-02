/* サイトを置くパス（Next の basePath）。いまは ututu-design.co.jp/v2 に出しているので '/v2'。
   本番のルート（/）に移すときは '' にするだけでよい（next.config.ts もここを読む）。

   **public/ の素材を直に書くときは必ず asset() を通すこと。**basePath が自動で付くのは
   Link・router・next/font・metadata だけで、<img src>・<video src>・fetch・GLTFLoader の URL には付かない */
export const BASE = '/v2';
export const asset = (p: string) => BASE + p;
