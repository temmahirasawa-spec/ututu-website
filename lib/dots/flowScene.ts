/* ふつうに縦に流れるページ（会社概要・動きを止める設定のトップ）の点描の場面。
   [data-stamp] と [data-clear] を毎フレーム測って、点の印と文字の避け場所にする。
   座標の世界（lib/world）を使わないページ用 */

import { aspectOf, type ShapeName } from './atlas';
import { MODE, type Mood, type Scene, type Stamp, type Zone } from './field';

type St = { k: number; scatter: number; e: [number, number, number, number] };

export function flowScene(root: ParentNode = document, mood: Partial<Mood> = {}) {
  const state = new WeakMap<Element, St>();
  let last = 0;
  return (now: number): Scene => {
    const dt = Math.min(0.05, Math.max(0.001, (now - (last || now)) / 1000));
    last = now;
    const H = window.innerHeight, W = window.innerWidth;
    const stamps: Stamp[] = [];
    root.querySelectorAll<HTMLElement>('[data-stamp]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const vis = r.bottom > -40 && r.top < H + 40 && r.right > 0 && r.left < W;
      const st = state.get(el) ?? { k: 0, scatter: 0, e: (el.dataset.e ?? '0,0,0,0').split(',').map(Number) as St['e'] };
      if (el.dataset.mode === 'marquee') st.e[0] = r.width / Math.max(1, r.height * aspectOf('marquee'));
      st.k += ((vis ? 1 : 0) - st.k) * (1 - Math.exp(-dt * 3.5));
      st.scatter = Math.max(0, st.scatter - dt * 0.9);
      state.set(el, st);
      if (st.k < 0.003) return;
      const shape = el.dataset.stamp as ShapeName;
      let x = r.left, y = r.top, w = r.width, h = r.height;
      if (el.dataset.fit !== 'fill') {
        const a = aspectOf(shape);
        if (w / h > a) { const nw = h * a; x += (w - nw) / 2; w = nw; } else { const nh = w / a; y += (h - nh) / 2; h = nh; }
      }
      stamps.push({ shape, x, y, w, h, k: st.k, mode: MODE[(el.dataset.mode ?? 'still') as keyof typeof MODE] ?? 0, tint: el.dataset.tint !== undefined, scatter: st.scatter, e: st.e });
    });
    const zones: Zone[] = [];
    root.querySelectorAll<HTMLElement>('[data-clear]').forEach((el) => {
      if (zones.length >= 12) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H) return;
      zones.push([r.left, r.top, r.right, r.bottom]);
    });
    return { stamps: stamps.slice(0, 6), zones, mood };
  };
}
