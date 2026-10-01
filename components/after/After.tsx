'use client';

/* eslint-disable @next/next/no-img-element --
   この節の画像は next/image に載せない。
   ・写真の帯は「高さ固定・幅auto」で流すので、next/image の枠に合わない
   ・プロダクトの画面は端末の枠にぴったり収める必要がある
   **どの img にも width / height 属性を必ず付けること。** 無いと読み込み前に
   幅が0になり、行ごと潰れて何も見えず、読み込んだ瞬間に突然現れる
   （モバイルで実際に起きた） */

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
import { Products } from './Products';

export function After() {
  useEffect(() => startAfter(), []);

  return (
    <>
      <section id="after"><div className="wrap">
      {/* A 受け：映像の余韻を引き取り、紙の世界に切り替える */}
      <div className="af-sec">
        <p className="sec-eyebrow rv">Ututu</p>
        <h3 className="rv">店の一日から、つくっています。</h3>
        <p className="lead rv">私たちは、店のための道具をつくる会社です。ピークタイムの慌ただしさも、スタッフが覚えられる量も、お客様が迷う場所も知っている。その手ざわりから逆算して、要るものだけをかたちにしています。</p>
      </div>

      {/* 橋：現場から道具へ */}
      <div className="af-sec af-bridge af-stmt" data-ink>
        <h3 className="rv">既製品は、現場に合いませんでした。</h3>
        <p className="lead rv">だから、自分たちでつくることにしました。ピークタイムに耐えられない機能は、直すか、捨てる。ここから先に並ぶのは、その繰り返しを生き残ったものだけです。</p>
      </div>
      <Products />

      {/* 二人。丸（.fd-ph）は後日ローポリ3Dの canvas に差し替える受け皿 */}
      <div className="af-sec" data-ink id="founders">
        <p className="sec-eyebrow rv">Founders</p>
        <h3 className="rv">店側と、デザイン側から。</h3>
        <div className="fd-grid">
          <div className="fd rv">
            <div className="fd-ph ava" data-head="yosuke" data-cm="173" data-tap="stumble" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="23" r="10"/><path d="M13 55 a19 19 0 0 1 38 0"/></svg></div>
            <p className="fd-role">共同創業者 / ビジネスプロデューサー</p>
            <p className="fd-name">板倉 洋輔</p>
            <p className="fd-en">Yosuke Itakura</p>
            <p className="fd-ex">神戸・阪神間で10年以上、飲食店の経営と出店に携わる。現場と数字の両方から、事業を設計する。</p>
            <button className="profile-btn" type="button" data-bio="yosuke">Profile　＋</button>
          </div>
          <div className="fd rv">
            <div className="fd-ph ava" data-head="temma" data-cm="160" data-tap="startle" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="23" r="10"/><path d="M13 55 a19 19 0 0 1 38 0"/></svg></div>
            <p className="fd-role">共同創業者 / クリエイティブディレクター</p>
            <p className="fd-name">平澤 天真</p>
            <p className="fd-en">Temma Hirasawa</p>
            <p className="fd-ex">2,000万会員規模のUI/UXからAdobe公式TikTokまで。「GOODシリーズ」の設計と開発を統括。</p>
            <button className="profile-btn" type="button" data-bio="temma">Profile　＋</button>
          </div>
        </div>
        {/* 会社概要はここからも辿れる。ナビとフッターにも同じ道がある */}
        <p className="fd-more rv">
          <a href="/company">会社概要を見る
            <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M2 9h13M10.5 4 15.5 9 10.5 14"/></svg>
          </a>
        </p>
      </div>

      {/* 締め */}
      <div className="af-sec af-stmt" data-ink id="next">
        <p className="sec-eyebrow rv">And Next</p>
        <h3 className="rv">道具づくりは、まだ途中。</h3>
        <p className="lead rv">使われながら直し、直しては削る。プロダクトの改善も、次の道具の仕込みも、すべては店の一日から始まります。</p>
        <p className="next-line rv"><i></i>Next product — Reservation System and more</p>
        {/* トップの出口。ここまで読んだ人を問い合わせへ送る */}
        <div className="af-cta rv">
          <a className="cta-main" href="/company#contact">お問い合わせ
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 3.5 13.5 8 9 12.5"/></svg>
          </a>
          <a className="cta-sub" href="/company">会社概要</a>
        </div>
      </div>

      <div id="foot" className="rv">
        <span>© UTUTU Inc.</span>
        <span className="pages"><a href="/company">会社概要</a><a href="/company#contact">お問い合わせ</a></span>
      </div>
      </div></section>
      <BioModal />
    </>
  );
}
