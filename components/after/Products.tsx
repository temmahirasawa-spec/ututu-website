/* eslint-disable @next/next/no-img-element --
   端末の枠や小物の位置にぴったり収める必要があるので next/image には載せない。
   **width / height 属性は必ず付けること。** */
/* プロダクト2節（GOOD ORDER / GOOD REVIEW）。2026-09-28 に作り直し。

   **2つのLPの新しい世界観（GOOD SERIES）に合わせてある。**
   生成りの地に、色違いの同じ「卓」を2枚並べる。卓の色（黄／緑）とインキ（紺／墨）、
   赤ペンの線、ぼかさない影、ファインダーの角、卓の上の小物は、どれも各LPのもの。
   数値の出どころ … good-order-lp / good-review-website の styles/v2/tokens.css

   **2枚は同じ型で組むこと。**違うのは色と中身だけ。型は下の <Product> ひとつに集約してある。
   片方だけに飾りを足さないこと（小物も同じ位置に同じ数だけ置いている）。

     ① ロゴ＋種別 → 見出し（LPの一行目）
     ② 映像（左）とスマホの画面（右）。**映像は主役にしない。**小さく添える（本人判断）
     ③ 紙の上に、紹介文・要点3つ・実績・公式サイトへ

   **見出しは各LPの一行目、本文は「〜です」と言い切る紹介文。**
   訴求はLPの今の版に合わせること。LPの言い回しが変わったら、ここも追いかける。
   - ORDER  … UIデザインの精度 → 迷わない／一覧性／もう一品。**数字は出さない**（LPでも「測定中」）
   - REVIEW … 評価で誘い方を変えない。★だけでも、話題ごとに、**届け先はお客様が選ぶ**。
              「仕分ける」「良い声はGoogleへ」と読める書き方には戻さないこと（LPの軸と逆になる）。
              「1分」「AIが書く」も、LPでは表に出さなくなった言葉なので使わない

   スマホでは2枚を横スライドにする（縦に積むとコーポレートの紹介としては長すぎる）。
   CSSは products.css。紙のトンマナ（#after のトークン）は通していない。 */

import type { ReactNode } from 'react';
import { PRODUCT_URL } from '@/components/site/productLinks';
import { ProductVideo } from './ProductVideo';
import './products.css';

type Prop = { src: string; w: number; h: number };

type ProductProps = {
  slug: 'order' | 'review';
  /** 画面には出ず、ロゴの alt になる */
  name: string;
  /** 正式ロゴ（横組み）。w / h は SVG の viewBox の寸法をそのまま入れる */
  logo: { src: string; w: number; h: number };
  kind: string;
  /** 見出し。1行目は小さく、2行目は大きく赤ペンの線を引く（LPと同じ組み方） */
  sub: string;
  main: string;
  /** 紹介文。「〜です」と言い切る */
  intro: string;
  /** 要点3つ。英字の札と、一行の見出しだけ。説明はLPに任せる */
  points: [string, string][];
  proof: ReactNode;
  screen: { src: string; w: number; h: number; alt: string };
  /** 卓の上の小物。cup＝右上、card＝右下（画面の手前）、accent＝左上（映像の奥） */
  props: { cup: Prop; card: Prop; accent: Prop };
  href: string;
};

function Product({ slug, name, logo, kind, sub, main, intro, points, proof, screen, props, href }: ProductProps) {
  return (
    <article className={`pv-card pv-${slug} rv`}>
      <span className="pv-fd" aria-hidden="true" />
      {/* ロゴは必ず <img> で読むこと。**SVG をインラインで埋めないこと。**
          Illustrator の書き出しはどちらも .st0〜.st3 というクラス名で色を持っていて、
          同じページに2つ埋めると互いに上書きし合う（ORDER の文字が消え、丸が緑になった） */}
      <p className="pv-eyebrow">
        <span className="pv-sticker"><span className="pv-logo">
          <img src={logo.src} width={logo.w} height={logo.h} alt={name} decoding="async" />
        </span></span>
        <span className="pv-kind">{kind}</span>
      </p>
      <h4 className="pv-hd">
        <span className="sub">{sub}</span>
        <span className="main">{main}<Strike /></span>
      </h4>

      <div className="pv-media">
        <img className="pv-prop pv-prop--accent" src={props.accent.src} width={props.accent.w} height={props.accent.h} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <div className="pv-film">
          <ProductVideo slug={slug} name={name} shape="wide" />
          <ProductVideo slug={slug} name={name} shape="tall" />
        </div>
        <div className="pv-phone">
          <div className="pv-phone-scr">
            <img src={screen.src} width={screen.w} height={screen.h} alt={screen.alt} loading="lazy" decoding="async" />
          </div>
        </div>
        <img className="pv-prop pv-prop--cup" src={props.cup.src} width={props.cup.w} height={props.cup.h} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <img className="pv-prop pv-prop--card" src={props.card.src} width={props.card.w} height={props.card.h} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      </div>

      <div className="pv-paper">
        <p className="pv-intro">{intro}</p>
        <ul className="pv-pts">
          {points.map(([en, t]) => (
            <li key={en}><span className="pv-tag">{en}</span><b>{t}</b></li>
          ))}
        </ul>
        <div className="pv-foot">
          {proof}
          <a className="pv-cta" href={href} target="_blank" rel="noopener">公式サイトへ <ArrowOut /></a>
        </div>
      </div>
    </article>
  );
}

