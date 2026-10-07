/* サイトを置くパス（Next の basePath）。2026-10-02〜07 は ututu-design.co.jp/v2 に出していたので '/v2' だった。
   2026-10-07 にルート（/）へ移したので ''（/v2 へのリンクは next.config.ts の redirects で / へ送る）。

   **public/ の素材を直に書くときは必ず asset() を通すこと。**basePath が自動で付くのは
   Link・router・next/font・metadata だけで、<img src>・<video src>・fetch・GLTFLoader の URL には付かない */
export const BASE = '';
export const asset = (p: string) => BASE + p;

/* 映像（public/clips/）の URL。/v2 を中継で出していたあいだは、中継だと映像が再生されなかったので
   ブランチの固定URLから直に読んでいた。ルートに移したいまは同じオリジン（asset と同じ）。
   **別オリジンに戻さないこと**：サイト全体のパスワード（proxy.ts）が掛かっていると、
   別オリジンの <video> には認証が付かず 401 になる */
export const media = asset;
