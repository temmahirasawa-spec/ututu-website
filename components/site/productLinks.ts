/* GOOD ORDER / GOOD REVIEW の行き先（各サービスのLP）。
   **サイト内のリンクはすべてここを見ること。**直に書くと、差し替えのときに取りこぼす。
   使っているのは3か所で、それぞれ2本ずつ：
     ナビの PRODUCTS（SiteNav）／KVのコピーの「公式サイトへ」（Hero）／
     プロダクト2節の「公式サイトへ」（Products）

   いまは各LPの vercel.app に向けている。good-order.jp / good-review.jp は
   まだDNSが引けない（2026-09-23 確認）。**独自ドメインでLPが開いたら、ここの2行を
   差し替えるだけで済む。**
   GOOD REVIEW のLPは、改名前（GOOD LOOP）に作ったので、ホスト名に旧名が残っている */
export const PRODUCT_URL = {
  order: 'https://good-order-lp.vercel.app',
  review: 'https://goodloop-official.vercel.app',
} as const;
