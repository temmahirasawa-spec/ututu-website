/* 現れる動きの起動（.rv / .rise に .in を付ける）。トップと /company で共通。
   - ?reveal を付けると、全部開いた状態にする（スクリーンショット確認用。
     ヘッドレスでは IntersectionObserver が凍るため）
   - reduced motion では最初から全部見せる
   起動して、破棄を返す */
export function startReveal(root: ParentNode = document): () => void {
  const els = Array.from(root.querySelectorAll<HTMLElement>('.rv, .rise'));
  const all = location.search.includes('reveal')
    || matchMedia('(prefers-reduced-motion: reduce)').matches
    || !('IntersectionObserver' in window);
  if (all) { els.forEach((el) => el.classList.add('in')); return () => {}; }
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
