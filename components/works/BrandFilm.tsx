'use client';

/* ブランドの短い映像（/works の各ブランドのパネル）。音の無い 5〜10 秒の映像を、くり返し流す。
   - 半分以上見えているあいだだけ再生し、外れたら止める（4本を同時に回さない）
   - 動きを止める設定では自動再生しない（ポスターの止め絵）
   - 右下に「一時停止／再生」（5秒を超えて動き続けるものは止められるようにする）
   **映像を差し替えたら VER を上げること。**public/clips/ は1年 immutable（vercel.json） */

import { useEffect, useRef, useState } from 'react';
import type { Film } from './data';

const VER = '20261002';

export function BrandFilm({ film, label }: { film: Film; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const held = useRef(false); // 利用者が止めた
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { held.current = true; return; }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.intersectionRatio >= 0.5 && !held.current) void v.play().catch(() => {});
        else if (e.intersectionRatio < 0.5) v.pause();
      },
      { threshold: [0, 0.5] },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { held.current = false; void v.play().catch(() => {}); }
    else { held.current = true; v.pause(); }
  };

  return (
    <figure className="bf">
      <video
        ref={ref} className="bf-v" muted loop playsInline preload="none"
        poster={`${film.poster}?v=${VER}`} width={1280} height={720}
        style={film.zoom ? { transform: `scale(${film.zoom})` } : undefined}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        aria-label={`${label} の映像`}
      >
        <source src={`${film.src}?v=${VER}`} type="video/mp4" />
      </video>
      <button type="button" className="bf-btn" onClick={toggle} aria-label={playing ? '映像を一時停止' : '映像を再生'}>
        {playing ? (
          <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="3" width="3" height="10" /><rect x="9.5" y="3" width="3" height="10" /></svg>
        ) : (
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2.8v10.4L13 8z" /></svg>
        )}
      </button>
    </figure>
  );
}
