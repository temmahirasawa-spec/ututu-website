/* eslint-disable @next/next/no-img-element --
   ロゴと画面は枠にぴったり収める必要があるので next/image には載せない。
   **width / height 属性は必ず付けること。** */
/* プロダクト2節（GOOD ORDER / GOOD REVIEW）。2026-10 にサイトの文法へ組み直した。

   以前は各LPの「卓」をそのまま置いていて、サイトの中で浮いていた（本人指摘）。
   いまは**サイトと同じ組み方**（番号つきラベル・欧文の大見出し・罫線の要点）で、
   GOOD SERIES らしさは次の4つで残している：
     - 地の色（ORDER は黄、REVIEW は緑。座標の世界でその節に入ると、地が網点で塗り替わる）
     - 正式ロゴ（白い札の上）と、見出しの2行目の赤ペンの線
     - 映像（LPの冒頭と同じもの）
     - 点の形：ORDER は**本物のQRコード**（公式サイトへ。押すと読める形に整う）、REVIEW は星（押すと数が変わる）

   スマホでは縦に積む（横スライドは操作しにくかった。本人指摘）。映像は横長だけを使う。

   訴求はLPの今の版に合わせる（CLAUDE.md §5）。**店名は出さないこと。** */

import type { ReactNode } from 'react';
import { ExtIcon } from '@/components/site/Header';
import { PRODUCT_URL } from '@/components/site/productLinks';
import { OrderScreen } from './OrderScreen';
import { ProductVideo } from './ProductVideo';
import './products.css';

type PanelAttrs = Record<`data-${string}`, string>;

type Props = {
  slug: 'order' | 'review';
  n: string;
  name: string;
  logo: { src: string; w: number; h: number };
  kind: string;
  sub: string;
  main: string;
  intro: string;
  points: [string, string][];
  proof: ReactNode;
  screen: ReactNode;
  /** 点が組む形（QR / 星） */
  stamp: { shape: 'qr' | 'stars'; mode: 'qr' | 'stars'; e: string; hint: string };
  href: string;
  panel: PanelAttrs;
};

