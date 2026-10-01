'use client';

/* ヒーロー。見出しは HTML、背景の点描は WebGL（halftone.ts）。
   .hero-mark はロゴの置き場所で、点描はこの箱の位置と大きさを読んで描く。
   WebGL が使えないときは、この箱の SVG がそのまま見える（点描の網をかけた状態）。 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Arrow } from '@/components/site/Header';
import { Mark } from '@/components/site/Mark';
import { startHalftone } from './halftone';
import { Rise } from './Rise';

export function Hero() {
  const hero = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const mark = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hero.current || !canvas.current || !mark.current) return;
    const clearEls = Array.from(hero.current.querySelectorAll<HTMLElement>('.hero-kick, .hero-h > span, .hero-side'));
    return startHalftone({ hero: hero.current, canvas: canvas.current, markEl: mark.current, clearEls });
  }, []);

  return (
    <section id="top" className="hero" ref={hero} aria-label="UTUTU">
      <canvas className="hero-cv" ref={canvas} aria-hidden="true" />
      <div className="hero-in">
        <p className="hero-kick rv">A creative studio building DX<span> — Est. 2026</span></p>
        <Rise as="h1" className="hero-h" lines={['2人で、', '全部つくる。']} delay=".15s" />
        <div className="hero-side rv" style={{ ['--d' as string]: '.55s' }}>
          <p>
            事業をつくってきた人と、つくる手を持つ人。<br />
            AIを道具に、企画からデザイン、開発、映像まで。<br />
            短い時間で、高い精度で、かたちにします。
          </p>
          <div className="hero-cta">
            <Link className="btn btn--shu" href="/company#contact">相談する<Arrow /></Link>
            <a className="btn btn--line" href="#work">つくったものを見る</a>
          </div>
        </div>
      </div>
      <div className="hero-mark" ref={mark}><Mark title="UTUTU" /></div>
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
