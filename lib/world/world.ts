/* 座標の世界（トップページ）。
   ふつうに縦スクロールしているだけで、カメラが座標の上を移動する。
   横へ、斜めへ、奥へ。ときどき少し戻る。最後に引いて、サイト全体を地図として見せる。

   しくみ
   - 各節（[data-panel]）は世界の座標 (x, y, z) に置く。置き方は data-at（ひとつ前の節からのずらし）
   - スクロール量 → カメラの位置。「節の中を読む（縦に進む）」「次の節へ渡る」の区間を交互につなぐ
   - 遠近は CSS の perspective ではなく、自前の計算で拡大縮小に直して 2D の transform で当てる
     （どの節も画面と平行な板なので、透視投影＝中心からの拡大縮小と同じ。3D の重ね合わせを作らずに済み、
      止まったときの文字がにじまない）
   - 点描（lib/dots）の場面もここで作る。カメラと点の印が同じフレームで動くように、
     **点描の描画ループの中から update() を呼んでもらう**（別々の rAF だと1フレームずれる）

   ネイティブのスクロールはそのまま（奪わない）。ホイールの段差だけ少しなめらかにする。
   動きを止める設定では使わない（ふつうの縦並びのまま。World.tsx が判断する）

   **スマホ（flat）**：2026-10-07 本人判断で、スマホではカメラで飛ばない。節はふつうに縦に流れ
   （html.flat）、点描・細胞・印・地の塗り替えだけを同じしくみで重ねる。節は画面に入ってくるとき、
   data-at の向き（右から／奥から…）から少しだけ寄ってくる。上下に行き来してもスクロールの手触りはふつうのまま */

import { kvState } from './kv';
import { dots, MODE, type KV, type Mood, type Scene, type Stamp, type ThemeName, type Zone } from '@/lib/dots/field';
import { aspectOf, qrModules, type ShapeName } from '@/lib/dots/atlas';

type V3 = { x: number; y: number; z: number };
type Rect = { x: number; y: number; w: number; h: number };

type StampDef = {
  el: HTMLElement;
  shape: ShapeName;
  mode: number;
  tint: boolean;
  on: 'always' | 'hover';
  fit: 'contain' | 'fill';
  local: Rect;
  k: number;
  want: number;
  scatter: number;
  e: [number, number, number, number];
  seen: boolean;
};

type Panel = {
  el: HTMLElement;
  id: string;
  label: string;
  ground: ThemeName;
  at: [number, number, number];
  from: 'bottom' | 'top';
  transit: number;
  bulge: number | 'map';
  hold: number;
  mood: Partial<Mood>;
  h: number;
  pos: V3;
  start: V3;
  end: V3;
  sIn: number;
  sStart: number;
  sEnd: number;
  stamps: StampDef[];
  zones: Rect[];
  lights: { el: HTMLElement; y: number; h: number }[];
  /* 毎フレーム */
  sc: number;
  tx: number;
  ty: number;
  o: number;
  vis: boolean;
  css: string;
  /** flat：ページの頭からの節の上端（素の位置） */
  top: number;
};

type Seg = { kind: 'transit' | 'dwell' | 'hold'; s0: number; s1: number; a: V3; b: V3; bulge: number; map: boolean; panel: number };

const THEME_OF: Record<string, ThemeName> = { paper: 'paper', ink: 'ink', shu: 'shu', order: 'order', review: 'review' };

export class World {
  private panels: Panel[] = [];
  private segs: Seg[] = [];
  private S = 0;
  private W = 0;
  private H = 0;
  private P = 1000;
  private sSmooth = 0;
  private tween: null | { from: number; to: number; t0: number; dur: number } = null;
  private last = 0;
  private ground: ThemeName | null = null;
  private cam: V3 = { x: 0, y: 0, z: 0 };
  private bulgeNow = 0;
  private coarse = false;
  private center = { x: 0, y: 0, w: 1, h: 1 };
  private offs: Array<() => void> = [];
  private hudEls: { x?: HTMLElement | null; y?: HTMLElement | null; z?: HTMLElement | null; at?: HTMLElement | null; cam?: HTMLElement | null; map?: SVGSVGElement | null } = {};
  private mapScale = 1;
  private mapOff = { x: 0, y: 0 };
  private hover: StampDef | null = null;
  private ptr = { x: -1, y: -1 };
  private ownRaf = 0;
  private dirty = true;
  /** ヒーローのロゴは、群れが組み終わるまで点の印を出さない */
  heroArmed = false;
  /** キービジュアルの細胞（トップだけ。ヒーローに .hero-cells があるとき。lib/world/kv.ts）と、オープニングの起点 */
  private kvOn = false;
  kvT0 = -1e9;
  /** スマホ：カメラで飛ばず、節はふつうに縦に流れる（start() の前に決める） */
  flat = false;
  private idx = -1;
  private atTimer = 0;

  constructor(private root: HTMLElement, private spacer: HTMLElement, private probe: HTMLElement) {}