export function Products() {
  return (
    <section className="pv" aria-label="プロダクト">
      <div className="pv-in">
        <div className="pv-head rv">
          <span className="pv-rule" aria-hidden="true" />
          <p className="pv-label">GOOD SERIES</p>
          <h3 className="pv-title"><span>お店の現場をよくする、</span><b>2つのサービス。</b></h3>
        </div>
        <div className="pv-duo">
          <Product
            slug="order"
            name="GOOD ORDER"
            logo={{ src: '/img/logos/good-order.svg', w: 584.2, h: 56.6 }}
            kind="モバイルオーダー"
            sub="いいデザインは、"
            main="売上に効く。"
            intro="UIデザインの精度でメニューの取りこぼしを防ぎ、客単価とお客様の満足度を一緒に育てるモバイルオーダーです。"
            points={[
              ['NAVIGATION', 'いまどこにいるか、迷わない。'],
              ['OVERVIEW', '紙のメニューのような、一覧性。'],
              ['RECOMMEND', '“もう一品”が、自然に増える。'],
            ]}
            /* **数字は出さないこと。**LPでも客単価・注文点数は検証中（ピンクの「測定中」の判子） */
            proof={<p className="pv-proof"><span className="pv-stamp">測定中</span><span>神戸のカフェ〈YORKYS BRUNCH〉で<br />実運用テスト中です。</span></p>}
            screen={{ src: '/img/products/order-screen.webp', w: 520, h: 1128, alt: 'GOOD ORDER の注文画面。上部にカテゴリのタブ、その下に写真の大きなおすすめメニューが並んでいる' }}
            props={{
              cup: { src: '/img/products/props/order-latte.webp', w: 240, h: 240 },
              card: { src: '/img/products/props/order-qr.webp', w: 240, h: 278 },
              accent: { src: '/img/products/props/order-leaf.webp', w: 240, h: 240 },
            }}
            href={PRODUCT_URL.order}
          />
          <Product
            slug="review"
            name="GOOD REVIEW"
            logo={{ src: '/img/logos/good-review.svg', w: 631.2, h: 66.7 }}
            kind="Googleマップのクチコミ獲得ツール"
            sub="黙って帰っていた人の、"
            main="クチコミが増える。"
            intro="卓上の二次元コードから、★だけでも。書くかどうかも、届け先も、お客様が選べるクチコミ獲得ツールです。"
            points={[
              ['★ ONLY', '★だけでも、届けられる。'],
              ['BY TOPIC', '話題ごとに、書ける。'],
              ['YOUR CHOICE', '届け先は、お客様が選ぶ。'],
            ]}
            /* LPの冒頭と同じ実測（FROMA 神戸三宮店・導入後3か月）。盛らないこと。
               ★3.00→★4.29 もLPにはあるが、ここでは件数だけに絞っている */
            proof={<p className="pv-proof pv-proof--rc"><small>FROMA 神戸三宮店 ／ 導入後3か月の実測</small><span>クチコミ <b>7</b>件 → <b>42</b>件</span></p>}
            screen={{ src: '/img/products/review-screen.webp', w: 480, h: 697, alt: 'GOOD REVIEW のアンケートの画面。「この感想を、どうしますか？」の下に「Googleにも投稿する」と「お店にだけ届ける」の2つが並んでいる' }}
            props={{
              cup: { src: '/img/products/props/review-latte.webp', w: 240, h: 240 },
              card: { src: '/img/products/props/review-pop.webp', w: 240, h: 326 },
              accent: { src: '/img/products/props/review-stars.webp', w: 220, h: 167 },
            }}
            href={PRODUCT_URL.review}
          />
        </div>
      </div>
    </section>
  );
}

/* 赤ペンの線。各LPの見出しの下にあるものと同じ形（taperedStroke で描いた塗りの図形）。
   2つのLPで同じ形なので、色だけ var(--red) で変える */
