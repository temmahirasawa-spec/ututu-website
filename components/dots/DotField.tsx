'use client';

/* 点描の起動役（layout に1つ）。ページをまたいで生き続ける。
   - 初回：ノイズから解像する
   - ページ遷移：TLink が覆ってから遷移する。ここで新しいページを待って覆いを剥がす */

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { transit } from '@/components/site/TLink';
import { dots } from '@/lib/dots/field';

export function DotField() {
  const path = usePathname();

  useEffect(() => {
    if (location.search.includes('nodots')) return;   // 確認用：点描なしで開く
    if (dots.init()) dots.intro();
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __dots: typeof dots }).__dots = dots;
  }, []);

  useEffect(() => {
    if (!transit.pending) return;
    transit.pending = false;
    let alive = true;
    /* 新しいページが描かれて、座標の世界が並べ終わるのを待つ */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!alive) return;
      const hash = decodeURIComponent(location.hash.slice(1));
      /* 座標の世界のページ（トップ・/works）は World が自分で運ぶ。ふつうのページだけ素直にスクロール */
      if (hash && !document.documentElement.classList.contains('world')) document.getElementById(hash)?.scrollIntoView({ block: 'start' });
      setTimeout(() => { void dots.coverOut({}); }, 240);
    }));
    return () => { alive = false; };
  }, [path]);

  return null;
}