  start() {
    this.coarse = matchMedia('(pointer: coarse)').matches;
    document.documentElement.classList.add('world');
    document.documentElement.classList.toggle('flat', this.flat);
    this.read();
    this.layout();
    this.sSmooth = window.scrollY;
    this.jumpToHash(true);

    const on = (t: EventTarget, ev: string, fn: EventListener, opt?: AddEventListenerOptions | boolean) => {
      t.addEventListener(ev, fn, opt);
      this.offs.push(() => t.removeEventListener(ev, fn, opt));
    };
    let rz = 0;
    on(window, 'resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => this.relayout()); });
    on(document, 'click', this.onClick as EventListener, true);
    on(document, 'focusin', this.onFocus as EventListener);
    on(window, 'pointerdown', this.onDown as EventListener, { passive: true });
    on(window, 'pointermove', this.onMove as EventListener, { passive: true });
    on(window, 'hashchange', () => this.jumpToHash(false));
    on(window, 'scroll', () => { this.dirty = true; if (!dots.ok) this.kickOwn(); }, { passive: true });
    /* 書体が届くと文字の高さが変わる。測り直す */
    document.fonts?.ready.then(() => this.relayout());
    const ro = new ResizeObserver(() => this.relayout());
    this.panels.forEach((p) => ro.observe(p.el));
    this.offs.push(() => ro.disconnect());

    if (dots.ok) dots.setScene((now) => this.update(now));
    else this.kickOwn();
  }

  stop() {
    this.offs.forEach((f) => f());
    this.offs = [];
    cancelAnimationFrame(this.ownRaf);
    if (dots.ok) dots.setScene(null);
    document.documentElement.classList.remove('world', 'flat');
    this.panels.forEach((p) => {
      p.el.style.transform = '';
      p.el.style.opacity = '';
      p.el.style.visibility = '';
      p.el.style.zIndex = '';
    });
    this.spacer.style.height = '';
  }

  private kickOwn() {
    if (this.ownRaf) return;
    this.ownRaf = requestAnimationFrame((t) => { this.ownRaf = 0; this.update(t); if (this.tween || Math.abs(window.scrollY - this.sSmooth) > 0.5) this.kickOwn(); });
  }

  /* ------------------------------------------------ 読む・並べる */
  private read() {
    const els = Array.from(this.root.querySelectorAll<HTMLElement>(':scope > [data-panel]'));
    this.panels = els.map((el) => {
      const at = (el.dataset.at ?? '0,0,0').split(',').map(Number) as [number, number, number];
      const mood: Partial<Mood> = {};
      if (el.dataset.mood) {
        const [veins, blobs, dust, speed, warp] = el.dataset.mood.split(',').map(Number);
        Object.assign(mood, { veins, blobs, dust, speed, warp });
      }
      return {
        el,
        id: el.id,
        label: el.dataset.panel ?? '',
        ground: THEME_OF[el.dataset.ground ?? 'paper'] ?? 'paper',
        at,
        from: el.dataset.from === 'top' ? 'top' : 'bottom',
        transit: Number(el.dataset.transit ?? 0.95),
        bulge: el.dataset.bulge === 'map' ? 'map' : Number(el.dataset.bulge ?? 0.25),
        hold: Number(el.dataset.hold ?? 0.2),
        mood,
        h: 0, pos: { x: 0, y: 0, z: 0 }, start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: 0, z: 0 },
        sIn: 0, sStart: 0, sEnd: 0, stamps: [], zones: [], lights: [],
        sc: 1, tx: 0, ty: 0, o: 1, vis: false, css: '', top: 0,
      };
    });
  }

  private relayout() {
    /* スマホではアドレスバーが出入りするたびに resize が来る。でも高さは 100svh の probe で測っているので
       並びは変わらない。**何も変わっていなければ何もしない**（以前は毎回並べ直してスクロール位置を戻し、
       指で動かしている途中に引き戻していた。2026-10-07 本人報告） */
    const W = this.root.clientWidth || window.innerWidth;
    const H = this.probe.offsetHeight || window.innerHeight;
    if (W === this.W && H === this.H && this.panels.every((p) => p.el.offsetHeight === p.h)) return;
    if (this.flat) { this.layout(); return; }   // ふつうに流れているので、スクロール位置はブラウザが保つ
    /* いまいる節と、その中の位置を覚えておき、並べ直したあとも同じ場所に戻す。
       **カメラ（sSmooth）ではなく実際のスクロール位置から測ること**（カメラは遅れて追いかけているので、
       カメラから測ると指の位置より手前へ引き戻す） */
    const y = window.scrollY;
    const i = this.panelAt(y);
    const p = this.panels[i];
    const frac = p ? (y - p.sIn) / Math.max(1, p.sEnd - p.sIn) : 0;
    this.layout();
    const q = this.panels[i];
    if (q) {
      const s = q.sIn + frac * (q.sEnd - q.sIn);
      if (Math.abs(s - y) > 1) window.scrollTo({ top: s, behavior: 'instant' as ScrollBehavior });
      this.sSmooth += s - y;
    }
    this.dirty = true;
  }

