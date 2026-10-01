/* 現れる動きの起動（.rv / .rise に .in を付ける）。トップと /company で共通。
   .rv は網点が育って面になる（globals.css の --dr）。育ち終わったら .done を付けてマスクを外す
   （マスクを残すと、その要素が動くたびに描き直しが重くなる）。
   - ?reveal を付けると、全部開いた状態にする（スクリーンショット確認用）
   - reduced motion では最初から全部見せる
   起動して、破棄を返す */
export function startReveal(root: ParentNode = document): () => void {
  const els = Array.from(root.querySelectorAll<HTMLElement>('.rv, .rise'));
  const all = location.search.includes('reveal')
    || matchMedia('(prefers-reduced-motion: reduce)').matches
    || !('IntersectionObserver' in window);
  const timers: number[] = [];
  const open = (el: HTMLElement) => {
    el.classList.add('in');
    if (!el.classList.contains('rv')) return;
    const d = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
    timers.push(window.setTimeout(() => el.classList.add('done'), 1200 + d * 1000));
  };
  if (all) { els.forEach((el) => el.classList.add('in', 'done')); return () => {}; }
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) { open(e.target as HTMLElement); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => io.observe(el));
  return () => { io.disconnect(); timers.forEach(clearTimeout); };
}
