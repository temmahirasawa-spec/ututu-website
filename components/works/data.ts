/* 実績のデータ。トップの「実績の概要」と /works の両方がここを見る。

   (a) ブランディング・店舗プロデュース … 板倉が立ち上げてきた飲食ブランド（2026-10-02 本人判断で戻した）
   (b) SaaS … 自社プロダクト GOOD SERIES（components/products/）

   **書き方の決まり**（CLAUDE.md §0）
   - 立ち上げた事実を**過去形**で書く。いまも営業・運営しているように読める書き方はしない
   - 運営会社の社名、破産・横領の経緯は書かない
   - 写真は Dropbox の YORKYS フォルダ（撮影素材・旧コーポレートサイトの素材）から選んだ候補。
     原本の置き場所は CLAUDE.md §5「実績」。差し替えたら w / h も直すこと

   **確認待ち：**各ブランドで「何を手がけたか（roles）」と、店舗写真をサイトに出してよいか */

export type Photo = { src: string; w: number; h: number; alt: string };
export type Brand = {
  id: string;
  name: string;
  /** 欧文の大見出し（Decode）。1行ずつ */
  title: string[];
  kind: string;
  since?: string;
  note: string;
  roles: string[];
  photos: Photo[];
};

const p = (name: string, w: number, h: number, alt: string): Photo => ({ src: `/img/works/${name}.webp`, w, h, alt });

export const BRANDS: Brand[] = [
  {
    id: 'brunch',
    name: 'YORKYS BRUNCH',
    title: ['YORKYS', 'BRUNCH'],
    kind: 'ブランチカフェ',
    since: '2014',
    note: '兵庫県西宮市・夙川で立ち上げた、最初のブランド。大きな窓のある、朝から長居できるブランチの店。',
    roles: ['業態開発', '店づくり', 'ブランドデザイン', '運営の仕組み'],
    photos: [
      p('brunch-interior', 1800, 1570, 'YORKYS BRUNCH の店内。大きな窓と長いカウンター'),
      p('brunch-sign', 1400, 933, 'YORKYS BRUNCH のロゴサイン'),
      p('brunch-entrance', 1400, 933, 'YORKYS BRUNCH の入口のサイン'),
      p('brunch-cup', 800, 1200, 'ロゴ入りのカップ'),
    ],
  },
  {
    id: 'creperie',
    name: 'YORKYS Creperie',
    title: ['YORKYS', 'CREPERIE'],
    kind: 'クレープ専門店',
    note: '駅前や商業施設の小さな区画に出すクレープ店。ブースの設計から、メニュー表や販促のグラフィックまで。',
    roles: ['業態開発', 'ブース設計', 'メニュー・販促デザイン', '出店'],
    photos: [
      p('creperie-store', 1800, 1200, 'YORKYS Creperie の店舗。紺の外壁にメニューのパネル'),
      p('creperie-three', 1400, 933, '3つのクレープを持つ手'),
      p('creperie-street', 1800, 1200, '路面のクレープ店'),
      p('creperie-counter', 1400, 935, 'クレープ店のカウンター'),
      p('nagoya-store', 1800, 1041, '名古屋の店舗。クレープと生ドーナツのメニューが並ぶカウンター'),
    ],
  },
  {
    id: 'bake',
    name: 'PIECE OF BAKE',
    title: ['PIECE OF', 'BAKE'],
    kind: '生ドーナツ・フレンチクルーラー専門店',
    note: 'ネオンのサインと、ガラス越しに見える厨房。行列のできた売り場をつくった。',
    roles: ['業態開発', '店舗デザイン', '商品・パッケージ', '出店'],
    photos: [
      p('bake-store', 1800, 1201, 'PIECE OF BAKE の店舗。ネオンのサインとガラス張りの厨房'),
      p('bake-tray', 1600, 1066, 'トレイいっぱいのフレンチクルーラー'),
      p('bake-queue', 1400, 1050, '店の前にできた行列'),
      p('bake-donuts', 1400, 933, '3つの生ドーナツ'),
      p('bake-neon', 1400, 934, 'ネオンのロゴとショーケース'),
    ],
  },
  {
    id: 'froma',
    name: 'FROMA',
    title: ['FROMA'],
    kind: 'チーズ料理専門店',
    note: 'チーズを主役にしたレストラン。チーズが並ぶカウンターと、レンガの壁に光る店名。',
    roles: ['業態開発', '店舗デザイン', 'メニュー開発', 'ブランドデザイン'],
    photos: [
      p('froma-interior', 1800, 1283, 'FROMA の店内。レンガの壁と光る店名'),
      p('froma-cheesebar', 1400, 788, 'チーズが並ぶカウンター'),
      p('froma-table', 1400, 933, 'チーズ料理のテーブル'),
      p('froma-beef', 1400, 933, 'チーズをかけたローストビーフ'),
      p('froma-hall', 1400, 933, '客席'),
    ],
  },
];

/** トップの「実績の概要」に並べる写真 */
export const BRAND_PICKS: Photo[] = [
  BRANDS[2].photos[0], BRANDS[1].photos[0], BRANDS[3].photos[0], BRANDS[0].photos[0], BRANDS[2].photos[1],
];
