'use client';

/* トップページの器。パネルを並べ、座標の世界（lib/world）を起動する。
   - 動きを止める設定、または ?flow のときは、ふつうの縦並びのまま（各節が地を塗り、点描は止まった地紋）
   - 右下の地図と左下の座標は、いまどこにいるかの表示。地図の四角を押すとそこへ飛ぶ
   - 3Dアバターは #team が近づいてから読む（three.js は重い）
   - 初回だけ、ヒーローのロゴを粒が組み上げる */

import { useEffect, useRef, type ReactNode } from 'react';
import { BioModal } from '@/components/team/BioModal';
import { transit } from '@/components/site/TLink';
import { dots, THEMES, type ThemeName } from '@/lib/dots/field';
import { World } from '@/lib/world/world';
import { startReveal } from '@/components/home/reveal';

export function WorldRoot({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const spacer = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const hx = useRef<HTMLElement>(null);
  const hy = useRef<HTMLElement>(null);
  const hz = useRef<HTMLElement>(null);
  const hat = useRef<HTMLParagraphElement>(null);
  const hcam = useRef<HTMLElement>(null);
  const hmap = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const r = root.current, sp = spacer.current, pr = probe.current;
    if (!r || !sp || !pr) return;
    const offs: Array<() => void> = [startReveal(r)];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const flow = reduce || location.search.includes('flow');

    if (flow) {
      /* ---- ふつうの縦並び。ヘッダーの下に来た節の色を、文字と点の色にする ---- */
      document.documentElement.classList.add('flow');
      /* 各節が自分の地を塗るので、奥の点描は見えない。描かない（地紋は CSS の止まった網点） */
      if (dots.ok) dots.setBack(false);
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          const g = (e.target as HTMLElement).dataset.ground as ThemeName;
          if (!g || !(g in THEMES)) return;
          if (dots.ok) dots.setTheme(g);
          else document.documentElement.dataset.ground = g;
        });
      }, { rootMargin: '0px 0px -92% 0px' });
      r.querySelectorAll('[data-panel]').forEach((el) => io.observe(el));
      offs.push(() => { io.disconnect(); document.documentElement.classList.remove('flow'); if (dots.ok) dots.setBack(true); });
    } else {
      /* ---- 座標の世界 ---- */
      const w = new World(r, sp, pr);
      w.attachHud({ x: hx.current, y: hy.current, z: hz.current, at: hat.current, cam: hcam.current, map: hmap.current });
      const first = !transit.used;
      if (first && dots.ok && window.scrollY < 10 && !location.hash) w.heroArmed = true;
      w.start();
      offs.push(() => w.stop());
      /* 確認用（開発中だけ）。window.__world.stops() で各節の位置が取れる */
      if (process.env.NODE_ENV !== 'production') (window as unknown as { __world: World }).__world = w;

      /* 初回：粒が飛んできて、ヒーローのロゴを組む。組み終わったら膜の点に引き継ぐ */
      if (w.heroArmed) {
        const mark = r.querySelector<HTMLElement>('.hero-mark');
        const rect = mark?.getBoundingClientRect();
        let done = false;
        const handoff = () => {
          if (done) return;
          done = true;
          w.heroArmed = false;
          dots.fadeSwarm(520);
        };
        if (rect && rect.width > 0) {
          const t = setTimeout(() => {
            void dots.assemble('mark', { x: rect.left, y: rect.top, w: rect.width, h: rect.height }, THEMES.paper.fg).then(handoff);
          }, 350);
          const onScroll = () => { if (window.scrollY > 40) handoff(); };
          window.addEventListener('scroll', onScroll, { passive: true });
          offs.push(() => { clearTimeout(t); window.removeEventListener('scroll', onScroll); handoff(); });
        } else handoff();
      }
    }

    /* ---- 数え上げ ---- */
    const nums = Array.from(r.querySelectorAll<HTMLElement>('[data-count]'));
    if (!reduce && !location.search.includes('reveal')) {
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
            el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3)))).padStart(2, '0');
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      nums.forEach((el) => io.observe(el));
      offs.push(() => io.disconnect());
    }

    /* ---- 3Dアバター ----
       座標の世界では「チーム」の節が初めて見えたとき、縦並びでは近づいたときに読む */
    const team = r.querySelector<HTMLElement>('#team');
    let stopViewer: (() => void) | null = null;
    let dead = false;
    const loadHeads = () => {
      if (!team || dead || stopViewer) return;
      stopViewer = () => {};
      import('@/lib/three/headViewer')
        .then((m) => {
          if (dead) return;
          stopViewer = m.stopHeads;
          return m.initHeads(Array.from(team.querySelectorAll<HTMLElement>('.fd-ph')));
        })
        .catch((err) => console.warn('3Dビューアを読み込めませんでした', err));
    };
    if (team && !flow) {
      team.addEventListener('panelshow', loadHeads, { once: true });
      offs.push(() => team.removeEventListener('panelshow', loadHeads));
    } else if (team) {
      const io = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        loadHeads();
      }, { rootMargin: '600px' });
      io.observe(team);
      offs.push(() => io.disconnect());
    }

    return () => {
      dead = true;
      offs.forEach((f) => f());
      stopViewer?.();
    };
  }, []);

  return (
    <>
      <div className="wv" ref={root}>{children}</div>
      <div className="w-spacer" ref={spacer} aria-hidden="true" />
      <div className="w-probe" ref={probe} aria-hidden="true" />
      <div className="hud" aria-hidden="true">
        <p className="hud-pos">
          <span><b>X</b><i ref={hx}>+00000</i></span>
          <span><b>Y</b><i ref={hy}>+00000</i></span>
          <span><b>Z</b><i ref={hz}>+00000</i></span>
        </p>
        <p className="hud-at" ref={hat}>(01) STUDIO</p>
        <p className="hud-scroll">Scroll<i /></p>
        <div className="hud-map">
          <svg ref={hmap} />
          <i className="hud-cam" ref={hcam} />
        </div>
      </div>
      <BioModal />
    </>
  );
}
