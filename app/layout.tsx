import type { Metadata, Viewport } from 'next';
import { Archivo, Barlow, Geist_Mono, Noto_Sans_JP, Zen_Kaku_Gothic_New } from 'next/font/google';
import { Header } from '@/components/site/Header';
import './globals.css';

/* 書体の役割（2026-10 のリニューアルで組み直し）
   - Archivo（可変：幅 62–125 / 太さ 100–900）… 欧文の見出し。幅の軸をスクロールで動かす
   - Geist Mono … 番号・ラベル・時刻など、計器の文字
   - Zen Kaku Gothic New 700/900 … 和文の見出し。トップの大見出しは 900
   - Noto Sans JP 400/500 … 和文の本文
   - Barlow … **プロダクト節（GOOD SERIES）専用。**LPと同じ書体なので残している

   和文は容量が大きいので preload しない（swap なので文字は最初から見える）。
   遅れて届いたときの組み直しで Chrome がスクロール位置を動かさないよう、
   globals.css で overflow-anchor を切ってある */
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});
const mono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
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
  weight: ['700', '900'],
  variable: '--font-zen-kaku',
  display: 'swap',
  preload: false,
});

const TITLE = 'UTUTU — 2人で、全部つくる。';
const DESC =
  '事業をつくってきた人と、つくる手を持つ人。AIを道具に、企画・デザイン・開発・映像まで。神戸のクリエイティブスタジオ UTUTU は、事業のDXを短い時間と高い精度でかたちにします。';

export const metadata: Metadata = {
  /* 独自ドメインが決まったら NEXT_PUBLIC_SITE_URL で差し替える（相対URLの解決先になる） */
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ututu-website.vercel.app'),
  title: TITLE,
  description: DESC,
  /* OGP。**画像はまだ無い。**public/ に og.png（1200×630）を置いたら
     openGraph.images: ['/og.png'] を足すこと */
  openGraph: {
    title: TITLE,
    description: DESC,
    siteName: 'UTUTU',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: { card: 'summary' },
  /* まだ検索には出さない。公開してよくなったらこの行を外す。
     **robots.txt で拒否しないこと。**クロールを止めると noindex 自体を読めない */
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ECE9E1',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${archivo.variable} ${mono.variable} ${barlow.variable} ${notoSansJP.variable} ${zenKaku.variable}`}
    >
      <body>
        {/* 現れる動き（.rv / .rise）は JS があるときだけ隠しておく。描く前に付けること */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {/* ヘッダーはページをまたいで残す（遷移しても作り直さない） */}
        <Header />
        {children}
      </body>
    </html>
  );
}
