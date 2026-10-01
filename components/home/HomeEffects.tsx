'use client';

/* トップの動きの起動役（マークアップは持たない）。
   - 現れる（reveal.ts）
   - 数を数え上げる（[data-count]）
   - Founders の3Dアバター：#team が近づいたときだけ three.js を読む。
     **KVの速度に影響させない構造は旧版から維持。**失敗したら線画の枠のまま
   - プロフィールのモーダル
   起動したものは全部戻り値で畳む（開発中は effect が2回走る） */

import { useEffect } from 'react';
import { BioModal } from '@/components/team/BioModal';
import { startReveal } from './reveal';

export function HomeEffects() {
  useEffect(() => {
    const offs: Array<() => void> = [startReveal()];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- 数え上げ ---- */
    const nums = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
    if (!reduce && 'IntersectionObserver' in window && !location.search.includes('reveal')) {
      nums.forEach((el) => { el.textContent = '00'; });
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          const el = e.target as HTMLElement;
          const to = Number(el.dataset.count) || 0;
          const t0 = performance.now();
          const step = (now: number) => {
            const k = Math.min(1, (now - t0) / 900);
            const v = Math.round(to * (1 - Math.pow(1 - k, 3)));
            el.textContent = String(v).padStart(2, '0');
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      nums.forEach((el) => io.observe(el));
      offs.push(() => io.disconnect());
    }

    /* ---- 朱の面（締め）がヘッダーの下に来たら、ヘッダーの色を切り替える（globals.css）---- */
    const shu = document.querySelector('.ct');
    if (shu && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        document.body.classList.toggle('on-shu', !!e?.isIntersecting);
      }, { rootMargin: '0px 0px -92% 0px' });   // 画面の上端 8% の帯（＝ヘッダーの高さ）だけを見る
      io.observe(shu);
      offs.push(() => { io.disconnect(); document.body.classList.remove('on-shu'); });
    }

    /* ---- 3Dアバター ---- */
    const team = document.getElementById('team');
    let stopViewer: (() => void) | null = null;
    let dead = false;
    if (team && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        import('@/lib/three/headViewer')
          .then((m) => {
            if (dead) return;
            stopViewer = m.stopHeads;
            return m.initHeads(Array.from(team.querySelectorAll<HTMLElement>('.fd-ph')));
          })
          .catch((err) => console.warn('3Dビューアを読み込めませんでした', err));
      }, { rootMargin: '500px' });
      io.observe(team);
      offs.push(() => io.disconnect());
    }

    return () => {
      dead = true;
      offs.forEach((f) => f());
      stopViewer?.();   // canvas を消して .live を外す。残すと次で二重になる
    };
  }, []);

  return <BioModal />;
}
