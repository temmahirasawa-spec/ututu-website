/* eslint-disable @next/next/no-img-element --
   端末の枠にぴったり収める必要があるので next/image には載せない。
   **width / height 属性は必ず付けること。** */
/* プロダクト紹介の2節。
   映像セクションで概要は伝えているので、ここからは
   **それぞれのサービスの世界に切り替えて**見せます。
   配色・丸ボタン・ブロブ・フロートチップは公式LPから採ったもの、
   画面は実物のスクリーンショット（public/img/products/）です。

   紙のトンマナ（#after のトークン）はここには通していません。CSSは products.css。 */

import './products.css';

/* ProductOrder
   ---- GOOD ORDER ----
   映像セクションで概要は伝えているので、ここからは
   **それぞれのサービスの世界に切り替えて**見せる。
   配色・丸ボタン・ブロブ・フロートチップは公式LPから採ったもの。
   画面は実物のスクリーンショット（public/img/products/）。
   文言もLPに合わせてある。詳しくは CLAUDE.md */
export function ProductOrder() {
  return (
    <section className="pv pv-order">
      <div className="pv-in">
        <div className="pv-head">
          <div className="pv-copy rv">
            <p className="pv-eyebrow"><Sparkle />MOBILE ORDER</p>
            <h4>いいデザインは、<br /><em>売上に効く。</em></h4>
            <p className="pv-lead">小さな画面でも、メニューはぜんぶ届く。埋もれていた一品に、出番をつくります。</p>
            <div className="pv-actions">
              <a className="pv-cta" href="https://good-order.jp" target="_blank" rel="noopener">公式サイトへ <ArrowOut /></a>
              <p className="pv-run"><i />神戸のカフェ〈YORKYS BRUNCH〉で実運用テスト中</p>
            </div>
          </div>
          <div className="pv-visual rv">
            <span className="pv-blob" aria-hidden="true" />
            <div className="pv-phones">
              <div className="pv-phone pv-phone--back">
                <img src="/img/products/order-menu.webp" width="517" height="1120" alt="GOOD ORDER のカテゴリ一覧。フードとドリンクのカテゴリが写真つきのカードで並んでいる" loading="lazy" decoding="async" />
              </div>
              <div className="pv-phone pv-phone--front">
                <img src="/img/products/order-top.webp" width="546" height="1120" alt="GOOD ORDER の注文画面。上部にカテゴリタブ、その下に大きな写真つきのメニューカードが並んでいる" loading="lazy" decoding="async" />
              </div>
            </div>
            <span className="pv-chip pv-chip--a"><Check />カートに追加しました</span>
            <span className="pv-chip pv-chip--b"><Bell />本日のおすすめ</span>
          </div>
        </div>

        {/* **ここは概要だけ。**細かい説明はLPに書いてあるので、同じことを
            二度読ませない。お客様にとって何が良くなるかだけを置く */}
        <ul className="pv-feats">
          <li className="pv-feat rv">
            <p className="pv-feat-no"><b>01</b> FIND</p>
            <h5>メニューが、埋もれない。</h5>
          </li>
          <li className="pv-feat rv">
            <p className="pv-feat-no"><b>02</b> CHOOSE</p>
            <h5>迷わず、決められる。</h5>
          </li>
          <li className="pv-feat rv">
            <p className="pv-feat-no"><b>03</b> ONE MORE</p>
            <h5>「もう一品」が、増える。</h5>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ProductReview
   ---- GOOD REVIEW ----
   LP上の名は GOOD LOOP だが、コーポレートでは GOOD REVIEW と呼ぶ（本人判断）。
   **★3.5→★4.2 は FROMA の実測値。**サンプルではないので盛らないこと */
export function ProductReview() {
  return (
    <section className="pv pv-review">
      <div className="pv-in">
        <div className="pv-head">
          <div className="pv-copy rv">
            <p className="pv-eyebrow"><Sparkle />CUSTOMER FEEDBACK</p>
            <h4>良い声は表へ、<br /><em>本音はお店へ。</em></h4>
            <p className="pv-lead">卓上の二次元コードから、1分。その回答が、クチコミにも、改善のヒントにもなります。</p>
            <div className="pv-actions">
              <a className="pv-cta" href="https://good-review.jp" target="_blank" rel="noopener">公式サイトへ <ArrowOut /></a>
              <p className="pv-run"><i />神戸・西宮の2店舗で実運用中</p>
            </div>
          </div>
          <div className="pv-visual rv">
            <span className="pv-blob" aria-hidden="true" />
            <img className="pv-illust" src="/img/products/review-kv.webp" width="1180" height="664" alt="卓上の二次元コードから、お客様がスマホで評価を送っている様子のイラスト" loading="lazy" decoding="async" />
          </div>
        </div>

        <ul className="pv-feats">
          <li className="pv-feat pv-feat--shot rv">
            <div className="pv-shot"><img src="/img/products/review-rate.webp" width="481" height="1040" alt="5段階の評価を選ぶ画面。所要時間は約1分" loading="lazy" decoding="async" /></div>
            <p className="pv-feat-no"><b>01</b> 1 MINUTE</p>
            <h5>声かけは、二次元コードに。</h5>
          </li>
          <li className="pv-feat pv-feat--shot rv">
            <div className="pv-shot"><img src="/img/products/review-draft.webp" width="481" height="1040" alt="お客様の回答から作られたクチコミの下書きが表示されている画面" loading="lazy" decoding="async" /></div>
            <p className="pv-feat-no"><b>02</b> AI DRAFT</p>
            <h5>回答が、そのまま下書きに。</h5>
          </li>
          <li className="pv-feat pv-feat--shot rv">
            <div className="pv-shot"><img src="/img/products/review-list.webp" width="481" height="1040" alt="店舗の管理画面。Googleへ誘導済みの回答と、店舗のみに共有された回答が並んでいる" loading="lazy" decoding="async" /></div>
            <p className="pv-feat-no"><b>03</b> THE FORK</p>
            <h5>良い声はGoogle、本音はお店。</h5>
          </li>
        </ul>

        <div className="pv-proof rv">
          <div className="pv-proof-l">
            <b>REAL STORE RESULT</b>
            <span>FROMA（神戸）／ Googleマップの店舗評価・導入2ヶ月の実測</span>
          </div>
          <p className="pv-rating">
            <span className="from"><i>★</i>3.5</span>
            <svg viewBox="0 0 26 14" aria-hidden="true"><path d="M1 7h22M18 2.5 23.5 7 18 11.5" /></svg>
            <span className="to"><i>★</i>4.2</span>
          </p>
        </div>
      </div>
    </section>
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
/* カートに入った合図。LPのフロートチップと同じ */
function Check() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="#FAC03D" />
      <path d="M4.6 8.2 6.9 10.5 11.4 6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Bell() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="#996B00" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6.6a4 4 0 0 1 8 0c0 3 1 4.2 1 4.2H3s1-1.2 1-4.2Z" />
      <path d="M6.7 13a1.5 1.5 0 0 0 2.6 0" />
    </svg>
  );
}
