/* eslint-disable @next/next/no-img-element --
   端末の枠にぴったり収める必要があるので next/image には載せない。
   **width / height 属性は必ず付けること。** */
/* プロダクト紹介の2節。
   映像セクションで概要は伝えているので、ここからは
   **それぞれのサービスの世界に切り替えて**見せます。
   配色・丸ボタン・ブロブは公式LPから採ったもの、
   画面は実物のスクリーンショット（public/img/products/）です。

   **2節は同じ型で組むこと。**
   色だけが違う同じ形にして、「これはサービスの紹介だ」と一目で分かるようにする。
   型は下の <Product> ひとつに集約してあります。片方だけに飾りを足さないこと。

     ① 見出し（サービス名＋種別 → 紹介文 → 補足 → 公式サイトへ）と、モック
     ② 画面つきのカード3枚

   **ここに載せるのはキャッチコピーではありません。**
   「◯◯なツールです」と直接言い切る紹介文を、タイトルの大きさで置きます。
   コピーは映像区間（KV）の仕事なので、こちらで二度言わないこと。

   **ただし「当たり前のこと」を書かないこと。**
   モバイルオーダーが「席のまま注文できる」のは当然で、それでは紹介になりません。
   下の3枚のカードをひとことでまとめた、そのサービス固有の働きを書きます。

   紙のトンマナ（#after のトークン）はここには通していません。CSSは products.css。 */

import type { ReactNode } from 'react';
import { PRODUCT_URL } from '@/components/site/productLinks';
import './products.css';

type Feat = {
  no: string;
  en: string;
  title: string;
  shot: string;
  w: number;
  h: number;
  alt: string;
  /** 画面の見せたい位置。上端以外を見せたいときだけ「-57%」のように割合で入れる。
      **pxで書かないこと。**PCとスマホで絵の縮尺が違うので、別の場所が出る */
  shotY?: string;
};

type ProductProps = {
  slug: 'order' | 'review';
  /** サービス名と、その種別。ここで「何のサービスか」を先に言い切る */
  name: string;
  kind: string;
  /** 紹介文。キャッチコピーではなく、直接的な一文。
      **読点で改行を入れておくこと。**自動折り返しに任せると
      「つな／げる」のように語の途中で折れる */
  title: ReactNode;
  lead: string;
  href: string;
  visual: ReactNode;
  feats: Feat[];
};

