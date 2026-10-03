/* サイトを置くパス（Next の basePath）。いまは ututu-design.co.jp/v2 に出しているので '/v2'。
   本番のルート（/）に移すときは '' にするだけでよい（next.config.ts もここを読む）。

   **public/ の素材を直に書くときは必ず asset() を通すこと。**basePath が自動で付くのは
   Link・router・next/font・metadata だけで、<img src>・<video src>・fetch・GLTFLoader の URL には付かない */
export const BASE = '/v2';
export const asset = (p: string) => BASE + p;

/* 映像（public/clips/）だけは、本番では**このブランチの固定URLから直に**読む。
   ututu-design.co.jp/v2 は main の rewrites（中継）を通っていて、ページや写真は届くのに、
   映像は再生されなかった（2026-10-03 本人報告）。映像は Range（部分取得）で読まれるので、中継と相性が悪い。
   <video> は別オリジンでも CORS なしで再生できる。手元（開発中）は同じオリジンのまま。
   新サイトを / に移して中継をやめたら、MEDIA_ORIGIN は '' に戻す（CLAUDE.md §8） */
const MEDIA_ORIGIN = process.env.NODE_ENV === 'production'
  ? 'https://ututu-website-git-claude-re-452d4f-temmahirasawa-1946s-projects.vercel.app'
  : '';
export const media = (p: string) => MEDIA_ORIGIN + BASE + p;