  layout() {
    this.W = this.root.clientWidth || window.innerWidth;
    this.H = this.probe.offsetHeight || window.innerHeight;
    this.P = 1.15 * Math.max(this.W, this.H);
    const { W, H, P } = this;

    /* 測るあいだは素の位置に戻す（変形が掛かったままだと寸法がずれる）。
       **覚えている変形（css）も消すこと。**消さないと、次のフレームで「変わっていない」と見なされ、
       素の位置のまま全部の節が重なる（実際に起きた） */
    this.panels.forEach((p) => { p.el.style.transform = 'none'; p.el.style.visibility = 'visible'; p.css = ''; });

    if (this.flat) { this.layoutFlat(); return; }

    let prev: Panel | null = null;
    for (const p of this.panels) {
      p.h = p.el.offsetHeight;
      if (!prev) p.pos = { x: 0, y: 0, z: 0 };
      else {
        const ax = prev.pos.x, ay = p.from === 'top' ? prev.pos.y : prev.pos.y + prev.h, az = prev.pos.z;
        p.pos = { x: ax + p.at[0] * W, y: ay + p.at[1] * H, z: az + p.at[2] * P };
      }
      if (p.h <= H) {
        const y = p.pos.y + (p.h - H) / 2;
        p.start = { x: p.pos.x, y, z: p.pos.z };
        p.end = { ...p.start };
      } else {
        p.start = { x: p.pos.x, y: p.pos.y, z: p.pos.z };
        p.end = { x: p.pos.x, y: p.pos.y + p.h - H, z: p.pos.z };
      }
      prev = p;
      this.measure(p);
    }

    /* キービジュアルの細胞（ヒーローに .hero-cells の印があるときだけ） */
    this.kvOn = dots.ok && !!this.panels[0]?.el.querySelector('.hero-cells');

    /* 世界の外接（地図のため） */
    const xs = this.panels.flatMap((p) => [p.pos.x, p.pos.x + W]);
    const ys = this.panels.flatMap((p) => [p.pos.y, p.pos.y + p.h]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    this.center = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };

    /* 道のり */
    this.segs = [];
    let s = 0;
    this.panels.forEach((p, i) => {
      p.sIn = s;
      if (i > 0) {
        const a = this.panels[i - 1].end, b = p.start;
        const len = p.transit * H;
        let bulge = 0, map = false;
        if (p.bulge === 'map') {
          map = true;
          /* 全体が収まるところまで引く */
          const need = Math.max(this.center.w / (W * 0.9), this.center.h / (H * 0.86));
          bulge = Math.max(0.5, need - 1);
        } else bulge = p.bulge;
        this.segs.push({ kind: 'transit', s0: s, s1: s + len, a, b, bulge, map, panel: i });
        s += len;
      }
      p.sStart = s;
      const d = p.end.y - p.start.y;
      if (d > 0) { this.segs.push({ kind: 'dwell', s0: s, s1: s + d, a: p.start, b: p.end, bulge: 0, map: false, panel: i }); s += d; }
      const hold = p.hold * H;
      if (hold > 0) { this.segs.push({ kind: 'hold', s0: s, s1: s + hold, a: p.end, b: p.end, bulge: 0, map: false, panel: i }); s += hold; }
      p.sEnd = s;
    });
    this.S = s;
    this.spacer.style.height = `${Math.ceil(s + H)}px`;
    this.buildMap();
    this.dirty = true;
  }

  /** flat：節はふつうに縦に並んでいる。素の位置を測るだけ。道のり（s）はページのスクロール位置そのもの */
  private layoutFlat() {
    const sy = window.scrollY;
    this.panels.forEach((p, i) => {
      p.h = p.el.offsetHeight;
      p.top = p.el.getBoundingClientRect().top + sy;
      p.pos = { x: 0, y: p.top, z: 0 };
      p.start = { ...p.pos };
      p.end = { x: 0, y: p.top + Math.max(0, p.h - this.H), z: 0 };
      p.sIn = i ? this.panels[i - 1].top : 0;
      p.sStart = p.top;
      p.sEnd = p.top + p.h;
      this.measure(p);
    });
    this.kvOn = dots.ok && !!this.panels[0]?.el.querySelector('.hero-cells');
    this.segs = [];
    this.S = Math.max(0, document.documentElement.scrollHeight - this.H);
    this.spacer.style.height = '';
    this.buildMap();
    this.dirty = true;
  }

  /** 節の中の、印・文字の避け場所・灯る段落を、節の左上からの位置で測る */
  private measure(p: Panel) {
    const pr = p.el.getBoundingClientRect();
    const rel = (el: Element): Rect => {
      const r = el.getBoundingClientRect();
      return { x: r.left - pr.left, y: r.top - pr.top, w: r.width, h: r.height };
    };
    const old = new Map(p.stamps.map((s) => [s.el, s]));
    p.stamps = Array.from(p.el.querySelectorAll<HTMLElement>('[data-stamp]')).map((el) => {
      const shape = el.dataset.stamp as ShapeName;
      const prevS = old.get(el);
      const e = (el.dataset.e ?? '0,0,0,0').split(',').map(Number) as [number, number, number, number];
      const local = rel(el);
      /* 流れる帯：枠の幅に、文字の帯が何周ぶん並ぶか */
      if (el.dataset.mode === 'marquee') e[0] = local.w / Math.max(1, local.h * aspectOf(shape));
      return {
        el,
        shape,
        mode: MODE[(el.dataset.mode ?? 'still') as keyof typeof MODE] ?? 0,
        tint: el.dataset.tint !== undefined,
        on: el.dataset.on === 'hover' ? 'hover' : 'always',
        fit: el.dataset.fit === 'fill' ? 'fill' : 'contain',
        local,
        k: prevS?.k ?? 0,
        want: 0,
        scatter: prevS?.scatter ?? 0,
        e: prevS && el.dataset.mode !== 'marquee' ? prevS.e : e,
        seen: prevS?.seen ?? false,
      };
    });
    p.zones = Array.from(p.el.querySelectorAll<HTMLElement>('[data-clear]')).map(rel);
    p.lights = Array.from(p.el.querySelectorAll<HTMLElement>('[data-light]')).map((el) => {
      const r = rel(el);
      return { el, y: r.y, h: r.h };
    });
  }

