/* GOOD ORDER / GOOD REVIEW の行き先（各サービスのLP）。
   **サイト内のリンクはすべてここを見ること。**直に書くと、差し替えのときに取りこぼす。
   使っているのは3か所で、それぞれ2本ずつ：
     ナビの PRODUCTS（SiteNav）／KVのコピーの「公式サイトへ」（Hero）／
     プロダクト2節の「公式サイトへ」（Products）

   独自ドメインに向けてある（2026-09-23、本人判断）。この時点ではまだDNSが
   切り替わる前で、**引けるようになるまでの間は6本ともリンク切れになる。**
   切り替えが遅れるようなら、つなぎとして各LPの vercel.app に戻せる：
     order:  https://good-order-lp.vercel.app
     review: https://goodloop-official.vercel.app （改名前に作ったので旧名が残っている） */
export const PRODUCT_URL = {
  order: 'https://good-order.jp',
  review: 'https://good-review.jp',
} as const;
