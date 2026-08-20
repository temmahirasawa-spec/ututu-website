/* Founders の全文。本人支給の確定稿。
   一言（.fd-ex）は After.tsx 側、全文はここ。 */

export type Bio = { role: string; name: string; en: string; bio: string };

export const BIOS: Record<string, Bio> = {
  yosuke: {
    role: '共同創業者 / ビジネスプロデューサー',
    name: '板倉 洋輔',
    en: 'Yosuke Itakura',
    bio:
      '2014年、兵庫県西宮市・夙川にブランチカフェ「YORKYS BRUNCH」を創業。以降、クレープ専門店「YORKYS Creperie」、生ドーナツ専門店「PIECE OF BAKE」、チーズ料理専門店「FROMA」など複数のブランドを立ち上げ、阪急三番街、うめきたグリーンプレイス、コピス吉祥寺など関西・関東の商業施設や駅前立地へ出店。2026年より3ブランドの全国フランチャイズ展開を開始する。株式会社YORKYS ENTERTAINMENT 代表取締役。2026年、株式会社UTUTUを共同創業。',
  },
  temma: {
    role: '共同創業者 / クリエイティブディレクター',
    name: '平澤 天真',
    en: 'Temma Hirasawa',
    bio:
      'グラフィックデザイナーとしてキャリアを始め、Webデザイン、UIデザインへと領域を広げる。サイバーエージェントのDX部門で、2,000万会員を超える大規模サービスのアプリや、短期間で全国規模へ拡大したチェーンの会員アプリなど、UI/UX設計を担当。並行してAdobe公式TikTok広告「1日1分Photoshop」の企画・制作を手がける。2026年、株式会社UTUTUを共同創業。店舗事業者のためのプロダクト群「GOODシリーズ」の設計と開発を統括する。',
  },
};