  /* ------------------------------------------------ カメラ */
  private segAt(s: number): Seg | undefined {
    const segs = this.segs;
    if (!segs.length) return undefined;
    if (s <= segs[0].s0) return segs[0];
    for (const g of segs) if (s >= g.s0 && s <= g.s1) return g;
    return segs[segs.length - 1];
  }

  private panelAt(s: number) {
    if (this.flat) {
      /* 画面のまんなかにある節 */
      let i = 0;
      for (let k = 0; k < this.panels.length; k++) if (this.panels[k].top <= s + this.H * 0.5) i = k;
      return i;
    }
    const g = this.segAt(s);
    if (!g) return 0;
    if (g.kind !== 'transit') return g.panel;
    const u = (s - g.s0) / Math.max(1, g.s1 - g.s0);
    return u < 0.5 ? g.panel - 1 : g.panel;
  }

  private camAt(s: number): V3 {
    const g = this.segAt(s);
    if (!g) return { x: 0, y: 0, z: 0 };
    const u = Math.min(1, Math.max(0, (s - g.s0) / Math.max(1e-6, g.s1 - g.s0)));
    if (g.kind !== 'transit') {
      this.bulgeNow = 0;
      return { x: g.a.x + (g.b.x - g.a.x) * u, y: g.a.y + (g.b.y - g.a.y) * u, z: g.a.z + (g.b.z - g.a.z) * u };
    }
    const e = u * u * u * (u * (u * 6 - 15) + 10);          // smootherstep
    const arc = Math.sin(Math.PI * u);
    let x = g.a.x + (g.b.x - g.a.x) * e;
    let y = g.a.y + (g.b.y - g.a.y) * e;
    const z = g.a.z + (g.b.z - g.a.z) * e + g.bulge * this.P * (g.map ? Math.pow(arc, 0.8) : arc);
    if (g.map) {
      /* 地図：引いているあいだは、世界の真ん中を見る */
      const w = Math.pow(arc, 0.6);
      const cx = this.center.x - this.W / 2, cy = this.center.y - this.H / 2;
      x = x + (cx - x) * w;
      y = y + (cy - y) * w;
    }
    this.bulgeNow = g.bulge * (g.map ? Math.pow(arc, 0.8) : arc);
    return { x, y, z };
  }

  /** 確認用：各節の id と、そこに着くスクロール位置 */
  stops() { return this.panels.map((p) => ({ id: p.id || p.label, sIn: p.sIn, s: p.sStart, end: p.sEnd })); }

  /** 確認用：カメラと印を、いまのスクロール位置に即座に追いつかせる（ヘッドレスはフレームが遅い） */
  snap() {
    this.tween = null;
    this.sSmooth = Math.max(0, Math.min(this.S, window.scrollY));
    this.dirty = true;
    this.update(performance.now());
    this.panels.forEach((p) => p.stamps.forEach((s) => { s.k = s.want; if (s.mode === MODE.bars && s.seen) s.e[0] = 1; }));
  }

  /** ある節へ移動する（メニュー・地図・アンカー）。カメラは道のりをたどって飛ぶ。
      dy は節の中の位置（画面より背の高い節で、節の頭から何 px 下を見るか） */
  travelTo(i: number, instant = false, dy = 0) {
    const p = this.panels[Math.max(0, Math.min(this.panels.length - 1, i))];
    if (!p) return;
    if (this.flat) {
      window.scrollTo({ top: p.top, behavior: (instant ? 'instant' : 'smooth') as ScrollBehavior });
      this.dirty = true;
      return;
    }
    const to = p.sStart + Math.max(0, Math.min(p.end.y - p.start.y, dy));
    if (instant) { this.tween = null; this.sSmooth = to; }
    else {
      const dist = Math.abs(to - this.sSmooth) / this.H;
      this.tween = { from: this.sSmooth, to, t0: performance.now(), dur: Math.min(2200, Math.max(700, 380 + dist * 140)) };
    }
    window.scrollTo({ top: to, behavior: 'instant' as ScrollBehavior });
    this.dirty = true;
    if (!dots.ok) this.kickOwn();
  }

  private indexOfTarget(id: string) {
    if (!id) return -1;
    const el = document.getElementById(id);
    if (!el) return -1;
    return this.panels.findIndex((p) => p.el === el || p.el.contains(el));
  }

  private jumpToHash(instant: boolean) {
    const i = this.indexOfTarget(decodeURIComponent(location.hash.slice(1)));
    if (i >= 0) this.travelTo(i, instant);
  }

