/* 紙のセクションの動き。
   原本 reference/legacy-index.html の <script> 後半をそのまま移したもの。
   語彙は2つだけ。「静かに現れる」（.rv → .in）と「線が引かれる」（.fig）。 */

export function startAfter(): () => void {
  const offs: Array<() => void> = [];
  const on = (t: EventTarget, ev: string, fn: EventListener, opt?: AddEventListenerOptions) => {
    t.addEventListener(ev, fn, opt);
    offs.push(() => t.removeEventListener(ev, fn, opt));
  };
  const timers: ReturnType<typeof setTimeout>[] = [];

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 静かに現れる ---- */
  const rvs = Array.from(document.querySelectorAll<HTMLElement>('.rv'));
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
    rvs.forEach((el) => io.observe(el));
    offs.push(() => io.disconnect());
  } else {
    rvs.forEach((el) => el.classList.add('in'));
  }

  /* ---- 線が引かれる ----
     fill無しのストローク＝線として順に引く／文字と塗り＝あとから現れる。
     <g data-dim> に入れた一群は、引き終わったあと18%に沈む */
  type FigItem = { svg: SVGSVGElement; strokes: SVGGeometryElement[]; marks: SVGElement[] };
  function prepFig(fig: Element): FigItem[] {
    return Array.from(fig.querySelectorAll('svg')).map((svg) => {
      const strokes: SVGGeometryElement[] = [], marks: SVGElement[] = [];
      Array.from(svg.querySelectorAll<SVGElement>('path,line,polyline,polygon,circle,ellipse,rect,text'))
        .forEach((el) => {
          const cs = getComputedStyle(el);
          if (el.tagName !== 'text' && cs.fill === 'none' && cs.stroke !== 'none') {
            strokes.push(el as SVGGeometryElement);
          } else marks.push(el);
        });
      strokes.forEach((el) => {
        const L = el.getTotalLength();
        el.dataset.len = String(L);
        el.style.strokeDasharray = String(L);
        el.style.strokeDashoffset = String(L);
        el.style.visibility = 'hidden'; // 線端が丸だと、長さ0でも始点に点が出る
      });
      marks.forEach((el) => { el.style.opacity = '0'; });
      return { svg, strokes, marks };
    });
  }
  function playFig(items: FigItem[]) {
    items.forEach((it) => {
      let total = 0;
      it.strokes.forEach((el) => { total += +el.dataset.len!; });
      const DUR = 2400;
      let acc = 0;
      it.strokes.forEach((el) => {
        const L = +el.dataset.len!;
        const delay = DUR * acc / total, d = Math.max(120, DUR * L / total);
        acc += L;
        timers.push(setTimeout(() => { el.style.visibility = 'visible'; }, delay));
        el.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }],
          { duration: d, delay, easing: 'linear', fill: 'forwards' });
      });
      it.marks.forEach((el, i) => {
        el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
          { duration: 600, delay: DUR * 0.62 + i * 90, easing: 'cubic-bezier(.4,0,.25,1)', fill: 'forwards' });
      });
      Array.from(it.svg.querySelectorAll('g[data-dim]')).forEach((g) => {
        g.animate([{ opacity: 1 }, { opacity: 0.18 }],
          { duration: 800, delay: DUR + 250, easing: 'ease-out', fill: 'forwards' });
      });
    });
  }

  /* ---- 紙⇄墨の反転。data-ink の節が画面の中ほどに来たら #after 全体を反転する ---- */
  const afterEl = document.getElementById('after');
  const inkZones = Array.from(document.querySelectorAll('[data-ink]'));
  let inkOn = false;
  function inkSync() {
    if (!afterEl) return;
    const isOn = inkZones.some((z) => {
      const r = z.getBoundingClientRect();
      return r.top < innerHeight * 0.62 && r.bottom > innerHeight * 0.30;
    });
    if (isOn !== inkOn) { inkOn = isOn; afterEl.classList.toggle('inked', isOn); }
  }
  on(window, 'scroll', inkSync, { passive: true });
  on(window, 'resize', inkSync);
  inkSync();

  /* ---- 写真の帯 ----
     速さは画素/秒で揃える。CSSの秒数は仮置きで、%基準のままだと
     幅の細いモバイルでは同じ秒数でも半分の速さになる。
     img に width/height が付いているので、読み込み前でも組の幅は確定している */
  function bandSpeed() {
    Array.from(document.querySelectorAll<HTMLElement>('.band-row')).forEach((r) => {
      const set = r.querySelector('.set');
      if (!set) return;
      const w = set.getBoundingClientRect().width;
      if (w < 50) return;
      const pps = r.classList.contains('rev') ? 50 : 62; // 上段をわずかに速く
      r.style.animationDuration = (w / pps).toFixed(1) + 's';
    });
  }
  bandSpeed();
  on(window, 'resize', bandSpeed);

  /* ---- Founders の3Dアバター ----
     three.js は Founders が近づいたときだけ動的に読む。KVの速度には影響させない。
     **ssr:false 相当（この関数はブラウザでしか呼ばれない）。**
     読み込みや WebGL に失敗したら、破線の枠のまま何もしない */
  const fd = document.getElementById('founders');
  if (fd && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        import('@/lib/three/headViewer')
          .then((m) => m.initHeads(Array.from(fd.querySelectorAll<HTMLElement>('.fd-ph'))))
          .catch((err) => console.warn('3Dビューアを読み込めませんでした', err));
      });
    }, { rootMargin: '400px' });
    io.observe(fd);
    offs.push(() => io.disconnect());
  }

  /* ---- 図解。画面に入ったら線を引く ---- */
  const figs = Array.from(document.querySelectorAll<HTMLElement>('[data-fig]'));
  if (reduce || !('IntersectionObserver' in window)) {
    // 動かさず、完成形だけ見せる
    figs.forEach((fig) => {
      Array.from(fig.querySelectorAll<SVGElement>('g[data-dim]')).forEach((g) => { g.style.opacity = '.18'; });
    });
  } else {
    const items = new WeakMap<Element, FigItem[]>();
    const fio = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        fio.unobserve(e.target);
        playFig(items.get(e.target) || prepFig(e.target));
      });
    }, { threshold: 0.3 });
    figs.forEach((fig) => { items.set(fig, prepFig(fig)); fio.observe(fig); });
    offs.push(() => fio.disconnect());
  }

  return () => {
    timers.forEach((t) => clearTimeout(t));
    offs.forEach((f) => f());
  };
}
