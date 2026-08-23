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
/* **weight は 700 だけ。**500 はサイトのどこからも選択されない
   （見出しは全部700。唯一の font:600 も、500と700からは700が選ばれる）。
   和文は @font-face 宣言だけで weight あたり約90KB CSSが膨らむので、
   使わない weight を足さないこと */
const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-zen-kaku',
  display: 'swap',
  preload: false,
});

const DESC =
  '飲食店をはじめとする店舗のために、お客様のスマホで完結するソフトウェアをつくっています。私たちは自分たちでも店を営んでいて、毎日の営業のなかで使い、残ったものだけをかたちにしています。';

export const metadata: Metadata = {
  /* 独自ドメインが決まったらここを差し替える（相対URLの解決先になる） */
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ututu-website.vercel.app'),
  title: 'UTUTU — 店舗に、いい一日を。',
  description: DESC,
  /* OGP。**画像はまだ無い。**public/ に og.png（1200×630）を置いたら
     openGraph.images: ['/og.png'] を足すこと（残っている作業に記載あり） */
  openGraph: {
    title: 'UTUTU — 店舗に、いい一日を。',
    description: DESC,
    siteName: 'UTUTU',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: { card: 'summary' },
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
