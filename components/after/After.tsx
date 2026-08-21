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
import { ProductOrder, ProductReview } from './Products';

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
      <ProductOrder />
      <ProductReview />

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
            <p className="fd-ex">「YORKYS BRUNCH」から複数ブランドを立ち上げ、関西・関東へ。2026年、3ブランドの全国フランチャイズ展開を開始。</p>
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
        <h3 className="rv">検証は、今日も営業中。</h3>
        <p className="lead rv">私たちの店は、これからも実験台です。使いながら直し、直しては削る。プロダクトの改善も、次の道具の仕込みも、すべてはこの店の一日から始まります。</p>
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
