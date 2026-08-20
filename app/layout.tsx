import type { Metadata, Viewport } from 'next';
import { Barlow, Noto_Sans_JP, Zen_Kaku_Gothic_New } from 'next/font/google';
import './globals.css';

/* 欧文は Barlow、和文は見出し Zen Kaku Gothic New / 本文 Noto Sans JP。
   font-family の先頭を Barlow にすれば、和文グリフを持たないぶん
   日本語だけが次に落ちる（globals.css の --jp-title / --jp-body）。

   和文は容量が大きいので preload しない。先に読ませると KV の連番と
   帯域を取り合う。表示は swap なので、遅れても文字は最初から見える。 */
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
});
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-noto-jp',
  display: 'swap',
  preload: false,
});
const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-zen-kaku',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'UTUTU — 店舗に、いい一日を。',
  description:
    '飲食店をはじめとする店舗のために、お客様のスマホで完結するソフトウェアをつくっています。私たちは自分たちでも店を営んでいて、毎日の営業のなかで使い、残ったものだけをかたちにしています。',
  /* まだ検索には出さない。公開してよくなったらこの2行を外す。
     **robots.txt で拒否しないこと。**クロールを止めると noindex 自体を読めず、
     外部リンク経由で逆に登録されてしまう。読ませたうえで noindex を伝える */
  robots: { index: false, follow: false },
};

/* viewport-fit=cover。#nextBtn が safe-area-inset-bottom を使うため必須 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ja" className={`${barlow.variable} ${notoSansJP.variable} ${zenKaku.variable}`}>
      <body>{children}</body>
    </html>
  );
}
