'use client';

/* プロダクト2節の映像（各LPの冒頭と同じ GOOD SERIES の映像）。
   **主役ではなく、画面の隣に小さく置く添え物。**大きくしないこと。

   PC は横長（16:9）、スマホは縦長（9:16）を出す。
   2本とも DOM に置き、どちらを見せるかは CSS（900px）で切り替える。
   隠れているほうは画面に入らないので、自動再生もされず、読み込みも起きない
   （preload="none"。JSで src を差し替えると、SSRとの食い違いや向きの変化の扱いが増える）。

   動きは LP の PromoVideo に合わせてある（good-order-lp の components/v2/media/PromoVideo.tsx）。
   - 自動再生は音なしで、ページの読み込みが済んでから、半分以上見えているあいだだけ
   - 左下に「再生／一時停止」「音」「全画面」。止まっているあいだは中央にも再生ボタン
     （押すと音ありで再生する。見るために押したので）
   - 全画面は枠ごと。iPhone は要素の全画面が無いので、動画だけを端末のプレーヤーで開く
   - reduced motion では自動再生しない

   **映像を差し替えたら VER を上げること。**public/clips/ は1年 immutable（vercel.json）なので、
   上げないと端末が古い映像を掴み続ける */

import { useEffect, useRef, useState } from 'react';

const VER = '20260928';

type Shape = 'wide' | 'tall';
type IosVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

const SIZE: Record<Shape, { w: number; h: number }> = {
  wide: { w: 1280, h: 720 },
  tall: { w: 720, h: 1280 },
};

export function ProductVideo({ slug, name, shape }: { slug: 'order' | 'review'; name: string; shape: Shape }) {
  const box = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const held = useRef(false); // 利用者が止めた（見えていても勝手に再生しない）
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [full, setFull] = useState(false);
  const base = `/clips/products/${slug}-${shape}`;
  const { w, h } = SIZE[shape];

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; // 音なしでないと自動再生できない（属性だけでなくプロパティも確実に）
    const onFull = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener('fullscreenchange', onFull);
    let io: IntersectionObserver | undefined;
    const start = () => {
      io = new IntersectionObserver(
        ([e]) => {
          if (!e) return;
          if (e.intersectionRatio >= 0.5 && !held.current) void v.play().catch(() => {});
          else if (!e.isIntersecting) v.pause();
        },
        { threshold: [0, 0.5] },
      );
      io.observe(v);
    };
    // 映像は1本4MB前後。KV の連番と帯域を取り合わないよう、ページの読み込みが済んでから
    const auto = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (auto && document.readyState === 'complete') start();
    else if (auto) window.addEventListener('load', start, { once: true });
    return () => {
      document.removeEventListener('fullscreenchange', onFull);
      window.removeEventListener('load', start);
      io?.disconnect();
    };
  }, []);

  const play = (withSound: boolean) => {
    const v = ref.current;
    if (!v) return;
    held.current = false;
    if (withSound) {
      v.muted = false;
      setMuted(false);
    }
    void v.play().catch(() => {});
  };
  const togglePlay = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) play(false);
    else {
      held.current = true;
      v.pause();
    }
  };
  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const toggleFull = () => {
    const el = box.current;
    const v = ref.current as IosVideo | null;
    if (!el || !v) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
      return;
    }
    if (document.fullscreenEnabled && el.requestFullscreen) {
      void el.requestFullscreen().catch(() => {});
      if (v.paused) play(false);
    } else if (v.webkitEnterFullscreen) {
      play(false);
      try {
        v.webkitEnterFullscreen();
      } catch {
        /* 読み込み前で開けないときは、ふつうに再生だけする */
      }
    }
  };

  return (
    <div ref={box} className={`pv-vid pv-vid--${shape}${playing ? ' is-playing' : ''}`}>
      <video
        ref={ref}
        src={`${base}.mp4?v=${VER}`}
        poster={`${base}.webp?v=${VER}`}
        width={w}
        height={h}
        muted={muted}
        loop
        playsInline
        preload="none"
        aria-label={`${name} の紹介映像`}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {/* 左下のボタンと同じ働きなので、読み上げとキーボードの順番からは外す */}
      {!playing && (
        <button type="button" className="pv-vid-play" onClick={() => play(true)} aria-hidden="true" tabIndex={-1}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.5l10 6.5-10 6.5Z" /></svg>
        </button>
      )}
      <div className="pv-vid-bar">
        <button type="button" onClick={togglePlay} aria-label={playing ? `${name} の映像を一時停止` : `${name} の映像を再生`}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            {playing ? <path className="st" d="M7 5v10M13 5v10" /> : <path className="fl" d="M7 4.5l9 5.5-9 5.5Z" />}
          </svg>
        </button>
        <button type="button" onClick={toggleSound} aria-label={muted ? '音を出す' : '音を消す'}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path className="fl" d="M3.5 8h3l4-3.5v11l-4-3.5h-3Z" />
            {muted ? <path className="st" d="M13.5 8l4 4M17.5 8l-4 4" /> : <path className="st" d="M13.5 7.2a4 4 0 0 1 0 5.6M15.6 5.2a7 7 0 0 1 0 9.6" />}
          </svg>
        </button>
        <button type="button" onClick={toggleFull} aria-label={full ? '全画面を閉じる' : '全画面で見る'}>
          {/* 角の4つの鉤。全画面のあいだは内向き */}
          <svg viewBox="0 0 20 20" aria-hidden="true">
            {full
              ? <path className="st" d="M7.5 3.5v4h-4M12.5 3.5v4h4M16.5 12.5h-4v4M3.5 12.5h4v4" />
              : <path className="st" d="M3.5 7.5v-4h4M12.5 3.5h4v4M16.5 12.5v4h-4M7.5 16.5h-4v-4" />}
          </svg>
        </button>
      </div>
    </div>
  );
}