  private onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname) return;
    const i = this.indexOfTarget(decodeURIComponent(url.hash.slice(1)));
    if (i < 0) return;
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.remove('menu-open');
    document.getElementById('menuBtn')?.setAttribute('aria-expanded', 'false');
    history.replaceState(history.state, '', url.hash);
    this.travelTo(i);
  };

  /** キーボードで画面の外の要素に移ったら、そこが見えるところまで運ぶ。
      背の高い節（ふたり など）では、節の頭ではなく要素の高さまで下る */
  private onFocus = (e: FocusEvent) => {
    if (this.flat) return;   // ふつうに流れているので、ブラウザが見えるところまで運ぶ
    const el = e.target as HTMLElement;
    const i = this.panels.findIndex((p) => p.el.contains(el));
    if (i < 0) return;
    const r = el.getBoundingClientRect();
    if (this.panelAt(this.sSmooth) === i && r.top >= 0 && r.bottom <= this.H) return;
    const y = offsetIn(el, this.panels[i].el);
    this.travelTo(i, true, y + el.offsetHeight / 2 - this.H / 2);
  };

  /* ------------------------------------------------ 印に触れる */
  private stampAt(x: number, y: number): StampDef | null {
    for (const p of this.panels) {
      if (!p.vis || p.o < 0.5) continue;
      for (const s of p.stamps) {
        const r = this.screenRect(p, s.local);
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return s;
      }
    }
    return null;
  }

  private onDown = (e: PointerEvent) => {
    /* アバターに触れたら、その足元が波打つ */
    const stage = (e.target as Element | null)?.closest?.('.fd-stage');
    if (stage) {
      for (const p of this.panels) for (const s of p.stamps) if (stage.contains(s.el)) s.e[0] += 1;
    }
    const s = this.stampAt(e.clientX, e.clientY);
    if (!s || s.on === 'hover') return;
    switch (s.mode) {
      case MODE.stars: s.e[0] = (s.e[0] % 5) + 1; break;            // 星の数が変わる
      case MODE.qr: s.e[0] = s.e[0] > 0.5 ? 0 : 1; break;            // QR が読める形に整う／戻る
      case MODE.bars: s.e[0] = 0; break;                             // 棒が伸び直す
      case MODE.floor: s.e[0] += 1; break;
      default: s.scatter = 1;
    }
    if (s.shape === 'cross') {                                       // 「×」に触れると、色が突然反転する
      dots.invert(true);
      setTimeout(() => dots.invert(false), 1600);
    }
    this.dirty = true;
  };

  private onMove = (e: PointerEvent) => {
    this.ptr = { x: e.clientX, y: e.clientY };
    if (e.pointerType === 'touch') return;
    let hit: StampDef | null = null;
    for (const p of this.panels) {
      if (!p.vis) continue;
      for (const s of p.stamps) {
        if (s.on !== 'hover') continue;
        const r = this.screenRect(p, s.local);
        if (e.clientX >= r.x && e.clientX <= r.x + r.w && e.clientY >= r.y && e.clientY <= r.y + r.h) hit = s;
      }
    }
    this.hover = hit;
  };

  /* ------------------------------------------------ 毎フレーム */
  private screenRect(p: Panel, r: Rect): Rect {
    return { x: p.tx + r.x * p.sc, y: p.ty + r.y * p.sc, w: r.w * p.sc, h: r.h * p.sc };
  }

  update(now: number): Scene {
    const dt = Math.min(0.05, Math.max(0.001, (now - (this.last || now)) / 1000));
    this.last = now;
    if (this.flat) return this.updateFlat(dt);
    const target = Math.max(0, Math.min(this.S, window.scrollY));
    if (this.tween) {
      const t = Math.min(1, (now - this.tween.t0) / this.tween.dur);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      this.sSmooth = this.tween.from + (this.tween.to - this.tween.from) * e;
      if (t >= 1) this.tween = null;
    } else {
      const k = this.coarse ? 16 : 9;
      const d = target - this.sSmooth;
      this.sSmooth = Math.abs(d) < 0.3 ? target : this.sSmooth + d * (1 - Math.exp(-dt * k));
    }

    const cam = this.camAt(this.sSmooth);
    this.cam = cam;
    const { W, H, P } = this;
    const cx = W / 2, cy = H / 2;
    /* 引いて見ている（bulge）ぶんは「遠い」に数えない。奥の節だけが薄くなる */
    const focusZ = cam.z - this.bulgeNow * P;

    for (const p of this.panels) {
      const rx = p.pos.x - cam.x, ry = p.pos.y - cam.y, rz = p.pos.z - cam.z;
      const den = P - rz;
      if (den <= P * 0.12) { this.apply(p, false, 0, 0, 1, 0); continue; }
      let sc = P / den;
      let tx = cx + (rx - cx) * sc, ty = cy + (ry - cy) * sc;
      if (Math.abs(rz) < 0.5) { sc = 1; tx = Math.round(rx); ty = Math.round(ry); }
      const fz = p.pos.z - focusZ;
      let o = 1;
      if (rz > 0) o = 1 - smooth(0.1 * P, 0.48 * P, rz);
      else if (fz < 0) o = 1 - 0.96 * smooth(0.1 * P, 0.9 * P, -fz);
      const vis = o > 0.01 && tx < W + 40 && ty < H + 40 && tx + W * sc > -40 && ty + p.h * sc > -40;
      this.apply(p, vis, tx, ty, sc, o, Math.round(2000 + rz / 10));
    }

    /* 地の色 */
    const gi = this.panelAt(this.sSmooth);
    const gp = this.panels[gi];
    if (gp && gp.ground !== this.ground) {
      const first = this.ground === null;
      this.ground = gp.ground;
      /* 次の節が来る方向から塗り替える */
      const ox = Math.min(W, Math.max(0, gp.tx + (W * gp.sc) / 2));
      const oy = Math.min(H, Math.max(0, gp.ty + (Math.min(gp.h, H) * gp.sc) / 2));
      dots.setTheme(gp.ground, { wipe: !first, x: ox, y: oy });
      if (this.hudEls.at) this.hudEls.at.textContent = gp.label;
      document.documentElement.dataset.at = gp.id;
    }

    /* 段落が灯る（画面の下から上へ） */
    for (const p of this.panels) {
      if (!p.vis || !p.lights.length) continue;
      /* 節に着いてからの「間」をスクロールするあいだにも灯る（下の段落が画面の下に残ったままでも、最後まで灯る） */
      const stay = Math.min(1, Math.max(0, (this.sSmooth - p.sStart) / Math.max(1, p.sEnd - p.sStart)));
      for (const l of p.lights) {
        const y = p.ty + (l.y + l.h * 0.5) * p.sc;
        const v = Math.min(1, Math.max(0, (H * 0.86 - y) / (H * 0.5), stay * 1.15));
        l.el.style.setProperty('--lp', v.toFixed(3));
      }
    }

    this.hud(cam);
    return this.scene(dt);
  }

  /** flat の毎フレーム。カメラは無い。節の画面の位置はスクロールで決まり、入ってくるときだけ少し寄ってくる */
  private updateFlat(dt: number): Scene {
    const y = window.scrollY;
    this.sSmooth = y;
    const { W, H } = this;
    this.panels.forEach((p, i) => {
      const base = p.top - y;
      /* 入ってくる：節の上端が画面の下端 → 画面の 55% まで来るあいだに、data-at の向きから寄ってくる。
         時間ではなくスクロールに結びつけるので、戻れば戻る（上下に行き来しても不自然にならない） */
      let tx = 0, sc = 1, o = 1;
      if (i > 0) {
        const t = Math.min(1, Math.max(0, (H - base) / (H * 0.45)));
        const u = 1 - Math.pow(1 - t, 3);
        const ax = Math.max(-1, Math.min(1, p.at[0])), az = Math.max(-1, Math.min(1, p.at[2]));
        sc = 1 + az * 0.14 * (1 - u);
        tx = (W - W * sc) / 2 + ax * W * 0.16 * (1 - u);
        o = 0.25 + 0.75 * u;
      }
      const vis = base < H + 40 && base + p.h > -40;
      this.applyFlat(p, vis, tx, base, sc, o);
    });

    /* 地の色：画面のまんなかに来た節の地へ、その節の上端から塗り替える */
    const gi = this.panelAt(y);
    const gp = this.panels[gi];
    if (gp && gp.ground !== this.ground) {
      const first = this.ground === null;
      this.ground = gp.ground;
      dots.setTheme(gp.ground, { wipe: !first, x: W / 2, y: Math.min(H, Math.max(0, gp.ty)) });
    }
    if (gp && gi !== this.idx) {
      this.idx = gi;
      document.documentElement.dataset.at = gp.id;
      this.markMap(gi);
    }

    /* 段落が灯る（画面の下から上へ） */
    for (const p of this.panels) {
      if (!p.vis || !p.lights.length) continue;
      for (const l of p.lights) {
        const ly = p.ty + (l.y + l.h * 0.5) * p.sc;
        l.el.style.setProperty('--lp', Math.min(1, Math.max(0, (H * 0.86 - ly) / (H * 0.5))).toFixed(3));
      }
    }
    return this.scene(dt);
  }

  private applyFlat(p: Panel, vis: boolean, tx: number, ty: number, sc: number, o: number) {
    if (vis && !p.vis) p.el.dispatchEvent(new CustomEvent('panelshow'));
    p.tx = tx; p.ty = ty; p.sc = sc; p.o = o; p.vis = vis;
    /* 節はふつうに流れているので、当てるのは「寄ってくる」ぶんだけ（ty は当てない） */
    const css = vis ? `${tx.toFixed(1)}|${sc.toFixed(4)}|${o.toFixed(3)}` : 'hidden';
    if (css === p.css) return;
    p.css = css;
    const st = p.el.style;
    if (!vis) { st.visibility = 'hidden'; st.willChange = ''; return; }
    st.visibility = 'visible';
    const still = Math.abs(tx) < 0.05 && Math.abs(sc - 1) < 0.0005;
    st.willChange = still ? '' : 'transform';
    st.transform = still ? '' : `translate3d(${tx.toFixed(1)}px,0,0) scale(${sc.toFixed(4)})`;
    st.opacity = o >= 0.999 ? '' : o.toFixed(3);
  }

  private apply(p: Panel, vis: boolean, tx: number, ty: number, sc: number, o: number, z = 0) {
    /* 初めて見えた節に知らせる（3Dの読み込みなど。IntersectionObserver は、並べる瞬間に
       全部の節が一度画面に重なるので、起動直後に誤って反応する） */
    if (vis && !p.vis) p.el.dispatchEvent(new CustomEvent('panelshow'));
    p.tx = tx; p.ty = ty; p.sc = sc; p.o = o; p.vis = vis;
    const css = vis ? `${tx.toFixed(2)}|${ty.toFixed(2)}|${sc.toFixed(4)}|${o.toFixed(3)}|${z}` : 'hidden';
    if (css === p.css) return;
    p.css = css;
    const st = p.el.style;
    /* 見えていない節は描かない。見えている節だけ層を分ける（全部に will-change を付けると、
       スマホでは層のメモリだけで数百MBになる） */
    if (!vis) { st.visibility = 'hidden'; st.willChange = ''; return; }
    st.visibility = 'visible';
    st.willChange = 'transform';
    st.transform = sc === 1 ? `translate3d(${tx}px,${ty}px,0)` : `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${sc.toFixed(4)})`;
    st.opacity = o >= 0.999 ? '' : o.toFixed(3);
    st.zIndex = String(z);
  }

  private scene(dt: number): Scene {
    const stamps: Stamp[] = [];
    const zones: { z: Zone; w: number }[] = [];
    let mood: Partial<Mood> = {};
    const gp = this.panels[this.panelAt(this.sSmooth)];
    if (gp) mood = gp.mood;

    for (const p of this.panels) {
      const on = p.vis && p.o > 0.05;
      for (const s of p.stamps) {
        /* 強さ：見えている節の印だけ立ち上がる。ホバーの印はホバー中だけ */
        s.want = on ? (s.on === 'hover' ? (this.hover === s ? 1 : 0) : 1) : 0;
        if (s.shape === 'mark' && p.id === 'top' && this.heroArmed) s.want = 0;
        const rate = s.want > s.k ? 3.2 : 4.5;
        s.k += (s.want - s.k) * (1 - Math.exp(-dt * rate));
        s.scatter = Math.max(0, s.scatter - dt * 0.9);
        if (on && !s.seen && p.o > 0.6) s.seen = true;
        if (s.mode === MODE.bars) s.e[0] = s.seen ? Math.min(1, s.e[0] + dt * 0.55) : 0;
        if (!on || s.k < 0.003) continue;
        let r = this.screenRect(p, s.local);
        if (s.fit === 'contain') r = contain(r, aspectOf(s.shape));
        /* QR は整えたとき、モジュール1つ＝升目ちょうど k 個に合わせて格子に置く。
           ずれていると点がモジュールの境目を拾って、読めない形になる（実際に読めなかった） */
        if (s.mode === MODE.qr && s.e[0] > 0.01) r = snapToLattice(r, qrModules());
        stamps.push({
          shape: s.shape, x: r.x, y: r.y, w: r.w, h: r.h,
          k: s.k * Math.min(1, p.o * 1.2),
          mode: s.mode, scatter: s.scatter * s.scatter, tint: s.tint, e: s.e,
        });
      }
      if (!p.vis || p.o < 0.3) continue;
      for (const z of p.zones) {
        const r = this.screenRect(p, z);
        if (r.y > this.H || r.y + r.h < 0 || r.x > this.W || r.x + r.w < 0) continue;
        zones.push({ z: [r.x, r.y, r.x + r.w, r.y + r.h], w: p.o + (p === gp ? 1 : 0) });
      }
    }
    /* 大きい（＝手前の）印から */
    stamps.sort((a, b) => b.w * b.h - a.w * a.h);
    /* 文字の避け場所は 12 個まで（シェーダの配列の大きさ）。いまいる節の文字を先に守る */
    zones.sort((a, b) => b.w - a.w);
    const kv = this.kvScene();
    return {
      kv,
      stamps,
      zones: zones.slice(0, 12).map((x) => x.z),
      mood,
      lattice: this.flat
        ? { x: 0, y: -this.sSmooth * 0.32, scale: 1 }
        : { x: -this.cam.x * 0.32, y: -this.cam.y * 0.32, scale: 1 / (1 + this.bulgeNow * 0.45) },
    };
  }

  /** キービジュアルの細胞。ヒーローから「できること」に着くまでの道のりで、合わさって弾ける */
  private kvScene(): KV | undefined {
    const next = this.panels[1];
    if (!this.kvOn || !next) return undefined;
    const p = Math.min(1, Math.max(0, this.sSmooth / Math.max(1, next.sStart)));
    if (p >= 0.999) return undefined;
    const now = performance.now();
    return kvState({ W: this.W, H: this.H, p, tOpen: (now - this.kvT0) / 1000, time: now / 1000, ptr: this.ptr });
  }

  /* ------------------------------------------------ 座標の表示と地図 */
  attachHud(els: World['hudEls']) { this.hudEls = els; this.buildMap(); }

  private hudTick = 0;
  private hud(cam: V3) {
    if (++this.hudTick % 2) return;
    const f = (v: number) => (v < 0 ? '−' : '+') + String(Math.round(Math.abs(v))).padStart(5, '0');
    const { x, y, z, cam: camEl } = this.hudEls;
    if (x) x.textContent = f(cam.x);
    if (y) y.textContent = f(cam.y);
    if (z) z.textContent = f(cam.z);
    if (camEl) {
      /* いまいる場所：渡っているあいだは、前後の点のあいだを動く */
      const cx = cam.x + this.W / 2, cy = cam.y + this.H / 2;
      const k = Math.max(0.4, 1 + cam.z / (this.P * 4));
      const mx = cx * k * this.mapScale + this.mapOff.x, my = cy * k * this.mapScale + this.mapOff.y;
      camEl.style.transform = `translate(${mx.toFixed(1)}px,${my.toFixed(1)}px)`;
    }
  }

  private buildMap() {
    const svg = this.hudEls.map;
    if (!svg || !this.panels.length) return;
    if (this.flat) { this.buildIndex(svg); return; }
    const box = svg.getBoundingClientRect();
    const bw = box.width || 96, bh = box.height || 64;
    const pts = this.panels.map((p) => this.mapPoint(p));
    const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    this.mapScale = Math.min((bw - 10) / Math.max(1, x1 - x0), (bh - 10) / Math.max(1, y1 - y0));
    this.mapOff = { x: bw / 2 - ((x0 + x1) / 2) * this.mapScale, y: bh / 2 - ((y0 + y1) / 2) * this.mapScale };
    const ns = 'http://www.w3.org/2000/svg';
    svg.replaceChildren();
    const line = document.createElementNS(ns, 'polyline');
    line.setAttribute('points', pts.map((q) => `${(q.x * this.mapScale + this.mapOff.x).toFixed(1)},${(q.y * this.mapScale + this.mapOff.y).toFixed(1)}`).join(' '));
    svg.appendChild(line);
    this.panels.forEach((p, i) => {
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', (pts[i].x * this.mapScale + this.mapOff.x).toFixed(1));
      c.setAttribute('cy', (pts[i].y * this.mapScale + this.mapOff.y).toFixed(1));
      c.setAttribute('r', '1.6');
      const t = document.createElementNS(ns, 'title');
      t.textContent = p.label;
      c.appendChild(t);
      c.addEventListener('click', () => this.travelTo(i));
      svg.appendChild(c);
    });
  }

  /** flat：右下の地図を「押せる目次」にする。節1つ＝点1つを縦に並べ、いまの節に朱の点と名前 */
  private static IDX = 16;
  private buildIndex(svg: SVGSVGElement) {
    const ns = 'http://www.w3.org/2000/svg';
    const n = this.panels.length, step = World.IDX;
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 20 ${n * step}`);
    svg.style.height = `${n * step}px`;
    this.panels.forEach((p, i) => {
      const g = document.createElementNS(ns, 'g');
      const hit = document.createElementNS(ns, 'rect');           // 指で押せる大きさ
      hit.setAttribute('x', '0'); hit.setAttribute('y', String(i * step));
      hit.setAttribute('width', '20'); hit.setAttribute('height', String(step));
      hit.setAttribute('fill', 'transparent');
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', '10'); c.setAttribute('cy', String(i * step + step / 2)); c.setAttribute('r', '2');
      const t = document.createElementNS(ns, 'title');
      t.textContent = p.label;
      g.append(hit, c, t);
      g.addEventListener('click', () => this.travelTo(i));
      svg.appendChild(g);
    });
    this.markMap(this.panelAt(window.scrollY));
  }

  private markMap(i: number) {
    if (!this.flat) return;
    const { cam, at } = this.hudEls;
    if (cam) cam.style.transform = `translate(10px,${(i + 0.5) * World.IDX}px)`;
    if (at) {
      /* 名前は、いまの点の高さに添えて、節が変わったときだけ少し出す（出しっぱなしだと本文にかかる） */
      at.textContent = this.panels[i]?.label ?? '';
      at.style.setProperty('--at-y', `${(i + 0.5) * World.IDX}px`);
      at.classList.add('on');
      clearTimeout(this.atTimer);
      this.atTimer = window.setTimeout(() => at.classList.remove('on'), 1600);
    }
  }

  /** 地図の上の点の位置（世界の座標。奥にあるものほど、少し中心へ寄せて奥行きを残す） */
  private mapPoint(p: Panel) {
    const k = Math.max(0.4, 1 + p.pos.z / (this.P * 4));
    return { x: (p.pos.x + this.W / 2) * k, y: (p.pos.y + Math.min(p.h, this.H) / 2) * k };
  }
}

/* ---------------------------------------------------------------- 小道具 */
function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** 正方形の形（QR）を、点の格子にモジュールが揃う位置と大きさに置き直す */
function snapToLattice(r: Rect, modules: number): Rect {
  const { cell, x: ox, y: oy } = dots.lattice;
  const k = Math.max(1, Math.floor(Math.min(r.w, r.h) / (modules * cell)));
  const size = modules * k * cell;
  const x = ox + Math.round((r.x + (r.w - size) / 2 - ox) / cell) * cell;
  const y = oy + Math.round((r.y + (r.h - size) / 2 - oy) / cell) * cell;
  return { x, y, w: size, h: size };
}

/** 形の縦横比を保って、矩形の中に収める */
function contain(r: Rect, aspect: number): Rect {
  const ra = r.w / Math.max(1, r.h);
  if (ra > aspect) { const w = r.h * aspect; return { x: r.x + (r.w - w) / 2, y: r.y, w, h: r.h }; }
  const h = r.w / aspect;
  return { x: r.x, y: r.y + (r.h - h) / 2, w: r.w, h };
}

/** 節の左上から要素の上端まで（変形を無視した素の寸法。節は position:absolute なので offsetParent の鎖に入る） */
function offsetIn(el: HTMLElement, root: HTMLElement) {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) { y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
  return n === root ? y : 0;
}