function Product({ slug, name, kind, title, lead, href, visual, feats }: ProductProps) {
  return (
    <section className={`pv pv-${slug}`}>
      <div className="pv-in">
        <div className="pv-head">
          <div className="pv-copy rv">
            <p className="pv-eyebrow"><Sparkle />{name}<i>{kind}</i></p>
            <h4>{title}</h4>
            <p className="pv-lead">{lead}</p>
            <div className="pv-actions">
              <a className="pv-cta" href={href} target="_blank" rel="noopener">公式サイトへ <ArrowOut /></a>
            </div>
          </div>
          <div className="pv-visual rv">
            <span className="pv-blob" aria-hidden="true" />
            {visual}
          </div>
        </div>

        {/* **3枚とも画面つきで、文章は載せない。**
            細かい説明はLPに書いてあるので、同じことを二度読ませない。
            画面と一行だけで、お客様にとって何が良くなるかを示す */}
        <ul className="pv-feats">
          {feats.map((f) => (
            <li className="pv-feat rv" key={f.no}>
              <div className="pv-shot">
                <img src={f.shot} width={f.w} height={f.h} alt={f.alt}
                  style={f.shotY ? { transform: `translateY(${f.shotY})` } : undefined}
                  loading="lazy" decoding="async" />
              </div>
              <div className="pv-feat-body">
                <p className="pv-feat-no"><b>{f.no}</b> {f.en}</p>
                <h5>{f.title}</h5>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---- GOOD ORDER ----
   **03 の画面は 01 と同じ絵の下側（カート付近）を切り出しています。**
   GOOD ORDER のスクリーンショットが2枚しか無いためです。
   3枚目（カート／追加注文）が来たら差し替えること（shotY は不要になる）。 */
export function ProductOrder() {
  return (
    <Product
      slug="order"
      name="GOOD ORDER"
      kind="モバイルオーダー"
      title={<>メニュー全部に、<br />出番をつくるモバイルオーダーです。</>}
      lead="紙のメニューのように全体が見えるので、スクロールの下に沈んでいた一品にも注文が入ります。席のまま注文でき、オペレーションはいまのままで構いません。"
      href={PRODUCT_URL.order}
      visual={
        <div className="pv-phones">
          <div className="pv-phone pv-phone--back">
            <img src="/img/products/order-menu.webp" width="517" height="1120" alt="GOOD ORDER のカテゴリ一覧。フードとドリンクのカテゴリが写真つきのカードで並んでいる" loading="lazy" decoding="async" />
          </div>
          <div className="pv-phone pv-phone--front">
            <img src="/img/products/order-top.webp" width="546" height="1120" alt="GOOD ORDER の注文画面。上部にカテゴリタブ、その下に大きな写真つきのメニューカードが並んでいる" loading="lazy" decoding="async" />
          </div>
        </div>
      }
      feats={[
        { no: '01', en: 'FIND', title: 'メニューが、埋もれない。', shot: '/img/products/order-menu.webp', w: 517, h: 1120, alt: 'フードとドリンクのカテゴリが一覧で並んでいる画面' },
        { no: '02', en: 'CHOOSE', title: '迷わず、決められる。', shot: '/img/products/order-top.webp', w: 546, h: 1120, alt: '写真つきの大きなメニューカードが並んでいる画面' },
        { no: '03', en: 'ONE MORE', title: '「もう一品」が、増える。', shot: '/img/products/order-menu.webp', w: 517, h: 1120, shotY: '-57%', alt: 'カートを見るボタンと、追加の注文につながる導線が並んでいる画面' },
      ]}
    />
  );
}

/* ---- GOOD REVIEW ----
   LP上の名は GOOD LOOP だが、コーポレートでは GOOD REVIEW と呼ぶ（本人判断）。

   **FROMA の実測値（★3.5→★4.2）は、いまこのページに出ていません。**
   実績の帯ごと外したためです（2026-08-24、Figmaでの指示）。
   サンプルではない唯一の数字なので、置き場所が決まったら必ず戻すこと。 */
export function ProductReview() {
  return (
    <Product
      slug="review"
      name="GOOD REVIEW"
      kind="クチコミ・アンケート"
      title={<>集めた声を、<br />行き先まで仕分けるアンケートです。</>}
      lead="卓上の二次元コードから1分。高い評価はAIの下書きでGoogleへ、それ以外は店内向けの声として、公開せずに届きます。"
      href={PRODUCT_URL.review}
      visual={
        <img className="pv-illust" src="/img/products/review-kv.webp" width="1180" height="664" alt="卓上の二次元コードから、お客様がスマホで評価を送っている様子のイラスト" loading="lazy" decoding="async" />
      }
      feats={[
        { no: '01', en: '1 MINUTE', title: '声かけは、二次元コードに。', shot: '/img/products/review-rate.webp', w: 481, h: 1040, alt: '5段階の評価を選ぶ画面。所要時間は約1分' },
        { no: '02', en: 'AI DRAFT', title: '回答が、そのまま下書きに。', shot: '/img/products/review-draft.webp', w: 481, h: 1040, alt: 'お客様の回答から作られたクチコミの下書きが表示されている画面' },
        { no: '03', en: 'THE FORK', title: '良い声はGoogle、本音はお店。', shot: '/img/products/review-list.webp', w: 481, h: 1040, alt: '店舗の管理画面。Googleへ誘導済みの回答と、店舗のみに共有された回答が並んでいる' },
      ]}
    />
  );
}

/* ---- プロダクト2節の小さな絵。LPのあしらいに合わせたもの ---- */
function Sparkle() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 0 9.5 5.4 15 7 9.5 8.6 8 14 6.5 8.6 1 7 6.5 5.4Z" />
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