function Product(p: Props) {
  return (
    <section id={p.slug} className={`pn pd pd-${p.slug}`} aria-labelledby={`pd-${p.slug}-h`} {...p.panel}>
      <div className="pd-grid">
        <div className="pd-text">
          <p className="lbl"><b>({p.n})</b><i aria-hidden="true" />GOOD SERIES — {p.kind}</p>
          <p className="pd-logo"><span><img src={p.logo.src} width={p.logo.w} height={p.logo.h} alt={p.name} decoding="async" /></span></p>
          <h3 className="pd-hd" id={`pd-${p.slug}-h`} data-clear>
            <span className="sub">{p.sub}</span>
            <span className="main">{p.main}<Strike /></span>
          </h3>
          <p className="pd-intro" data-clear>{p.intro}</p>
          <ul className="pd-pts" data-clear>
            {p.points.map(([en, t]) => <li key={en}><span>{en}</span><b>{t}</b></li>)}
          </ul>
          <div className="pd-foot" data-clear>
            {p.proof}
            <a className="btn" href={p.href} target="_blank" rel="noopener">公式サイトへ<ExtIcon /></a>
          </div>
        </div>
        <div className="pd-media">
          <div className="pd-film"><ProductVideo slug={p.slug} name={p.name} shape="wide" /></div>
          <div className="pd-phone"><div className="pd-phone-scr">{p.screen}</div></div>
          <div className="pd-dots" data-stamp={p.stamp.shape} data-mode={p.stamp.mode} data-e={p.stamp.e} data-tint="" aria-hidden="true">
            <span>{p.stamp.hint}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function OrderPanel({ panel }: { panel: PanelAttrs }) {
  return (
    <Product
      slug="order" n="05-A" name="GOOD ORDER"
      logo={{ src: '/img/logos/good-order.svg', w: 584.2, h: 56.6 }}
      kind="モバイルオーダー"
      sub="いいデザインは、" main="売上に効く。"
      intro="UIデザインの精度でメニューの取りこぼしを防ぎ、客単価とお客様の満足度を一緒に育てるモバイルオーダーです。"
      points={[
        ['NAVIGATION', 'いまどこにいるか、迷わない。'],
        ['OVERVIEW', '紙のメニューのような、一覧性。'],
        ['RECOMMEND', '“もう一品”が、自然に増える。'],
      ]}
      /* **数字は出さないこと。**LPでも客単価・注文点数は検証中 */
      proof={<p className="pd-proof"><span className="pd-stamp">測定中</span><span>効果は、いま測定しています。</span></p>}
      screen={<OrderScreen />}
      stamp={{ shape: 'qr', mode: 'qr', e: '0,0,0,0', hint: 'TAP — 点が、読めるQRに整います' }}
      href={PRODUCT_URL.order}
      panel={panel}
    />
  );
}

export function ReviewPanel({ panel }: { panel: PanelAttrs }) {
  return (
    <Product
      slug="review" n="05-B" name="GOOD REVIEW"
      logo={{ src: '/img/logos/good-review.svg', w: 631.2, h: 66.7 }}
      kind="クチコミ獲得ツール"
      sub="黙って帰っていた人の、" main="クチコミが増える。"
      intro="卓上の二次元コードから、★だけでも。書くかどうかも、届け先も、お客様が選べるクチコミ獲得ツールです。"
      points={[
        ['★ ONLY', '★だけでも、届けられる。'],
        ['BY TOPIC', '話題ごとに、書ける。'],
        ['YOUR CHOICE', '届け先は、お客様が選ぶ。'],
      ]}
      /* 実証の数字。**店名は出さないこと。期間を明記した過去形で。**盛らないこと */
      proof={<p className="pd-proof pd-proof--n"><small>神戸市内の飲食店 ／ 2026年6〜8月の実証期間</small><span>クチコミ <b>7</b>件 → <b>42</b>件</span></p>}
      screen={<img src="/img/products/review-screen.webp" width={480} height={697} alt="GOOD REVIEW の画面。「この感想を、どうしますか？」の下に「Googleにも投稿する」と「お店にだけ届ける」の2つが並んでいる" loading="lazy" decoding="async" />}
      stamp={{ shape: 'stars', mode: 'stars', e: '5,0,0,0', hint: 'TAP — 星の数が変わります' }}
      href={PRODUCT_URL.review}
      panel={panel}
    />
  );
}

/* 赤ペンの線。各LPの見出しの下にあるものと同じ形 */
function Strike() {
  return (
    <svg className="pd-pen" viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4.1 24.5C5.5 25.8 9.7 25.2 12.4 25.5C15.2 25.8 18 26.3 20.8 26.5C23.6 26.7 26.4 26.7 29.2 26.7C31.9 26.7 34.7 26.5 37.5 26.4C40.3 26.4 43.1 26.3 45.8 26.2C48.6 26.1 51.4 26.1 54.2 26C57 25.9 59.7 25.9 62.5 25.8C65.3 25.7 68.1 25.6 70.9 25.6C73.6 25.5 76.4 25.4 79.2 25.3C82 25.3 84.8 25.2 87.5 25.1C90.3 25.1 93.1 25 95.9 24.9C98.7 24.8 101.4 24.8 104.2 24.7C107 24.6 109.8 24.5 112.6 24.5C115.3 24.4 118.1 24.3 120.9 24.3C123.7 24.2 126.5 24.1 129.2 24C132 24 134.8 23.9 137.6 23.8C140.4 23.7 143.1 23.7 145.9 23.6C148.7 23.5 151.5 23.5 154.3 23.4C157 23.3 159.8 23.2 162.6 23.2C165.4 23.1 168.2 23 170.9 22.9C173.7 22.9 176.5 22.8 179.3 22.7C182.1 22.7 184.8 22.6 187.6 22.5C190.4 22.4 193.2 22.4 196 22.3C198.7 22.2 201.5 22.1 204.3 22.1C207.1 22 209.9 21.9 212.6 21.9C215.4 21.8 218.2 21.7 221 21.6C223.8 21.6 226.5 21.5 229.3 21.4C232.1 21.4 234.9 21.3 237.7 21.2C240.4 21.1 243.2 21.1 246 21C248.8 20.9 251.6 20.8 254.3 20.8C257.1 20.7 259.9 20.6 262.7 20.6C265.5 20.5 268.2 20.4 271 20.3C273.8 20.3 276.6 20.2 279.4 20.1C282.1 20 284.9 20 287.7 19.9C290.5 19.8 293.3 19.8 296 19.7C298.8 19.6 301.6 19.5 304.4 19.5C307.2 19.4 309.9 19.3 312.7 19.2C315.5 19.2 318.3 19.1 321.1 19C323.9 18.9 326.7 18.7 329.5 18.5C332.3 18.2 335.1 17.9 337.9 17.5C340.7 17.1 343.6 16.6 346.3 16C349.1 15.5 351.9 14.8 354.7 14.2C357.5 13.5 360.2 12.8 363 12C365.7 11.3 368.5 10.5 371.2 9.7C374 8.8 376.7 8 379.5 7.2C382.2 6.3 385 5.5 387.7 4.7C390.5 3.8 394.7 2.7 396.1 2.2C397.4 1.8 397.3 1.4 395.9 1.8C394.5 2.1 390.4 3.5 387.6 4.2C384.8 4.9 382 5.5 379.2 6C376.4 6.4 373.5 6.8 370.7 7.2C367.9 7.5 365.1 7.7 362.3 8C359.5 8.2 356.7 8.3 353.9 8.4C351.1 8.5 348.3 8.6 345.6 8.6C342.8 8.6 340 8.6 337.3 8.6C334.5 8.6 331.8 8.6 329.1 8.5C326.3 8.5 323.6 8.4 320.8 8.5C318 8.5 315.3 8.5 312.5 8.6C309.7 8.6 306.9 8.7 304.1 8.8C301.4 8.8 298.6 8.9 295.8 8.9C293 9 290.2 9 287.5 9.1C284.7 9.1 281.9 9.2 279.1 9.2C276.3 9.3 273.5 9.4 270.8 9.4C268 9.5 265.2 9.5 262.4 9.6C259.6 9.6 256.9 9.7 254.1 9.7C251.3 9.8 248.5 9.9 245.7 9.9C243 10 240.2 10 237.4 10.1C234.6 10.1 231.8 10.2 229.1 10.2C226.3 10.3 223.5 10.3 220.7 10.4C217.9 10.5 215.2 10.5 212.4 10.6C209.6 10.6 206.8 10.7 204 10.7C201.3 10.8 198.5 10.8 195.7 10.9C192.9 11 190.1 11 187.4 11.1C184.6 11.1 181.8 11.2 179 11.2C176.2 11.3 173.5 11.3 170.7 11.4C167.9 11.4 165.1 11.5 162.3 11.6C159.6 11.6 156.8 11.7 154 11.7C151.2 11.8 148.4 11.8 145.7 11.9C142.9 11.9 140.1 12 137.3 12.1C134.5 12.1 131.8 12.2 129 12.2C126.2 12.3 123.4 12.3 120.6 12.4C117.8 12.4 115.1 12.5 112.3 12.5C109.5 12.6 106.7 12.7 103.9 12.7C101.2 12.8 98.4 12.8 95.6 12.9C92.8 12.9 90 13 87.3 13C84.5 13.1 81.7 13.2 78.9 13.2C76.1 13.3 73.4 13.3 70.6 13.4C67.8 13.4 65 13.5 62.2 13.5C59.5 13.6 56.7 13.6 53.9 13.7C51.1 13.8 48.3 13.8 45.6 13.9C42.8 13.9 40 14 37.2 14C34.4 14.1 31.7 14.1 28.9 14.2C26.1 14.3 23.3 14.5 20.5 14.8C17.8 15.1 15 15.7 12.2 16.1C9.5 16.6 5.3 16.1 3.9 17.5C2.6 18.9 2.7 23.2 4.1 24.5Z" />
    </svg>
  );
}
