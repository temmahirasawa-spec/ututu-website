/* 紙のセクションの動き。
   原本 reference/legacy-index.html の <script> 後半をそのまま移したもの。
   動きは「静かに現れる」（.rv → .in）だけ。
   プロダクト2節は各サービスのトンマナに切り替えたので、
   かつての図解（.fig の線引き）はもう無い。 */

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

  return () => {
    timers.forEach((t) => clearTimeout(t));
    offs.forEach((f) => f());
  };
}
