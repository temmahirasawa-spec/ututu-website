/* Founders の全文。本人支給の確定稿。
   一言（.fd-ex）は After.tsx 側、全文はここ。 */

export type Bio = { role: string; name: string; en: string; bio: string };

export const BIOS: Record<string, Bio> = {
  yosuke: {
    role: '共同創業者 / ビジネスプロデューサー',
    name: '板倉 洋輔',
    en: 'Yosuke Itakura',
    bio:
      '神戸・阪神間で10年以上、飲食店の経営・出店に携わる。業態の企画から店づくり、日々の運営までを現場で手がけてきた。2026年、株式会社UTUTUを共同創業。現場と数字の両方から、プロダクトと事業の設計を担う。',
  },
  temma: {
    role: '共同創業者 / クリエイティブディレクター',
    name: '平澤 天真',
    en: 'Temma Hirasawa',
    bio:
      'グラフィックデザイナーとしてキャリアを始め、Webデザイン、UIデザインへと領域を広げる。サイバーエージェントのDX部門で、2,000万会員を超える大規模サービスのアプリや、短期間で全国規模へ拡大したチェーンの会員アプリなど、UI/UX設計を担当。並行してAdobe公式TikTok広告「1日1分Photoshop」の企画・制作を手がける。2026年、株式会社UTUTUを共同創業。店舗事業者のためのプロダクト群「GOODシリーズ」の設計と開発を統括する。',
  },
};
