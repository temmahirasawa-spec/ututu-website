'use client';

/* KV（映像区間）。原本 reference/legacy-index.html の <body> 前半をそのまま移したもの。
   動きは heroEngine.ts、数値は heroConfig.ts、CSSは hero.css にあります。

   **連番画像に next/image を使わないこと。** canvas に描くので素の new Image()。
   その処理は heroEngine 側にあります。 */

import { useEffect } from 'react';
import { startHero } from './heroEngine';
import { LoadArt } from './LoadArt';
import { Mark } from './Mark';
import './hero.css';

export function Hero() {
  useEffect(() => startHero(), []);
  useMenu();

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
      <button id="menuBtn" aria-label="メニュー"><span /><span /><span /></button>
      <nav id="menu">
        <ul>
          <li><a href="#after">PRODUCTS<small>プロダクト</small></a></li>
          <li><a href="https://good-order.jp" target="_blank" rel="noopener">GOOD ORDER<small>モバイルオーダー</small></a></li>
          <li><a href="https://good-review.jp" target="_blank" rel="noopener">GOOD REVIEW<small>レビューと満足度</small></a></li>
          <li><a href="#after">CONTACT<small>お問い合わせ</small></a></li>
        </ul>
      </nav>
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
          <p>飲食店をはじめとする店舗のために、お客様のスマホで完結するソフトウェアをつくっています。私たちは自分たちでも店を営んでいて、毎日の営業のなかで使い、要らなかった機能を削り、残ったものだけをかたちにする。現場が忙しいことを知っている人間が、つくっています。</p>
        </div>
        <div className="copy mid"><p className="eyebrow">Welcome</p><div className="rule" />
          <h2>この店が、開発室です。</h2>
          <p className="entitle">BUILT IN A REAL RESTAURANT</p>
          <p>新しい機能は、まずこの店で使います。ピークタイムに耐えられるか、スタッフが覚えずに使えるか、お客様が迷わないか。ここで残らなかったものは、よそのお店にもお渡ししません。</p>
        </div>
        <div className="copy"><p className="eyebrow">Good Order</p><div className="rule" />
          <h2>埋もれる一品を、なくす。</h2>
          <p className="entitle">EVERY DISH GETS ITS TURN</p>
          <p>スマホの縦長画面では、スクロールの下にあるメニューほど見られません。紙のメニューのように全体が見える設計にして、埋もれていた一品に出番をつくりました。席のまま注文でき、オペレーションはいまのままで構いません。</p>
          <a className="linkbtn" href="https://good-order.jp" target="_blank" rel="noopener">公式サイトへ <ArrowOut /></a>
        </div>
        <div className="copy"><p className="eyebrow">Good Review</p><div className="rule" />
          <h2>ほめ言葉は外、苦言は内。</h2>
          <p className="entitle">EVERY VOICE FINDS ITS PLACE</p>
          <p>卓上のQRから、5段階の評価にひとつ答えるだけ。高い評価はAIの下書きでGoogleマップへ。低い評価は店内向けのアンケートに分かれ、公開の場には出ません。</p>
          <a className="linkbtn" href="https://good-review.jp" target="_blank" rel="noopener">公式サイトへ <ArrowOut /></a>
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

/* メニューの開閉。開いている間は body に .menu-open が付く
   （ハンバーガーの変形と、映像区間のスワイプ抑止の解除に使う） */
function useMenu() {
  useEffect(() => {
    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('menu');
    if (!btn || !menu) return;
    const toggle = () => document.body.classList.toggle('menu-open');
    const close = (e: Event) => {
      if ((e.target as HTMLElement).tagName === 'A') document.body.classList.remove('menu-open');
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') document.body.classList.remove('menu-open');
    };
    btn.addEventListener('click', toggle);
    menu.addEventListener('click', close);
    window.addEventListener('keydown', esc);
    return () => {
      btn.removeEventListener('click', toggle);
      menu.removeEventListener('click', close);
      window.removeEventListener('keydown', esc);
      document.body.classList.remove('menu-open');
    };
  }, []);
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
