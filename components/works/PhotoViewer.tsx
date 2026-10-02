'use client';

/* 写真を大きく見る（/works の各ブランドの写真）。押すと画面いっぱいに広がり、左右で送れる。
   - 写真の札（`[data-lb]` のボタン）を押すと開く。data-lb＝ブランドの id、data-i＝何枚目か
   - ← → で送る、Esc で閉じる。スマホは左右に払って送る
   - 座標の世界のパネルは transform の中にあるので、position:fixed が効かない。
     だからこの部品はパネルの外（app/works/page.tsx の WorldRoot の隣）に置く
   - 開いているあいだ、ホイールと指のスクロールは止める（カメラが動いてしまう） */

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { BRANDS } from './data';

type At = { b: number; i: number };

export function PhotoViewer() {
  const [at, setAt] = useState<At | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const brand = at ? BRANDS[at.b] : null;
  const photos = useMemo(() => brand?.photos ?? [], [brand]);
  const ph = at ? photos[at.i] : null;

  const close = useCallback(() => {
    setAt(null);
    opener.current?.focus({ preventScroll: true });
    opener.current = null;
  }, []);
  const step = useCallback((d: number) => {
    setAt((a) => (a ? { b: a.b, i: (a.i + d + BRANDS[a.b].photos.length) % BRANDS[a.b].photos.length } : a));
  }, []);

  /* 写真の札を押したら開く（札はパネルの中にあるので、document で拾う） */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = (e.target as Element | null)?.closest<HTMLElement>('[data-lb]');
      if (!t) return;
      const b = BRANDS.findIndex((x) => x.id === t.dataset.lb);
      if (b < 0) return;
      e.preventDefault();
      opener.current = t;
      setAt({ b, i: Number(t.dataset.i) || 0 });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!at) return;
    document.getElementById('pvClose')?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (![' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
    };
    const stop = (e: Event) => e.preventDefault();
    window.addEventListener('keydown', key);
    window.addEventListener('wheel', stop, { passive: false });
    window.addEventListener('touchmove', stop, { passive: false });
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
    };
  }, [at, close, step]);

  /* 次と前を先に読んでおく */
  useEffect(() => {
    if (!at) return;
    for (const d of [1, -1]) {
      const n = photos[(at.i + d + photos.length) % photos.length];
      if (n) new Image().src = n.src;
    }
  }, [at, photos]);

  /* Tab を中に閉じ込める */
  const trap = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const f = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button'));
    const first = f[0], last = f[f.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div
      className={`pv${at ? ' on' : ''}`} role="dialog" aria-modal="true" aria-hidden={!at}
      aria-label={brand ? `${brand.name} の写真` : '写真'} onKeyDown={trap}
      onPointerDown={(e) => { swipe.current = { x: e.clientX, y: e.clientY }; }}
      onPointerUp={(e) => {
        const s = swipe.current; swipe.current = null;
        if (!s) return;
        const dx = e.clientX - s.x, dy = e.clientY - s.y;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
      }}
    >
      {at && brand && ph ? (
        <>
          <div className="pv-veil" onClick={close} />
          <figure className="pv-fig">
            {/* eslint-disable-next-line @next/next/no-img-element -- 元の縦横比のまま、画面に収まる大きさで見せる */}
            <img key={ph.src} className="pv-img" src={ph.src} width={ph.w} height={ph.h} alt={ph.alt} />
            <figcaption className="pv-cap">
              <span className="pv-name">{brand.name}</span>
              <span className="pv-alt">{ph.alt}</span>
              <span className="pv-n">{String(at.i + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
            </figcaption>
          </figure>
          <button id="pvClose" type="button" className="pv-close" onClick={close} aria-label="閉じる">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
          <button type="button" className="pv-nav pv-prev" onClick={() => step(-1)} aria-label="前の写真">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4l-8 8 8 8" /></svg>
          </button>
          <button type="button" className="pv-nav pv-next" onClick={() => step(1)} aria-label="次の写真">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" /></svg>
          </button>
        </>
      ) : null}
    </div>
  );
}
