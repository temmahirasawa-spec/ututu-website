'use client';

/* ヒーロー（座標の世界の原点）。
   大見出しは**英語、その下に小さく和訳**（本人判断：和文の超大見出しは「2」だけが浮いた）。
   ロゴは点で描く（.hero-mark が点描の印の置き場所。最初は粒が飛んできて組み上がる）。
   WebGL が無ければ、.hero-mark の SVG がそのまま見える。 */

import { useEffect, useState } from 'react';
import { Decode } from '@/components/site/Decode';
import { Arrow } from '@/components/site/Header';
import { Mark } from '@/components/site/Mark';
import { TLink } from '@/components/site/TLink';

export function Hero() {
  return (
    <section
      id="top" className="pn hero" aria-label="UTUTU"
      data-panel="(01) STUDIO" data-ground="paper" data-mood="1.3,0.45,1,1,0.65" data-hold="0.12"
    >
      <div className="hero-in">
        <p className="hero-kick" data-clear>A creative studio building DX<span> — Kobe, Japan / Est. 2026</span></p>
        <div className="hero-h" data-clear>
          <Decode as="h1" className="ttl ttl-hero" lines={['TWO OF US,', 'ALL OF IT.']} delay={250} />
        </div>
        <p className="ttl-jp hero-jp" data-clear>2人で、全部つくる。</p>
        <div className="hero-side" data-clear>
          <p>
            事業をつくってきた人と、つくる手を持つ人。<br />
            AIを道具に、企画からデザイン、開発、映像まで。<br />
            短い時間で、高い精度で、かたちにします。
          </p>
          <div className="hero-cta">
            <TLink className="btn btn--acc" href="/company#contact">相談する<Arrow /></TLink>
            <a className="btn btn--line" href="#work">つくったものを見る</a>
          </div>
        </div>
      </div>
      <div className="hero-mark" data-stamp="mark" data-fit="fill"><Mark title="UTUTU" /></div>
      <div className="hero-bar" aria-hidden="true">
        <span>Kobe 34.69°N 135.19°E</span>
        <Clock />
        <span className="hero-scroll">Scroll<i /></span>
      </div>
    </section>
  );
}

/* 神戸の時刻。サーバーでは描かない（水和で食い違う）。マウント後に1秒ごと */
function Clock() {
  const [t, setT] = useState('--:--:--');
  useEffect(() => {
    const f = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tick = () => setT(f.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="hero-clock">{t} JST</span>;
}
