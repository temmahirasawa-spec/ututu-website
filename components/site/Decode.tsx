'use client';

/* 欧文の大見出し。画面に入ると、1文字ずつ「点」から文字に解像する。
   マウスを乗せると、もう一度ほどけて組み直る。
   読み上げには最終の文字列（aria-label）を渡し、動く文字は aria-hidden。
   **文字の幅は先に測って固定する。**点と文字では幅が違うので、固定しないと行が揺れる */

import { useEffect, useRef, type ElementType } from 'react';

const GLYPHS = '•●·◦•●○∙';

export function Decode({ lines, as: Tag = 'h2', className = '', delay = 0 }: {
  lines: string[]; as?: ElementType; className?: string; delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = Array.from(el.querySelectorAll<HTMLElement>('.dc-c'));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { el.classList.add('in'); return; }
    let timer = 0;
    let running = false;

    const fix = () => {
      chars.forEach((c) => { c.style.width = ''; });
      chars.forEach((c) => { c.style.width = `${c.getBoundingClientRect().width}px`; });
    };

    const run = (d: number) => {
      if (running) return;
      running = true;
      fix();
      const t0 = performance.now() + d;
      const ends = chars.map((_, i) => t0 + i * 28 + Math.random() * 260);
      const tick = () => {
        const now = performance.now();
        let left = 0;
        chars.forEach((c, i) => {
          const fin = c.dataset.c ?? '';
          if (now >= ends[i]) { if (c.textContent !== fin) c.textContent = fin; return; }
          left++;
          c.textContent = now < t0 ? '' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        });
        if (left) timer = window.setTimeout(tick, 45);
        else { running = false; chars.forEach((c) => { c.style.width = ''; }); }
      };
      el.classList.add('in');
      tick();
    };

    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { run(delay); io.disconnect(); } });
    }, { threshold: 0.2 });
    if (location.search.includes('reveal')) el.classList.add('in');
    else io.observe(el);
    const again = () => run(0);
    el.addEventListener('pointerenter', again);
    return () => { io.disconnect(); clearTimeout(timer); el.removeEventListener('pointerenter', again); };
  }, [delay]);

  const text = lines.join(' ');
  return (
    <Tag ref={ref} className={`dc ${className}`} aria-label={text}>
      {lines.map((l, i) => (
        <span className="dc-l" key={i} aria-hidden="true">
          {/* 語ごとにまとめ、語と語のあいだはふつうの空白（そこで折り返せるように） */}
          {l.split(' ').map((w, j) => (
            <span key={j}>
              {j > 0 && ' '}
              <span className="dc-w">
                {Array.from(w).map((ch, k) => <span className="dc-c" data-c={ch} key={k}>{ch}</span>)}
              </span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
