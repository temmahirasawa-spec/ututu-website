'use client';

/* KV（映像区間）。原本 reference/legacy-index.html の <body> 前半をそのまま移したもの。
   動きは heroEngine.ts、数値は heroConfig.ts、CSSは hero.css にあります。

   **連番画像に next/image を使わないこと。** canvas に描くので素の new Image()。
   その処理は heroEngine 側にあります。 */

import { useEffect } from 'react';
import { PRODUCT_URL } from '@/components/site/productLinks';
import { SiteNav } from '@/components/site/SiteNav';
import { startHero } from './heroEngine';
import { LoadArt } from './LoadArt';
import { Mark } from './Mark';
import './hero.css';

export function Hero() {
  useEffect(() => startHero(), []);

  return (
    <>
      <div id="stage">
        <canvas id="seq" />
        <div id="scrim" />
        <div id="screenWrap">
          {/* 映像に写っているスマホの画面に、HTMLで書いたUIを透視変換で貼り込む。
              生成AIに画面を描かせると文字が崩れるため、画面は消灯状態で撮り、
              上からHTMLを重ねている。四隅は実測値（heroConfig の holds） */}
          <div className="slot" id="vidOrder">
            <video id="vOrder" muted loop autoPlay playsInline preload="auto" disablePictureInPicture />
            <div className="fallback" id="fbOrder">
              <div className="fb-top"><b>GOOD ORDER</b><span>TABLE 03</span></div>
              <div className="fb-item"><i className="fb-th" /><span>本日のブレンド<em>¥520</em></span></div>
              <div className="fb-item"><i className="fb-th" /><span>キャロットケーキ<em>¥680</em></span></div>
              <div className="fb-item"><i className="fb-th" /><span>アボカドトースト<em>¥1,180</em></span></div>
              <div className="fb-cta">注文を確定する　¥2,380</div>
            </div>
          </div>
          <div className="slot" id="vidReview">
            <video id="vReview" muted loop autoPlay playsInline preload="auto" disablePictureInPicture />
            <div className="fallback" id="fbReview">
              <div className="fb-mark">GOOD REVIEW</div>
              <div className="fb-thumb" />
              <div className="fb-h2">今日の一杯は<br />いかがでしたか？</div>
              <div className="fb-stars">★★★★★</div>
              <div className="fb-cta fb-bottom">Googleに投稿する</div>
            </div>
          </div>
          {/* 貼り物感を消すための2枚。乗算とスクリーン */}
          <div className="slot" id="tint" />
          <div className="slot" id="sheen" />
        </div>
        <div id="white" />
      </div>

      <button id="brand" type="button" aria-label="はじめに戻る">
        <Mark />
      </button>
      <SiteNav variant="top" />
      <div id="scrollHint"><span>SCROLL</span><i /><b /></div>
      <div id="prog" aria-hidden="true"><i /></div>
      {/* ドットの中身は heroEngine の buildChapters が章の数だけ作る */}
      <div id="dots" aria-hidden="true" />
      <div id="navBar">
        <button id="backBtn"><i /><span>BACK</span></button>
        <button id="nextBtn"><span>NEXT</span><i /></button>
      </div>
      <a id="skip" href="#after">SKIP</a>

      <div id="copyLayer">
        <div className="copy mid"><p className="eyebrow">Ututu</p><div className="rule" />
          <h2>店舗に、いい一日を。</h2>
          <p className="entitle">GOOD TOOL, GREAT DAY!</p>
          <p>飲食店をはじめとする店舗のために、お客様のスマホで完結するソフトウェアをつくっています。現場が忙しいことを知っている人間が、使われ方から逆算して、要らない機能を削り、残ったものだけをかたちにしています。</p>
        </div>
        <div className="copy mid"><p className="eyebrow">Welcome</p><div className="rule" />
          <h2>店の一日から、考える。</h2>
          <p className="entitle">DESIGNED FOR THE REAL FLOOR</p>
          <p>ピークタイムに耐えられるか、スタッフが覚えずに使えるか、お客様が迷わないか。私たちは、店の一日を基準に道具をつくっています。</p>
        </div>
        <div className="copy"><p className="eyebrow">Good Order</p><div className="rule" />
          <h2>埋もれる一品を、なくす。</h2>
          <p className="entitle">EVERY DISH GETS ITS TURN</p>
          <p>スマホの縦長画面では、スクロールの下にあるメニューほど見られません。紙のメニューのように全体が見える設計にして、埋もれていた一品に出番をつくりました。席のまま注文でき、オペレーションはいまのままで構いません。</p>
          <a className="linkbtn" href={PRODUCT_URL.order} target="_blank" rel="noopener">公式サイトへ <ArrowOut /></a>
        </div>
        <div className="copy"><p className="eyebrow">Good Review</p><div className="rule" />
          <h2>黙って帰っていた人の、クチコミが増える。</h2>
          <p className="entitle">EVERY VOICE FINDS ITS PLACE</p>
          <p>卓上の二次元コードから、★だけでも。書くかどうかも、届け先も、お客様が選べます。評価によって誘い方を変えることはありません。</p>
          <a className="linkbtn" href={PRODUCT_URL.review} target="_blank" rel="noopener">公式サイトへ <ArrowOut /></a>
        </div>
      </div>

      {/* 映像区間の長さ。1枚 = 画面1つぶんのスクロール。
          ここを増減すると、章と章の間のスクロール量がまとめて変わる。
          **len だけを触っても総量は変わらない。**枚数と併せて調整すること */}
      <div id="track">
        <section className="beat" />
        <section className="beat" />
        <section className="beat" />
        <section className="beat" />
      </div>

      <div id="load">
        <LoadArt />
        <div id="loadMark"><Mark title="UTUTU" /></div>
        <p className="pct"><span id="loadPct">0</span>%</p>
      </div>
    </>
  );
}

/* 外部リンクの矢印 */
function ArrowOut() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M12.5 9.5V13H3V3.5h3.5" />
      <path d="M9.5 2.5H13.5V6.5" />
      <path d="M13.5 2.5 7.5 8.5" />
    </svg>
  );
}
