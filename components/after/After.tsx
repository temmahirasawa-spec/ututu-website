'use client';

/* 映像を抜けたあとの紙のセクション。
   原本 reference/legacy-index.html の <section id="after"> をそのまま移したもの。

   世界観：紙 ／ 墨 ／ アクセントはオリーブ1点。
   モーションの語彙は「線が引かれる」「静かに現れる」の2つだけ。増やさないこと。
   色は必ず #after のトークン（--pg --tx --mut --acc --ln --bd）経由で。
   個々の要素に直接色を書くと、墨への反転から取り残される。

   **図解のSVGはサンプル**です。イラレ版（PC 900×430 / SP 480×560）に
   差し替える前提で、線引きのアニメーションは自動で掛かります。
   規則は CLAUDE.md の「図解の差し替え」を参照。 */

import { useEffect } from 'react';
import { startAfter } from './afterEffects';
import { BioModal } from './BioModal';

export function After() {
  useEffect(() => startAfter(), []);

  return (
    <>
      <section id="after"><div className="wrap">
      {/* A 受け：映像の余韻を引き取り、紙の世界に切り替える */}
      <div className="af-sec">
        <p className="sec-eyebrow rv">Ututu</p>
        <h3 className="rv">店の中から、つくっています。</h3>
        <p className="lead rv">私たちは、店をつくる会社であり、店のための道具をつくる会社です。ふたつは別の仕事ではありません。自分たちの店で毎日使うために道具をつくり、その道具が、また店を強くしています。</p>
      </div>

      {/* B 私たちがつくった店：当事者性の証拠。業態の表記は要確認 */}
      <div className="af-sec">
        <p className="sec-eyebrow rv">Our Stores</p>
        <h3 className="rv">私たちがつくった店。</h3>
        <p className="lead rv">企画から内装、メニュー、日々の運営まで。ここに並ぶのは、私たちが立ち上げて、いまも動かしている店。写真には、いま仕込んでいる次の店も混ざっています。</p>
        {/* eslint-disable @next/next/no-img-element --
        帯は「高さ固定・幅auto」で流すので next/image には載せない。
        **width / height 属性は必ず付けること。** 無いと読み込み前は幅0になり、
        行ごと潰れて何も見えず、読み込んだ瞬間に突然現れる（モバイルで実際に起きた）。
        速さは afterEffects の bandSpeed() が画素/秒で決め直す */}
    <div className="band rv">
          <div className="band-row"><div className="set"><img src="/img/brands/brunch-hero.webp" width="818" height="480" alt="YORKYS BRUNCH の店内" loading="lazy" decoding="async" /><img src="/img/brands/froma-signage.webp" width="480" height="480" alt="FROMA のサイン" loading="lazy" decoding="async" /><img src="/img/brands/creperie-store.webp" width="818" height="480" alt="YORKYS CREPERIE の店舗" loading="lazy" decoding="async" /><img src="/img/brands/bake-interior.webp" width="480" height="480" alt="PIECE OF BAKE の内装" loading="lazy" decoding="async" /><img src="/img/brands/mc-02.webp" width="480" height="480" alt="準備中の店のブランディング" loading="lazy" decoding="async" /><img src="/img/brands/froma-interior.webp" width="480" height="480" alt="FROMA の内装" loading="lazy" decoding="async" /><img src="/img/brands/brunch-cup.webp" width="480" height="480" alt="YORKYS BRUNCH のカップ" loading="lazy" decoding="async" /></div><div className="set" aria-hidden="true"><img src="/img/brands/brunch-hero.webp" width="818" height="480" alt="" loading="lazy" decoding="async" /><img src="/img/brands/froma-signage.webp" width="480" height="480" alt="" loading="lazy" decoding="async" /><img src="/img/brands/creperie-store.webp" width="818" height="480" alt="" loading="lazy" decoding="async" /><img src="/img/brands/bake-interior.webp" width="480" height="480" alt="" loading="lazy" decoding="async" /><img src="/img/brands/mc-02.webp" width="480" height="480" alt="" loading="lazy" decoding="async" /><img src="/img/brands/froma-interior.webp" width="480" height="480" alt="" loading="lazy" decoding="async" /><img src="/img/brands/brunch-cup.webp" width="480" height="480" alt="" loading="lazy" decoding="async" /></div></div>
          <div className="band-row rev"><div className="set"><img src="/img/brands/creperie-products.webp" width="480" height="480" alt="YORKYS CREPERIE のクレープ" loading="lazy" decoding="async" /><img src="/img/brands/bake-glass.webp" width="480" height="480" alt="PIECE OF BAKE のガラス面" loading="lazy" decoding="async" /><img src="/img/brands/froma-kitchen.webp" width="818" height="480" alt="FROMA のキッチン" loading="lazy" decoding="async" /><img src="/img/brands/mc-04.webp" width="861" height="480" alt="準備中の店のブランディング" loading="lazy" decoding="async" /><img src="/img/brands/brunch-exterior.webp" width="480" height="480" alt="YORKYS BRUNCH の外観" loading="lazy" decoding="async" /><img src="/img/brands/creperie-counter.webp" width="975" height="480" alt="YORKYS CREPERIE のカウンター" loading="lazy" decoding="async" /><img src="/img/brands/bake-donuts.webp" width="480" height="480" alt="PIECE OF BAKE のドーナツ" loading="lazy" decoding="async" /></div><div className="set" aria-hidden="true"><img src="/img/brands/creperie-products.webp" width="480" height="480" alt="" loading="lazy" decoding="async" /><img src="/img/brands/bake-glass.webp" width="480" height="480" alt="" loading="lazy" decoding="async" /><img src="/img/brands/froma-kitchen.webp" width="818" height="480" alt="" loading="lazy" decoding="async" /><img src="/img/brands/mc-04.webp" width="861" height="480" alt="" loading="lazy" decoding="async" /><img src="/img/brands/brunch-exterior.webp" width="480" height="480" alt="" loading="lazy" decoding="async" /><img src="/img/brands/creperie-counter.webp" width="975" height="480" alt="" loading="lazy" decoding="async" /><img src="/img/brands/bake-donuts.webp" width="480" height="480" alt="" loading="lazy" decoding="async" /></div></div>
        </div>
        <ul className="stores">
          <li className="rv"><p className="nm">YORKYS BRUNCH</p><p className="tp">ブランチレストラン</p></li>
          <li className="rv"><p className="nm">YORKYS CREPERIE</p><p className="tp">クレープリー</p></li>
          <li className="rv"><p className="nm">FROMA</p><p className="tp">チーズブランド</p></li>
          <li className="rv"><p className="nm">PIECE OF BAKE</p><p className="tp">ドーナツブランド</p></li>
          <li className="rv soon"><p className="nm">AND NEXT</p><p className="tp">準備中の店がひとつ</p></li>
        </ul>
      </div>

      {/* 橋：店から道具へ */}
      <div className="af-sec af-bridge af-stmt" data-ink>
        <h3 className="rv">既製品は、現場に合いませんでした。</h3>
        <p className="lead rv">だから自分たちでつくり、自分たちの店で毎日使っています。ピークタイムに耐えられなかった機能は、直すか、捨てる。ここから先に並ぶのは、その繰り返しを生き残ったものだけです。</p>
        {/* 数字はすべてサンプル。実測値が来たら差し替える */}
        <div className="stats rv">
          <div className="stat"><b className="stat-n">4</b><span className="stat-l">直営ブランド</span></div>
          <div className="stat"><b className="stat-n">3</b><span className="stat-l">導入店舗</span></div>
          <div className="stat"><b className="stat-n">3.9<i>倍</i></b><span className="stat-l">月のクチコミ件数</span></div>
          <div className="stat"><b className="stat-n">+18<i>%</i></b><span className="stat-l">注文点数</span></div>
        </div>
      </div>

      {/* GOOD ORDER */}
      <div className="af-sec prod">
        <p className="sec-eyebrow rv">Good Order</p>
        <div className="prod-head rv">
          <h3>埋もれる一品を、なくす。</h3>
          <a className="linkbtn onpaper" href="https://good-order.jp" target="_blank" rel="noopener">公式サイトへ <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M12.5 9.5V13H3V3.5h3.5"/><path d="M9.5 2.5H13.5V6.5"/><path d="M13.5 2.5 7.5 8.5"/></svg></a>
        </div>
        <p className="lead rv">スマホの縦長画面では、下にあるメニューほど見られません。紙のメニューのように全体が見える設計で、埋もれていた一品に出番をつくる。注文は席のまま、オペレーションはいまのままで。</p>
        <div className="fig rv" data-fig>
          <svg className="fig-pc" viewBox="0 0 900 430" role="img" aria-label="よくあるモバイルオーダーとGOOD ORDERの比較。従来は画面の下半分がほとんど見られないが、GOOD ORDERは全体が見える">
            <rect className="fg" x="150" y="26" width="200" height="330" rx="16"/>
            <path className="fg thin" d="M232 40 h36"/>
            <rect className="fg thin" x="168" y="56" width="42" height="32" rx="3"/>
            <path className="fg thin" d="M224 65 h96"/>
            <path className="fg thin" d="M224 77 h60"/>
            <text className="fg-sm" x="336" y="84" textAnchor="end">¥520</text>
            <rect className="fg thin" x="168" y="106" width="42" height="32" rx="3"/>
            <path className="fg thin" d="M224 115 h96"/>
            <path className="fg thin" d="M224 127 h60"/>
            <text className="fg-sm" x="336" y="134" textAnchor="end">¥680</text>
            <rect className="fg thin" x="168" y="156" width="42" height="32" rx="3"/>
            <path className="fg thin" d="M224 165 h96"/>
            <path className="fg thin" d="M224 177 h60"/>
            <text className="fg-sm" x="336" y="184" textAnchor="end">¥1,180</text>
            <path className="fg acc thin" d="M150.0 212 h10.5"/>
            <path className="fg acc thin" d="M171.1 212 h10.5"/>
            <path className="fg acc thin" d="M192.1 212 h10.5"/>
            <path className="fg acc thin" d="M213.2 212 h10.5"/>
            <path className="fg acc thin" d="M234.2 212 h10.5"/>
            <path className="fg acc thin" d="M255.3 212 h10.5"/>
            <path className="fg acc thin" d="M276.3 212 h10.5"/>
            <path className="fg acc thin" d="M297.4 212 h10.5"/>
            <path className="fg acc thin" d="M318.4 212 h10.5"/>
            <path className="fg acc thin" d="M339.5 212 h10.5"/>
            <g data-dim>
            <rect className="fg thin" x="168" y="226" width="42" height="30" rx="3"/>
            <path className="fg thin" d="M224 235 h96"/>
            <path className="fg thin" d="M224 247 h60"/>
            <rect className="fg thin" x="168" y="274" width="42" height="30" rx="3"/>
            <path className="fg thin" d="M224 283 h96"/>
            <path className="fg thin" d="M224 295 h60"/>
            <rect className="fg thin" x="168" y="322" width="42" height="30" rx="3"/>
            <path className="fg thin" d="M224 331 h96"/>
            <path className="fg thin" d="M224 343 h60"/>
            </g>
            <g transform="translate(150,387) scale(0.95)"><path className="fg" d="M0 0 C8 -9.5 26 -9.5 34 0 C26 9.5 8 9.5 0 0 Z"/><circle className="fg thin" cx="17" cy="0" r="4.5"/><path className="fg" d="M3 9 L31 -9"/></g>
            <text className="fg-lab jp" x="196" y="392">よくあるモバイルオーダー</text>
            <text className="fg-lab jp acc" x="196" y="416">ここから下は、ほとんど見られない</text>
            <path className="fg acc" d="M392 176 H506 M506 176 l-11 -7 M506 176 l-11 7"/>
            <path className="fg acc thin" d="M478 214 l4 11 M450 208 v12 M422 214 l-4 11"/>
            <text className="fg-num" x="450" y="262" textAnchor="middle">+18%</text>
            <text className="fg-lab" x="450" y="290" textAnchor="middle">ITEMS PER ORDER</text>
            <text className="fg-lab jp" x="450" y="312" textAnchor="middle">注文点数の変化（自社店舗）</text>
            <rect className="fg" x="550" y="26" width="200" height="330" rx="16"/>
            <path className="fg thin" d="M632 40 h36"/>
            <path className="fg acc" d="M566 56 h34 M612 56 h26 M650 56 h30 M692 56 h22"/>
            <path className="fg acc thin" d="M566 64 h34"/>
            <rect className="fg thin" x="566" y="80" width="38" height="26" rx="3"/>
            <path className="fg thin" d="M618 89 h96"/>
            <path className="fg thin" d="M618 101 h58"/>
            <text className="fg-sm" x="736" y="102" textAnchor="end">¥520</text>
            <rect className="fg thin" x="566" y="124" width="38" height="26" rx="3"/>
            <path className="fg thin" d="M618 133 h96"/>
            <path className="fg thin" d="M618 145 h58"/>
            <text className="fg-sm" x="736" y="146" textAnchor="end">¥680</text>
            <rect className="fg thin" x="566" y="168" width="38" height="26" rx="3"/>
            <path className="fg thin" d="M618 177 h96"/>
            <path className="fg thin" d="M618 189 h58"/>
            <text className="fg-sm" x="736" y="190" textAnchor="end">¥1,180</text>
            <rect className="fg thin" x="566" y="212" width="38" height="26" rx="3"/>
            <path className="fg thin" d="M618 221 h96"/>
            <path className="fg thin" d="M618 233 h58"/>
            <text className="fg-sm" x="736" y="234" textAnchor="end">¥760</text>
            <rect className="fg thin" x="566" y="256" width="38" height="26" rx="3"/>
            <path className="fg thin" d="M618 265 h96"/>
            <path className="fg thin" d="M618 277 h58"/>
            <text className="fg-sm" x="736" y="278" textAnchor="end">¥940</text>
            <rect className="fg thin" x="566" y="300" width="38" height="26" rx="3"/>
            <path className="fg thin" d="M618 309 h96"/>
            <path className="fg thin" d="M618 321 h58"/>
            <text className="fg-sm" x="736" y="322" textAnchor="end">¥430</text>
            <g transform="translate(550,387) scale(0.95)"><path className="fg acc" d="M0 0 C8 -9.5 26 -9.5 34 0 C26 9.5 8 9.5 0 0 Z"/><circle className="fg acc thin" cx="17" cy="0" r="4.5"/></g>
            <text className="fg-lab" x="596" y="392">GOOD ORDER</text>
            <text className="fg-lab jp" x="596" y="416">全体が見えて、全部に出番がある</text>
            </svg>
          <svg className="fig-sp" viewBox="0 0 480 560" role="img" aria-label="よくあるモバイルオーダーとGOOD ORDERの比較">
            <g transform="translate(28,36) scale(0.85)"><path className="fg" d="M0 0 C8 -9.5 26 -9.5 34 0 C26 9.5 8 9.5 0 0 Z"/><circle className="fg thin" cx="17" cy="0" r="4.5"/><path className="fg" d="M3 9 L31 -9"/></g>
            <text className="fg-lab jp" x="66" y="42">よくあるオーダー</text>
            <g transform="translate(262,36) scale(0.85)"><path className="fg acc" d="M0 0 C8 -9.5 26 -9.5 34 0 C26 9.5 8 9.5 0 0 Z"/><circle className="fg acc thin" cx="17" cy="0" r="4.5"/></g>
            <text className="fg-lab" x="300" y="42">GOOD ORDER</text>
            <rect className="fg" x="28" y="64" width="188" height="300" rx="14"/>
            <rect className="fg thin" x="46" y="88" width="40" height="28" rx="3"/>
            <path className="fg thin" d="M100 97 h78"/>
            <path className="fg thin" d="M100 109 h48"/>
            <rect className="fg thin" x="46" y="136" width="40" height="28" rx="3"/>
            <path className="fg thin" d="M100 145 h78"/>
            <path className="fg thin" d="M100 157 h48"/>
            <rect className="fg thin" x="46" y="184" width="40" height="28" rx="3"/>
            <path className="fg thin" d="M100 193 h78"/>
            <path className="fg thin" d="M100 205 h48"/>
            <path className="fg acc thin" d="M28.0 236 h12.5"/>
            <path className="fg acc thin" d="M53.1 236 h12.5"/>
            <path className="fg acc thin" d="M78.1 236 h12.5"/>
            <path className="fg acc thin" d="M103.2 236 h12.5"/>
            <path className="fg acc thin" d="M128.3 236 h12.5"/>
            <path className="fg acc thin" d="M153.3 236 h12.5"/>
            <path className="fg acc thin" d="M178.4 236 h12.5"/>
            <path className="fg acc thin" d="M203.5 236 h12.5"/>
            <g data-dim>
            <rect className="fg thin" x="46" y="250" width="40" height="26" rx="3"/>
            <path className="fg thin" d="M100 259 h78"/>
            <path className="fg thin" d="M100 271 h48"/>
            <rect className="fg thin" x="46" y="298" width="40" height="26" rx="3"/>
            <path className="fg thin" d="M100 307 h78"/>
            <path className="fg thin" d="M100 319 h48"/>
            </g>
            <text className="fg-lab jp acc" x="28" y="394">下半分は見られない</text>
            <rect className="fg" x="262" y="64" width="188" height="300" rx="14"/>
            <path className="fg acc" d="M278 88 h30 M320 88 h22 M352 88 h26"/>
            <path className="fg acc thin" d="M278 96 h30"/>
            <rect className="fg thin" x="278" y="110" width="34" height="24" rx="3"/>
            <path className="fg thin" d="M326 119 h84"/>
            <path className="fg thin" d="M326 131 h50"/>
            <rect className="fg thin" x="278" y="154" width="34" height="24" rx="3"/>
            <path className="fg thin" d="M326 163 h84"/>
            <path className="fg thin" d="M326 175 h50"/>
            <rect className="fg thin" x="278" y="198" width="34" height="24" rx="3"/>
            <path className="fg thin" d="M326 207 h84"/>
            <path className="fg thin" d="M326 219 h50"/>
            <rect className="fg thin" x="278" y="242" width="34" height="24" rx="3"/>
            <path className="fg thin" d="M326 251 h84"/>
            <path className="fg thin" d="M326 263 h50"/>
            <rect className="fg thin" x="278" y="286" width="34" height="24" rx="3"/>
            <path className="fg thin" d="M326 295 h84"/>
            <path className="fg thin" d="M326 307 h50"/>
            <rect className="fg thin" x="278" y="330" width="34" height="24" rx="3"/>
            <path className="fg thin" d="M326 339 h84"/>
            <path className="fg thin" d="M326 351 h50"/>
            <path className="fg acc thin" d="M266 452 l4 11 M240 446 v12 M214 452 l-4 11"/>
            <text className="fg-num" x="240" y="496" textAnchor="middle">+18%</text>
            <text className="fg-lab" x="240" y="524" textAnchor="middle">ITEMS PER ORDER</text>
            <text className="fg-lab jp" x="240" y="550" textAnchor="middle">注文点数の変化（自社店舗）</text>
            </svg>
        </div>
      </div>

      {/* GOOD REVIEW */}
      <div className="af-sec prod">
        <p className="sec-eyebrow rv">Good Review</p>
        <div className="prod-head rv">
          <h3>ほめ言葉は外、苦言は内。</h3>
          <a className="linkbtn onpaper" href="https://good-review.jp" target="_blank" rel="noopener">公式サイトへ <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M12.5 9.5V13H3V3.5h3.5"/><path d="M9.5 2.5H13.5V6.5"/><path d="M13.5 2.5 7.5 8.5"/></svg></a>
        </div>
        <p className="lead rv">卓上のQRから、5段階の評価にひとつ。高い評価はAIが下書きしたクチコミとともにGoogleマップへ。低い評価は店内向けのアンケートに分かれ、公開の場には出ません。</p>
        <div className="fig rv" data-fig>
          <svg className="fig-pc" viewBox="0 0 900 430" role="img" aria-label="卓上のQRから5段階評価へ。星4〜5はGoogleマップへ、星1〜3は店内アンケートへ分かれる">
            <rect className="fg" x="64" y="176" width="46" height="46" rx="5"/>
            <rect className="fg thin" x="72" y="184" width="11" height="11" rx="1"/>
            <rect className="fg thin" x="72" y="203" width="11" height="11" rx="1"/>
            <rect className="fg thin" x="92" y="184" width="11" height="11" rx="1"/>
            <text className="fg-lab jp" x="64" y="252">卓上のQR</text>
            <path className="fg" d="M118 199 H340"/>
            <circle className="fg" cx="344" cy="199" r="4"/>
            <path className="fg acc" d="M348 197 C424 190 436 96 520 96 H660"/>
            <path className="fg" d="M348 201 C424 208 436 302 520 302 H660"/>
            <text className="fg-lab acc" x="520" y="74">HIGH ★4–5</text>
            <text className="fg-lab jp" x="520" y="132">AIが下書きしたクチコミと、Googleマップへ</text>
            <text className="fg-lab" x="520" y="280">LOW ★1–3</text>
            <text className="fg-lab jp" x="520" y="336">店内向けのアンケートへ</text>
            <path className="fg acc" d="M712 70 a20 20 0 0 1 20 20 c0 15 -20 34 -20 34 c0 0 -20 -19 -20 -34 a20 20 0 0 1 20 -20 z"/>
            <circle className="fg acc thin" cx="712" cy="90" r="7"/>
            <path className="fg" d="M694 322 v-22 l18 -15 l18 15 v22 z M706 322 v-14 h12 v14"/>
            <text className="fg-num" x="64" y="396">12 → 47</text>
            <text className="fg-lab" x="64" y="420">GOOGLE REVIEWS / MONTH</text>
            <text className="fg-lab jp ink" x="520" y="414">低い評価は、公開の場に出ない。</text>
          </svg>
          <svg className="fig-sp" viewBox="0 0 480 560" role="img" aria-label="卓上のQRから5段階評価へ。星4〜5はGoogleへ、星1〜3は店内アンケートへ">
            <rect className="fg" x="217" y="30" width="46" height="46" rx="5"/>
            <rect className="fg thin" x="225" y="38" width="11" height="11" rx="1"/>
            <rect className="fg thin" x="225" y="57" width="11" height="11" rx="1"/>
            <rect className="fg thin" x="245" y="38" width="11" height="11" rx="1"/>
            <text className="fg-lab jp" x="240" y="102" textAnchor="middle">卓上のQR</text>
            <path className="fg" d="M240 118 V166"/>
            <circle className="fg" cx="240" cy="172" r="4"/>
            <path className="fg acc" d="M238 174 C220 220 120 226 120 290 V340"/>
            <path className="fg" d="M242 174 C260 220 360 226 360 290 V340"/>
            <text className="fg-lab acc" x="120" y="252" textAnchor="middle">★4–5</text>
            <text className="fg-lab" x="360" y="252" textAnchor="middle">★1–3</text>
            <path className="fg acc" d="M120 356 a18 18 0 0 1 18 18 c0 13 -18 30 -18 30 c0 0 -18 -17 -18 -30 a18 18 0 0 1 18 -18 z"/>
            <circle className="fg acc thin" cx="120" cy="374" r="6"/>
            <path className="fg" d="M342 402 v-20 l18 -15 l18 15 v20 z M354 402 v-13 h12 v13"/>
            <text className="fg-lab jp" x="120" y="440" textAnchor="middle">Googleマップへ</text>
            <text className="fg-lab jp" x="360" y="440" textAnchor="middle">店の中へ</text>
            <text className="fg-lab jp ink" x="360" y="466" textAnchor="middle">公開の場に出ない</text>
            <text className="fg-num" x="240" y="520" textAnchor="middle">12 → 47</text>
            <text className="fg-lab" x="240" y="548" textAnchor="middle">GOOGLE REVIEWS / MONTH</text>
          </svg>
        </div>
      </div>

      {/* 二人。丸（.fd-ph）は後日ローポリ3Dの canvas に差し替える受け皿 */}
      <div className="af-sec" data-ink id="founders">
        <p className="sec-eyebrow rv">Founders</p>
        <h3 className="rv">店側と、デザイン側から。</h3>
        <div className="fd-grid">
          <div className="fd rv">
            <div className="fd-ph ava" data-head="yosuke" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="23" r="10"/><path d="M13 55 a19 19 0 0 1 38 0"/></svg></div>
            <p className="fd-role">共同創業者 / ビジネスプロデューサー</p>
            <p className="fd-name">板倉 洋輔</p>
            <p className="fd-en">Yosuke Itakura</p>
            <p className="fd-ex">「YORKYS BRUNCH」から複数ブランドを立ち上げ、関西・関東へ。2026年、3ブランドの全国フランチャイズ展開を開始。</p>
            <button className="profile-btn" type="button" data-bio="yosuke">Profile　＋</button>
          </div>
          <div className="fd rv">
            <div className="fd-ph ava" data-head="temma" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="23" r="10"/><path d="M13 55 a19 19 0 0 1 38 0"/></svg></div>
            <p className="fd-role">共同創業者 / クリエイティブディレクター</p>
            <p className="fd-name">平澤 天真</p>
            <p className="fd-en">Temma Hirasawa</p>
            <p className="fd-ex">2,000万会員規模のUI/UXからAdobe公式TikTokまで。「GOODシリーズ」の設計と開発を統括。</p>
            <button className="profile-btn" type="button" data-bio="temma">Profile　＋</button>
          </div>
        </div>
      </div>

      {/* 締め */}
      <div className="af-sec af-stmt" data-ink id="next">
        <p className="sec-eyebrow rv">And Next</p>
        <h3 className="rv">検証は、今日も営業中。</h3>
        <p className="lead rv">私たちの店は、これからも実験台です。使いながら直し、直しては削る。プロダクトの改善も、次の道具の仕込みも、すべてはこの店の一日から始まります。</p>
        <p className="next-line rv"><i></i>Next product — Reservation System and more</p>
      </div>

      <div id="foot" className="rv">
        <span>© UTUTU Inc.</span>
        <span className="pages"><span className="soon">会社概要（準備中）</span><span className="soon">お問い合わせ（準備中）</span></span>
      </div>
      </div></section>
      <BioModal />
    </>
  );
}