function Strike() {
  return (
    <svg className="pv-pen" viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4.1 24.5C5.5 25.8 9.7 25.2 12.4 25.5C15.2 25.8 18 26.3 20.8 26.5C23.6 26.7 26.4 26.7 29.2 26.7C31.9 26.7 34.7 26.5 37.5 26.4C40.3 26.4 43.1 26.3 45.8 26.2C48.6 26.1 51.4 26.1 54.2 26C57 25.9 59.7 25.9 62.5 25.8C65.3 25.7 68.1 25.6 70.9 25.6C73.6 25.5 76.4 25.4 79.2 25.3C82 25.3 84.8 25.2 87.5 25.1C90.3 25.1 93.1 25 95.9 24.9C98.7 24.8 101.4 24.8 104.2 24.7C107 24.6 109.8 24.5 112.6 24.5C115.3 24.4 118.1 24.3 120.9 24.3C123.7 24.2 126.5 24.1 129.2 24C132 24 134.8 23.9 137.6 23.8C140.4 23.7 143.1 23.7 145.9 23.6C148.7 23.5 151.5 23.5 154.3 23.4C157 23.3 159.8 23.2 162.6 23.2C165.4 23.1 168.2 23 170.9 22.9C173.7 22.9 176.5 22.8 179.3 22.7C182.1 22.7 184.8 22.6 187.6 22.5C190.4 22.4 193.2 22.4 196 22.3C198.7 22.2 201.5 22.1 204.3 22.1C207.1 22 209.9 21.9 212.6 21.9C215.4 21.8 218.2 21.7 221 21.6C223.8 21.6 226.5 21.5 229.3 21.4C232.1 21.4 234.9 21.3 237.7 21.2C240.4 21.1 243.2 21.1 246 21C248.8 20.9 251.6 20.8 254.3 20.8C257.1 20.7 259.9 20.6 262.7 20.6C265.5 20.5 268.2 20.4 271 20.3C273.8 20.3 276.6 20.2 279.4 20.1C282.1 20 284.9 20 287.7 19.9C290.5 19.8 293.3 19.8 296 19.7C298.8 19.6 301.6 19.5 304.4 19.5C307.2 19.4 309.9 19.3 312.7 19.2C315.5 19.2 318.3 19.1 321.1 19C323.9 18.9 326.7 18.7 329.5 18.5C332.3 18.2 335.1 17.9 337.9 17.5C340.7 17.1 343.6 16.6 346.3 16C349.1 15.5 351.9 14.8 354.7 14.2C357.5 13.5 360.2 12.8 363 12C365.7 11.3 368.5 10.5 371.2 9.7C374 8.8 376.7 8 379.5 7.2C382.2 6.3 385 5.5 387.7 4.7C390.5 3.8 394.7 2.7 396.1 2.2C397.4 1.8 397.3 1.4 395.9 1.8C394.5 2.1 390.4 3.5 387.6 4.2C384.8 4.9 382 5.5 379.2 6C376.4 6.4 373.5 6.8 370.7 7.2C367.9 7.5 365.1 7.7 362.3 8C359.5 8.2 356.7 8.3 353.9 8.4C351.1 8.5 348.3 8.6 345.6 8.6C342.8 8.6 340 8.6 337.3 8.6C334.5 8.6 331.8 8.6 329.1 8.5C326.3 8.5 323.6 8.4 320.8 8.5C318 8.5 315.3 8.5 312.5 8.6C309.7 8.6 306.9 8.7 304.1 8.8C301.4 8.8 298.6 8.9 295.8 8.9C293 9 290.2 9 287.5 9.1C284.7 9.1 281.9 9.2 279.1 9.2C276.3 9.3 273.5 9.4 270.8 9.4C268 9.5 265.2 9.5 262.4 9.6C259.6 9.6 256.9 9.7 254.1 9.7C251.3 9.8 248.5 9.9 245.7 9.9C243 10 240.2 10 237.4 10.1C234.6 10.1 231.8 10.2 229.1 10.2C226.3 10.3 223.5 10.3 220.7 10.4C217.9 10.5 215.2 10.5 212.4 10.6C209.6 10.6 206.8 10.7 204 10.7C201.3 10.8 198.5 10.8 195.7 10.9C192.9 11 190.1 11 187.4 11.1C184.6 11.1 181.8 11.2 179 11.2C176.2 11.3 173.5 11.3 170.7 11.4C167.9 11.4 165.1 11.5 162.3 11.6C159.6 11.6 156.8 11.7 154 11.7C151.2 11.8 148.4 11.8 145.7 11.9C142.9 11.9 140.1 12 137.3 12.1C134.5 12.1 131.8 12.2 129 12.2C126.2 12.3 123.4 12.3 120.6 12.4C117.8 12.4 115.1 12.5 112.3 12.5C109.5 12.6 106.7 12.7 103.9 12.7C101.2 12.8 98.4 12.8 95.6 12.9C92.8 12.9 90 13 87.3 13C84.5 13.1 81.7 13.2 78.9 13.2C76.1 13.3 73.4 13.3 70.6 13.4C67.8 13.4 65 13.5 62.2 13.5C59.5 13.6 56.7 13.6 53.9 13.7C51.1 13.8 48.3 13.8 45.6 13.9C42.8 13.9 40 14 37.2 14C34.4 14.1 31.7 14.1 28.9 14.2C26.1 14.3 23.3 14.5 20.5 14.8C17.8 15.1 15 15.7 12.2 16.1C9.5 16.6 5.3 16.1 3.9 17.5C2.6 18.9 2.7 23.2 4.1 24.5Z" />
    </svg>
  );
}

function ArrowOut() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M12.5 9.5V13H3V3.5h3.5" />
      <path d="M9.5 2.5H13.5V6.5" />
      <path d="M13.5 2.5 7.5 8.5" />
    </svg>
  );
}
