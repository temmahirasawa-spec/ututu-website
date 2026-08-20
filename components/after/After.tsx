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
      {/* GOOD ORDER
          文言は公式LP（good-order-lp）に合わせてある。見出しはLPのヒーロー、
          図解の3点は LP の SOLUTION 01〜03（NAVIGATION / OVERVIEW / RECOMMEND）、
          締めは WHY IT WORKS の「見つかる → 選ばれる → もう一品」。
          **数字は出さない。**LPでも客単価・注文点数は「測定中」なので、
          ここで先に断定すると食い違う */}
      <div className="af-sec prod">
        <p className="sec-eyebrow rv">Good Order</p>
        <div className="prod-head rv">
          <h3>いいデザインは、売上に効く。</h3>
          <a className="linkbtn onpaper" href="https://good-order.jp" target="_blank" rel="noopener">公式サイトへ <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M12.5 9.5V13H3V3.5h3.5"/><path d="M9.5 2.5H13.5V6.5"/><path d="M13.5 2.5 7.5 8.5"/></svg></a>
        </div>
        <p className="lead rv">小さな画面でも、メニューはぜんぶ届く。スクロールの下に沈んでいた一品に出番をつくり、客単価とお客様の満足度を一緒に育てるモバイルオーダーです。注文は席のまま、オペレーションはいまのままで。</p>
        <div className="fig rv" data-fig>
          <svg className="fig-pc" viewBox="0 0 900 430" role="img" aria-label="GOOD ORDER の注文画面と、3つの設計。カテゴリタブで現在地が分かり、トップで全体を見渡せ、大きな写真のおすすめが「もう一品」を後押しする。見つかる、選ばれる、もう一品へつながる">
            {/* ---- 端末 ---- */}
            <rect className="fg" x="36" y="26" width="200" height="346" rx="22"/>
            <g data-dim="">
              <path className="fg thin" d="M104 44 h64"/>
              <path className="fg thin" d="M100 62 h72"/>
              <path className="fg thin" d="M116 70 h40"/>
              <path className="fg thin" d="M50 82 h172"/>
              <rect className="fg thin" x="58" y="114" width="40" height="18" rx="9"/>
              <rect className="fg thin" x="104" y="114" width="46" height="18" rx="9"/>
              <rect className="fg thin" x="156" y="114" width="46" height="18" rx="9"/>
              <path className="fg thin" d="M58 282 h60"/>
              <path className="fg thin" d="M148 282 h60"/>
              <path className="fg thin" d="M58 348 h60"/>
              <path className="fg thin" d="M148 348 h60"/>
            </g>
            {/* カテゴリタブ。1つ目だけ選択中 */}
            <path className="fg thin" d="M58 96 h30"/>
            <path className="fg thin" d="M100 96 h28"/>
            <path className="fg thin" d="M140 96 h32"/>
            <path className="fg thin" d="M184 96 h26"/>
            <path className="fg acc" d="M58 104 h30"/>
            {/* 大きな写真 */}
            <rect className="fg" x="50" y="142" width="172" height="64" rx="6"/>
            <circle className="fg thin" cx="74" cy="162" r="6"/>
            <path className="fg thin" d="M54 198 L90 172 L112 188 L146 162 L218 196"/>
            {/* 一覧のカード */}
            <rect className="fg thin" x="50" y="232" width="82" height="60" rx="5"/>
            <rect className="fg thin" x="140" y="232" width="82" height="60" rx="5"/>
            <rect className="fg thin" x="50" y="298" width="82" height="60" rx="5"/>
            <rect className="fg thin" x="140" y="298" width="82" height="60" rx="5"/>
            {/* ---- 番号と引き出し線 ---- */}
            <circle className="fg acc thin" cx="236" cy="100" r="10"/>
            <circle className="fg acc thin" cx="236" cy="180" r="10"/>
            <circle className="fg acc thin" cx="236" cy="275" r="10"/>
            <path className="fg thin" d="M250 100 h56"/>
            <path className="fg thin" d="M250 180 h56"/>
            <path className="fg thin" d="M250 275 h56"/>
            <text className="fg-lab acc" x="236" y="104" textAnchor="middle">1</text>
            <text className="fg-lab acc" x="236" y="184" textAnchor="middle">2</text>
            <text className="fg-lab acc" x="236" y="279" textAnchor="middle">3</text>
            {/* ---- 3つの設計 ---- */}
            <text className="fg-lab" x="320" y="92">NAVIGATION</text>
            <text className="fg-lab jp ink" x="320" y="118">いまどこにいるか、迷わない。</text>
            <text className="fg-sm" x="320" y="140">カテゴリタブは、スクロールしても上に残る。</text>
            <text className="fg-lab" x="320" y="172">RECOMMEND</text>
            <text className="fg-lab jp ink" x="320" y="198">「もう一品」が、自然に増える。</text>
            <text className="fg-sm" x="320" y="220">シズル感のある大きな写真を、最前列に。</text>
            <text className="fg-lab" x="320" y="267">OVERVIEW</text>
            <text className="fg-lab jp ink" x="320" y="293">紙のメニューのような、一覧性。</text>
            <text className="fg-sm" x="320" y="315">全カテゴリと人気メニューを、トップで見渡せる。</text>
            {/* ---- 効きかた ---- */}
            <path className="fg thin" d="M320 372 h540"/>
            <text className="fg-lab jp" x="320" y="400">見つかる</text>
            <path className="fg acc thin" d="M388 395 h26 M408 391 l6 4 -6 4"/>
            <text className="fg-lab jp" x="424" y="400">選ばれる</text>
            <path className="fg acc thin" d="M492 395 h26 M512 391 l6 4 -6 4"/>
            <text className="fg-lab jp" x="528" y="400">もう一品</text>
            <text className="fg-sm" x="622" y="400">客単価は、UIで変わる。</text>
          </svg>

          <svg className="fig-sp" viewBox="0 0 480 560" role="img" aria-label="GOOD ORDER の注文画面と、3つの設計。カテゴリタブで現在地が分かり、トップで全体を見渡せ、大きな写真のおすすめが「もう一品」を後押しする">
            <rect className="fg" x="150" y="20" width="180" height="300" rx="20"/>
            <g data-dim="">
              <path className="fg thin" d="M216 36 h48"/>
              <path className="fg thin" d="M204 54 h72"/>
              <path className="fg thin" d="M218 62 h44"/>
              <path className="fg thin" d="M162 74 h156"/>
            </g>
            <path className="fg thin" d="M168 90 h30"/>
            <path className="fg thin" d="M208 90 h28"/>
            <path className="fg thin" d="M246 90 h32"/>
            <path className="fg thin" d="M288 90 h24"/>
            <path className="fg acc" d="M168 98 h30"/>
            <rect className="fg" x="162" y="110" width="156" height="70" rx="6"/>
            <circle className="fg thin" cx="184" cy="130" r="6"/>
            <path className="fg thin" d="M166 174 L196 148 L214 164 L242 140 L314 172"/>
            <rect className="fg thin" x="162" y="192" width="74" height="52" rx="5"/>
            <rect className="fg thin" x="244" y="192" width="74" height="52" rx="5"/>
            <rect className="fg thin" x="162" y="252" width="74" height="52" rx="5"/>
            <rect className="fg thin" x="244" y="252" width="74" height="52" rx="5"/>
            <circle className="fg acc thin" cx="330" cy="94" r="12"/>
            <circle className="fg acc thin" cx="330" cy="145" r="12"/>
            <circle className="fg acc thin" cx="330" cy="270" r="12"/>
            <text className="fg-lab acc" x="330" y="100" textAnchor="middle">1</text>
            <text className="fg-lab acc" x="330" y="151" textAnchor="middle">2</text>
            <text className="fg-lab acc" x="330" y="276" textAnchor="middle">3</text>
            <circle className="fg acc thin" cx="42" cy="374" r="13"/>
            <text className="fg-lab acc" x="42" y="380" textAnchor="middle">1</text>
            <text className="fg-lab" x="72" y="366">NAVIGATION</text>
            <text className="fg-lab jp ink" x="72" y="394">現在地が、わかる。</text>
            <circle className="fg acc thin" cx="42" cy="444" r="13"/>
            <text className="fg-lab acc" x="42" y="450" textAnchor="middle">2</text>
            <text className="fg-lab" x="72" y="436">RECOMMEND</text>
            <text className="fg-lab jp ink" x="72" y="464">もう一品が、増える。</text>
            <circle className="fg acc thin" cx="42" cy="514" r="13"/>
            <text className="fg-lab acc" x="42" y="520" textAnchor="middle">3</text>
            <text className="fg-lab" x="72" y="506">OVERVIEW</text>
            <text className="fg-lab jp ink" x="72" y="534">ぜんぶ、見渡せる。</text>
          </svg>
        </div>
      </div>

      {/* GOOD REVIEW
          文言は公式LP（goodloop-official）に合わせてある。見出しはLPの SOLUTION、
          図解は FEATURE 03「高い評価はGoogleへ、低い評価はお店へ」。
          **★3.5→★4.2 は FROMA の実測値**（LPの REAL STORE RESULT）。
          サンプルではないので、勝手に丸めたり盛ったりしないこと */}
      <div className="af-sec prod">
        <p className="sec-eyebrow rv">Good Review</p>
        <div className="prod-head rv">
          <h3>良い声は表へ、本音はお店へ。</h3>
          <a className="linkbtn onpaper" href="https://good-review.jp" target="_blank" rel="noopener">公式サイトへ <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M12.5 9.5V13H3V3.5h3.5"/><path d="M9.5 2.5H13.5V6.5"/><path d="M13.5 2.5 7.5 8.5"/></svg></a>
        </div>
        <p className="lead rv">クチコミは、書きたくないから書かれないのではなく、書くまでが遠いだけ。卓上の二次元コードを読んで、星をひとつ選ぶ。その1分が、クチコミにも、改善のヒントにもなります。アプリも、ログインも、個人情報もいりません。</p>
        <div className="fig rv" data-fig>
          <svg className="fig-pc" viewBox="0 0 900 430" role="img" aria-label="卓上の二次元コードから約1分の5段階評価へ。星4以上はAIの下書きつきでGoogleマップへ、星3以下はお店の手元へ届く。FROMAでは導入2ヶ月で店舗評価が3.5から4.2になった">
            {/* ---- 端末：1分のアンケート ---- */}
            <rect className="fg" x="36" y="26" width="200" height="346" rx="22"/>
            <path className="fg acc" d="M50 44 h104"/>
            <g data-dim="">
              <path className="fg thin" d="M154 44 h68"/>
              <path className="fg thin" d="M100 66 h72"/>
              <path className="fg thin" d="M116 74 h40"/>
            </g>
            <rect className="fg thin" x="88" y="86" width="96" height="20" rx="10"/>
            <text className="fg-sm" x="136" y="100" textAnchor="middle">約1分</text>
            <text className="fg-lab jp ink" x="136" y="128" textAnchor="middle">今日は、いかがでしたか？</text>
            <rect className="fg thin" x="50" y="142" width="172" height="30" rx="6"/>
            <rect className="fg thin" x="50" y="178" width="172" height="30" rx="6"/>
            <rect className="fg thin" x="50" y="214" width="172" height="30" rx="6"/>
            <rect className="fg thin" x="50" y="250" width="172" height="30" rx="6"/>
            <rect className="fg thin" x="50" y="286" width="172" height="30" rx="6"/>
            <text className="fg-lab acc" x="60" y="162">★★★★★</text>
            <text className="fg-lab acc" x="60" y="198">★★★★☆</text>
            <text className="fg-lab" x="60" y="234">★★★☆☆</text>
            <text className="fg-lab" x="60" y="270">★★☆☆☆</text>
            <text className="fg-lab" x="60" y="306">★☆☆☆☆</text>
            <text className="fg-sm" x="134" y="162">とても満足</text>
            <text className="fg-sm" x="134" y="198">満足</text>
            <text className="fg-sm" x="134" y="234">ふつう</text>
            <text className="fg-sm" x="134" y="270">やや不満</text>
            <text className="fg-sm" x="134" y="306">不満</text>
            {/* ---- 星の数で行き先が分かれる ---- */}
            <path className="fg acc thin" d="M244 142 h12 v66 h-12"/>
            <path className="fg thin" d="M244 214 h12 v102 h-12"/>
            <text className="fg-lab acc" x="264" y="180">★4以上</text>
            <text className="fg-lab" x="264" y="270">★3以下</text>
            <path className="fg acc thin" d="M336 172 C362 172 366 128 390 122 M382 116 l8 6 -6 8"/>
            <path className="fg thin" d="M336 264 C362 264 366 296 390 302 M382 296 l8 6 -6 8"/>
            {/* ---- 行き先1：Googleマップ ---- */}
            <rect className="fg" x="400" y="62" width="252" height="120" rx="8"/>
            <path className="fg acc" d="M428 84 a14 14 0 0 1 14 14 c0 10 -14 24 -14 24 c0 0 -14 -14 -14 -24 a14 14 0 0 1 14 -14 z"/>
            <circle className="fg acc thin" cx="428" cy="98" r="5"/>
            <text className="fg-lab" x="460" y="94">TO GOOGLE MAPS</text>
            <text className="fg-lab jp ink" x="460" y="120">良い声は、そのまま表へ。</text>
            <text className="fg-sm" x="428" y="148">回答が、そのまま下書きになる。</text>
            <text className="fg-sm" x="428" y="166">コピーして、Googleマップに貼るだけ。</text>
            {/* ---- 行き先2：お店の手元 ---- */}
            <rect className="fg" x="400" y="216" width="252" height="120" rx="8"/>
            <rect className="fg thin" x="414" y="240" width="34" height="28" rx="3"/>
            <path className="fg thin" d="M414 249 h34 M420 257 h22 M420 263 h14"/>
            <text className="fg-lab" x="460" y="248">TO THE STORE</text>
            <text className="fg-lab jp ink" x="460" y="274">本音は、お店の手元へ。</text>
            <text className="fg-sm" x="428" y="302">★3以下は、公開の場に出ない。</text>
            <text className="fg-sm" x="428" y="320">入ったら、その場でお店に通知。</text>
            {/* ---- 実測 ---- */}
            <path className="fg thin" d="M672 96 v212"/>
            <text className="fg-lab" x="696" y="140">REAL STORE RESULT</text>
            <text className="fg-sm" x="696" y="162">Googleマップの店舗評価</text>
            <text className="fg-lab" x="696" y="206">★</text>
            <text className="fg-num" x="714" y="212">3.5</text>
            <path className="fg acc thin" d="M716 228 v28 M710 250 l6 6 6 -6"/>
            <text className="fg-lab" x="696" y="288">★</text>
            <text className="fg-num" x="714" y="294">4.2</text>
            <text className="fg-sm" x="696" y="320">FROMA ／ 導入2ヶ月の実測</text>
          </svg>

          <svg className="fig-sp" viewBox="0 0 480 560" role="img" aria-label="約1分の5段階評価から、星4以上はGoogleマップへ、星3以下はお店へ。FROMAでは導入2ヶ月で店舗評価が3.5から4.2になった">
            <rect className="fg" x="150" y="20" width="180" height="286" rx="20"/>
            <path className="fg acc" d="M164 36 h96"/>
            <g data-dim="">
              <path className="fg thin" d="M260 36 h56"/>
            </g>
            <text className="fg-lab jp ink" x="240" y="68" textAnchor="middle">いかがでしたか？</text>
            <rect className="fg thin" x="164" y="82" width="152" height="38" rx="7"/>
            <rect className="fg thin" x="164" y="126" width="152" height="38" rx="7"/>
            <rect className="fg thin" x="164" y="170" width="152" height="38" rx="7"/>
            <rect className="fg thin" x="164" y="214" width="152" height="38" rx="7"/>
            <rect className="fg thin" x="164" y="258" width="152" height="38" rx="7"/>
            <text className="fg-lab acc" x="180" y="107">★★★★★</text>
            <text className="fg-lab acc" x="180" y="151">★★★★☆</text>
            <text className="fg-lab" x="180" y="195">★★★☆☆</text>
            <text className="fg-lab" x="180" y="239">★★☆☆☆</text>
            <text className="fg-lab" x="180" y="283">★☆☆☆☆</text>
            {/* 分岐 */}
            <path className="fg thin" d="M240 306 v16"/>
            <path className="fg acc thin" d="M240 322 H116 v22 M110 338 l6 6 6 -6"/>
            <path className="fg thin" d="M240 322 H364 v22 M358 338 l6 6 6 -6"/>
            <rect className="fg" x="24" y="350" width="200" height="76" rx="8"/>
            <text className="fg-lab acc" x="44" y="382">★4以上</text>
            <text className="fg-lab jp ink" x="44" y="412">Googleマップへ</text>
            <rect className="fg" x="256" y="350" width="200" height="76" rx="8"/>
            <text className="fg-lab" x="276" y="382">★3以下</text>
            <text className="fg-lab jp ink" x="276" y="412">お店の手元へ</text>
            <text className="fg-sm" x="240" y="462" textAnchor="middle">Googleマップの店舗評価</text>
            <text className="fg-num" x="240" y="514" textAnchor="middle">3.5 → 4.2</text>
            <text className="fg-sm" x="240" y="548" textAnchor="middle">FROMA ／ 導入2ヶ月の実測</text>
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
