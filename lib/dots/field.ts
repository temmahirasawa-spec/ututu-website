/* 点描の司令塔（サイトに1つだけ）。layout の DotField が起動し、ページをまたいで生き続ける。

   キャンバスは2枚：
   - 奥（.dots-back）… 地と、うねる網点の膜。中身（文字・映像）の後ろ
   - 手前（.dots-front）… ページ遷移の覆いと、群れの粒。中身の上。ふだんは何も描かない

   ページ側（World や会社概要）は setScene() で「いま画面のどこに、どの形を置くか／
   どこが文字か」を毎フレーム渡す。座標はすべて画面の css px。

   **WebGL が使えなければ何もしない。**地の色は CSS（--g）が塗っているので、
   点が無いだけで、ページはそのまま読める。 */

import { drawAtlas, drawMark, drawWord, samplePoints, uvOf, type ShapeName } from './atlas';
import { fullscreenTri, program, rgb, target, uniforms, type Target } from './gl';
import * as SH from './shaders';

/* ---------------------------------------------------------------- 色 */
export type ThemeName = 'paper' | 'ink' | 'shu' | 'order' | 'review';
type Theme = { g: string; fg: string; acc: string; tint: string };
/* CSS 側の同じ値は globals.css の html[data-ground=…]。**片方だけ変えないこと** */
export const THEMES: Record<ThemeName, Theme> = {
  paper: { g: '#ECE9E1', fg: '#0E0E0D', acc: '#FF4D1F', tint: '#FF4D1F' },
  ink: { g: '#0E0E0D', fg: '#ECE9E1', acc: '#FF4D1F', tint: '#FF4D1F' },
  shu: { g: '#FF4D1F', fg: '#0E0E0D', acc: '#ECE9E1', tint: '#0E0E0D' },
  order: { g: '#FAC03D', fg: '#222460', acc: '#FA3524', tint: '#222460' },
  review: { g: '#34CA9B', fg: '#233029', acc: '#E53A0A', tint: '#FFBC11' },
};

/* ---------------------------------------------------------------- 印と場面 */
export const MODE = { still: 0, marquee: 1, bars: 2, speed: 3, stars: 4, qr: 5, fill: 6, floor: 7, precision: 8 } as const;

export type Stamp = {
  shape: ShapeName;
  /** 画面上の矩形（css px、左上と大きさ） */
  x: number; y: number; w: number; h: number;
  /** 0..1 */
  k: number;
  mode?: number;
  scatter?: number;
  /** 印の色で描く（THEMES の tint） */
  tint?: boolean;
  e?: [number, number, number, number];
};
export type Zone = [number, number, number, number];
export type Mood = { veins: number; blobs: number; dust: number; speed: number; warp: number };
export type Scene = {
  stamps?: Stamp[];
  zones?: Zone[];
  mood?: Partial<Mood>;
  /** 格子の原点のずらし（カメラの移動に合わせた視差）と縮尺 */
  lattice?: { x: number; y: number; scale: number };
};
type SceneFn = (now: number) => Scene;

const MOOD0: Mood = { veins: 1, blobs: 0.35, dust: 1, speed: 1, warp: 0.55 };

/* ---------------------------------------------------------------- 本体 */
class Field {
  private back?: HTMLCanvasElement;
  private front?: HTMLCanvasElement;
  private bg?: WebGLRenderingContext;
  private fg?: WebGLRenderingContext;
  private pCells?: WebGLProgram;
  private pDots?: WebGLProgram;
  private pCover?: WebGLProgram;
  private pSwarm?: WebGLProgram;
  private uC?: ReturnType<typeof uniformsCells>;
  private uD?: ReturnType<typeof uniformsDots>;
  private uK?: ReturnType<typeof uniformsCover>;
  private uS?: ReturnType<typeof uniformsSwarm>;
  private triB?: WebGLBuffer | null;
  private triF?: WebGLBuffer | null;
  private cells: Target | null = null;
  private atlas?: WebGLTexture | null;
  private seedBuf?: WebGLBuffer | null;
  private tgtBuf?: WebGLBuffer | null;

  ok = false;
  reduce = false;
  private backOn = true;
  private raf = 0;
  private t0 = 0;
  private last = 0;
  private W = 0;
  private H = 0;
  private dpr = 1;
  private cell = 9;
  private lastCell = 9;
  private lastOrigin = { x: 0, y: 0 };

  private theme: ThemeName = 'paper';
  private col = { g: rgb(THEMES.paper.g), fg: rgb(THEMES.paper.fg), acc: rgb(THEMES.paper.acc), tint: rgb(THEMES.paper.tint) };
  private wipe: null | { to: ThemeName; x: number; y: number; t0: number; dur: number; flipped: boolean } = null;
  private dotA = 1;
  private inverted = false;
  private mood: Mood = { ...MOOD0 };
  private scene: SceneFn | null = null;
  private introT0 = -1;

  private ptr = { x: -1e4, y: -1e4, k: 0, want: 0, hold: 0, holding: false, downAt: 0 };
  private rips: { x: number; y: number; t0: number; s: number }[] = [];

  private cover: null | { x: number; y: number; t0: number; dur: number; dir: 1 | -1; col: [number, number, number]; done?: () => void; fired: boolean } = null;
  private coverHold: [number, number, number] | null = null;
  private swarm: null | { n: number; t0: number; dur: number; outT0: number; outDur: number; col: [number, number, number]; size: number; from: [number, number]; spawn: number; alpha: number; fadeT0: number; done?: () => void; fired: boolean } = null;

  /* -------------------------------------------- 起動 */
  init(): boolean {
    if (this.ok || typeof window === 'undefined') return this.ok;
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mk = (cls: string) => {
      const c = document.createElement('canvas');
      c.className = cls;
      c.setAttribute('aria-hidden', 'true');
      document.body.prepend(c);
      return c;
    };
    this.back = mk('dots-back');
    this.front = mk('dots-front');
    const opts: WebGLContextAttributes = { antialias: false, alpha: false, premultipliedAlpha: true, powerPreference: 'high-performance' };
    const bg = this.back.getContext('webgl', opts);
    const fg = this.front.getContext('webgl', { ...opts, alpha: true });
    if (!bg || !fg) { this.teardownCanvases(); return false; }
    this.bg = bg;
    this.fg = fg;

    this.pCells = program(bg, SH.VS_TRI, SH.FS_CELLS) ?? undefined;
    this.pDots = program(bg, SH.VS_TRI, SH.FS_DOTS) ?? undefined;
    this.pCover = program(fg, SH.VS_TRI, SH.FS_COVER) ?? undefined;
    this.pSwarm = program(fg, SH.VS_SWARM, SH.FS_SWARM) ?? undefined;
    if (!this.pCells || !this.pDots || !this.pCover || !this.pSwarm) { this.teardownCanvases(); return false; }
    this.uC = uniformsCells(bg, this.pCells);
    this.uD = uniformsDots(bg, this.pDots);
    this.uK = uniformsCover(fg, this.pCover);
    this.uS = uniformsSwarm(fg, this.pSwarm);
    this.triB = fullscreenTri(bg);
    this.triF = fullscreenTri(fg);
    this.seedBuf = fg.createBuffer();
    this.tgtBuf = fg.createBuffer();

    this.atlas = bg.createTexture();
    this.uploadAtlas(false);
    /* 欧文の形は書体が届いてから描き直す */
    /* **待つのは先頭の書体だけ。**next/font の代替書体（"Archivo Fallback"）まで含めると、
       端末にその元の書体が無いとき NetworkError で失敗する（ヘッドレスで実際に起きた） */
    const fam = getComputedStyle(document.documentElement).getPropertyValue('--font-archivo').split(',')[0].trim();
    const ready = fam ? document.fonts?.load(`800 120px ${fam}`) : undefined;
    (ready ?? Promise.resolve()).catch(() => undefined).then(() => this.uploadAtlas(true));

    this.back.addEventListener('webglcontextlost', this.onLost);
    this.ok = true;
    this.resize();
    window.addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.onVis);
    window.addEventListener('pointermove', this.onMove, { passive: true });
    window.addEventListener('pointerdown', this.onDown, { passive: true });
    window.addEventListener('pointerup', this.onUp, { passive: true });
    window.addEventListener('pointercancel', this.onUp, { passive: true });
    window.addEventListener('scroll', this.kick, { passive: true });
    document.documentElement.classList.add('dots-live');
    this.t0 = performance.now();
    this.last = this.t0;
    this.kick();
    return true;
  }

  private teardownCanvases() {
    this.back?.remove();
    this.front?.remove();
    this.back = this.front = undefined;
  }

  private onLost = (e: Event) => {
    e.preventDefault();
    this.ok = false;
    cancelAnimationFrame(this.raf);
    document.documentElement.classList.remove('dots-live');
    this.teardownCanvases();
  };

  private uploadAtlas(withText: boolean) {
    const gl = this.bg;
    if (!gl || !this.atlas) return;
    const img = drawAtlas(withText);
    gl.bindTexture(gl.TEXTURE_2D, this.atlas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, img.width, img.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(img.data.buffer));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.kick();
  }

  private resize = () => {
    if (!this.back || !this.front) return;
    const r = this.back.getBoundingClientRect();
    this.W = Math.max(1, r.width);
    this.H = Math.max(1, r.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const c of [this.back, this.front]) {
      c.width = Math.round(this.W * this.dpr);
      c.height = Math.round(this.H * this.dpr);
    }
    /* 升目：PC で 9px 前後、スマホで 6.5px。小さすぎると点に見えず、大きすぎると粗い */
    this.cell = Math.max(6.5, Math.min(10, this.W / 160));
    this.kick();
  };

  private onVis = () => { if (!document.hidden) { this.last = performance.now(); this.kick(); } };

  /* -------------------------------------------- 操作 */
  private onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch' && !this.ptr.holding) return;
    this.ptr.x = e.clientX;
    this.ptr.y = e.clientY;
    this.ptr.want = 1;
    this.kick();
  };
  private onDown = (e: PointerEvent) => {
    this.ptr.x = e.clientX;
    this.ptr.y = e.clientY;
    this.ptr.downAt = performance.now();
    /* 文字や押せるものの上では長押しにしない（選択やリンクの邪魔をする） */
    const el = e.target as Element | null;
    this.ptr.holding = !el?.closest?.('a,button,input,textarea,label,select,video,p,h1,h2,h3,li,dd,dt');
    if (e.pointerType === 'touch') this.ptr.want = 1;
    this.ripple(e.clientX, e.clientY, 1);
  };
  private onUp = (e: PointerEvent) => {
    const held = this.ptr.hold;
    if (this.ptr.holding && held > 0.3) this.ripple(this.ptr.x, this.ptr.y, 1 + held);   // ため込んだぶん弾ける
    this.ptr.holding = false;
    if (e.pointerType === 'touch') this.ptr.want = 0;
  };

  ripple(x: number, y: number, s = 1) {
    if (!this.ok || this.reduce) return;
    this.rips.push({ x, y, t0: performance.now(), s });
    if (this.rips.length > 6) this.rips.shift();
    this.kick();
  }

  /** ポインタの効きを外から止める（メニューを開いたときなど） */
  pointerOff() { this.ptr.want = 0; }

  /* -------------------------------------------- 色 */
  get ground() { return this.theme; }

  /** 地の色を変える。wipe なら起点から網点で塗り替える（文字の色は半分のところで切り替わる） */
  setTheme(name: ThemeName, opt: { wipe?: boolean; x?: number; y?: number; dur?: number } = {}) {
    if (name === this.theme && !this.wipe) return;
    if (this.wipe && this.wipe.to === name) return;
    if (!this.ok || this.reduce || !opt.wipe || !this.backOn) {
      this.wipe = null;
      this.applyTheme(name);
      document.documentElement.dataset.ground = name;
      this.kick();
      return;
    }
    this.wipe = { to: name, x: opt.x ?? this.W / 2, y: opt.y ?? this.H / 2, t0: performance.now(), dur: opt.dur ?? 620, flipped: false };
    this.kick();
  }

  private applyTheme(name: ThemeName) {
    this.theme = name;
    const t = THEMES[name];
    this.col = { g: rgb(t.g), fg: rgb(t.fg), acc: rgb(t.acc), tint: rgb(t.tint) };
    if (this.inverted) [this.col.g, this.col.fg] = [this.col.fg, this.col.g];
  }

  /** 色を突然反転する（地と点・文字が入れ替わる） */
  invert(on = !this.inverted) {
    this.inverted = on;
    document.documentElement.classList.toggle('inverted', on);
    this.applyTheme(this.theme);
    this.kick();
  }

  /* -------------------------------------------- 場面 */
  setScene(fn: SceneFn | null) { this.scene = fn; this.kick(); }

  /** 奥の膜を描くか。縦並びのトップ（動きを止める設定・?flow）では各節が自分の地を塗り、
      膜はその下に隠れて見えないので、描くのをやめる（スクロールのたびに描き直すのは無駄） */
  setBack(on: boolean) {
    if (this.backOn === on) return;
    this.backOn = on;
    if (this.back) this.back.style.visibility = on ? '' : 'hidden';
    this.kick();
  }

  /** 読み込み直後のノイズ → 解像 */
  intro() { this.introT0 = performance.now(); this.kick(); }

  get cellSize() { return this.cell; }

  /** いまの格子（升目の大きさと原点）。形を格子にぴったり合わせたいとき（QR）に使う */
  get lattice() { return { cell: this.lastCell, x: this.lastOrigin.x, y: this.lastOrigin.y }; }

  /* -------------------------------------------- 手前：覆いと群れ */
  /** 画面を網点で覆う。言葉があれば、粒が集まってその言葉になる */
  coverIn(opt: { x: number; y: number; color: string; word?: string; wordColor?: string }): Promise<void> {
    if (!this.ok) return Promise.resolve();
    if (this.reduce) {
      this.coverHold = rgb(opt.color);
      this.cover = null;
      this.kick();
      return Promise.resolve();
    }
    return new Promise((res) => {
      this.cover = { x: opt.x, y: opt.y, t0: performance.now(), dur: 760, dir: 1, col: rgb(opt.color), done: res, fired: false };
      if (opt.word) this.swarmWord(opt.word, opt.wordColor ?? '#ECE9E1', [opt.x, opt.y]);
      this.kick();
    });
  }

  /** 覆いを剥がす。粒は四方へ散る */
  coverOut(opt: { x?: number; y?: number } = {}): Promise<void> {
    if (!this.ok) return Promise.resolve();
    const col = this.cover?.col ?? this.coverHold;
    this.coverHold = null;
    if (!col || this.reduce) { this.cover = null; this.swarm = null; this.kick(); return Promise.resolve(); }
    return new Promise((res) => {
      this.cover = { x: opt.x ?? this.W / 2, y: opt.y ?? this.H / 2, t0: performance.now() + 120, dur: 900, dir: -1, col, done: res, fired: false };
      if (this.swarm) { this.swarm.outT0 = performance.now() + 60; this.swarm.outDur = 1000; }
      this.kick();
    });
  }

  private swarmWord(word: string, color: string, from: [number, number]) {
    const W = this.W, H = this.H;
    const rect = { x: W * 0.06, y: H * 0.3, w: W * 0.88, h: Math.min(H * 0.34, W * 0.2) };
    rect.y = (H - rect.h) / 2;
    const pitch = Math.max(6, Math.round(rect.h / 16));
    const pts = samplePoints(drawWord(word), rect, pitch, { x: 0, y: 0 }, 7000);
    this.startSwarm(pts, { color, size: pitch * 0.92, from, spawn: 0.55, dur: 1000 });
  }

  /** 粒を集めて形にする（ヒーローのロゴ）。終わったら膜の印に引き継ぐ */
  assemble(shape: 'mark', rect: { x: number; y: number; w: number; h: number }, color: string): Promise<void> {
    if (!this.ok || this.reduce) return Promise.resolve();
    /* 膜の点と同じ格子に降ろす（引き継いだときに、点の位置がつながって見える） */
    const pitch = this.lastCell;
    const o = this.lastOrigin;
    void shape;
    const pts = samplePoints(drawMark, rect, pitch, { x: o.x + pitch * 0.5, y: o.y + pitch * 0.5 }, 9000);
    return new Promise((res) => {
      this.startSwarm(pts, { color, size: pitch * 0.82, from: [this.W / 2, this.H], spawn: 0, dur: 1500, done: res });
    });
  }

  /** 群れを消す（膜に引き継いだあと） */
  fadeSwarm(ms = 380) {
    if (this.swarm) { this.swarm.fadeT0 = performance.now(); this.swarm.outDur = ms; this.kick(); }
  }

  private startSwarm(pts: Float32Array, o: { color: string; size: number; from: [number, number]; spawn: number; dur: number; done?: () => void }) {
    const gl = this.fg!;
    const n = pts.length / 2;
    if (!n) { o.done?.(); return; }
    const seeds = new Float32Array(n * 4);
    for (let i = 0; i < n * 4; i++) seeds[i] = Math.random();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.seedBuf!);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tgtBuf!);
    gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);
    this.swarm = {
      n, t0: performance.now(), dur: o.dur, outT0: -1, outDur: 1000, col: rgb(o.color), size: o.size,
      from: o.from, spawn: o.spawn, alpha: 1, fadeT0: -1, done: o.done, fired: false,
    };
    this.kick();
  }

  /* -------------------------------------------- 描画 */
  kick = () => {
    if (!this.ok || this.raf || document.hidden) return;
    this.raf = requestAnimationFrame(this.frame);
  };

  private frame = (now: number) => {
    this.raf = 0;
    if (!this.ok) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const time = this.reduce ? 12.0 : (now - this.t0) / 1000;
    const busy = this.backOn ? this.drawBack(now, time, dt) : false;
    const fx = this.drawFront(now, time);
    /* 動きを止める設定では、変化があったときだけ描く */
    if (!this.reduce || busy || fx) this.kick();
  };

  private drawBack(now: number, time: number, dt: number): boolean {
    const gl = this.bg!, uC = this.uC!, uD = this.uD!;
    const sc = this.scene ? this.scene(now) : {};
    /* 雰囲気はなめらかに追従 */
    const want = { ...MOOD0, ...(sc.mood ?? {}) };
    const f = 1 - Math.pow(0.02, dt);
    (Object.keys(this.mood) as (keyof Mood)[]).forEach((k) => { this.mood[k] += (want[k] - this.mood[k]) * f; });

    const lat = sc.lattice ?? { x: 0, y: -window.scrollY * 0.35, scale: 1 };
    const cell = this.cell * Math.max(0.5, Math.min(1.6, lat.scale));
    const ox = mod(lat.x, cell), oy = mod(lat.y, cell);
    this.lastCell = cell;
    this.lastOrigin = { x: ox, y: oy };
    const gw = Math.ceil(this.W / cell) + 5, gh = Math.ceil(this.H / cell) + 5;
    this.cells = target(gl, gw, gh, this.cells);
    if (!this.cells) return false;

    /* ポインタ */
    const pf = 1 - Math.pow(0.004, dt);
    this.ptr.k += (this.ptr.want - this.ptr.k) * pf;
    if (this.ptr.holding && now - this.ptr.downAt > 260) this.ptr.hold = Math.min(1.4, this.ptr.hold + dt * 1.1);
    else this.ptr.hold = Math.max(0, this.ptr.hold - dt * 3);

    /* 波紋 */
    this.rips = this.rips.filter((r) => now - r.t0 < 2300);
    const rip = new Float32Array(24);
    this.rips.forEach((r, i) => { rip.set([r.x, r.y, (now - r.t0) / 1000, r.s], i * 4); });

    /* 印 */
    const st = (sc.stamps ?? []).filter((s) => s.k > 0.002).slice(0, 6);
    const sr = new Float32Array(24), su = new Float32Array(24), sp = new Float32Array(24), se = new Float32Array(24);
    st.forEach((s, i) => {
      sr.set([s.x + s.w / 2, s.y + s.h / 2, s.w / 2, s.h / 2], i * 4);
      su.set(uvOf(s.shape), i * 4);
      sp.set([s.k, s.mode ?? 0, s.scatter ?? 0, s.tint ? 1 : 0], i * 4);
      se.set(s.e ?? [0, 0, 0, 0], i * 4);
    });
    const zn = new Float32Array(48);
    (sc.zones ?? []).slice(0, 12).forEach((z, i) => zn.set(z, i * 4));

    /* 解像の進み */
    const intro = this.introT0 < 0 ? 1 : Math.min(1, Math.max(0, (now - this.introT0 - 150) / 2300));

    /* ---- pass1 ---- */
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.cells.fb);
    gl.viewport(0, 0, gw, gh);
    gl.useProgram(this.pCells!);
    bindTri(gl, this.pCells!, this.triB!);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.atlas!);
    gl.uniform1i(uC.u_atlas, 0);
    gl.uniform2f(uC.u_origin, ox, oy);
    gl.uniform1f(uC.u_cell, cell);
    gl.uniform1f(uC.u_time, time);
    gl.uniform4f(uC.u_mood, this.mood.veins, this.mood.blobs, this.mood.dust, this.mood.speed);
    gl.uniform1f(uC.u_intro, intro);
    gl.uniform3f(uC.u_ptr, this.ptr.x, this.ptr.y, this.reduce ? 0 : this.ptr.k);
    gl.uniform1f(uC.u_lensR, 110 + this.ptr.hold * 60);
    gl.uniform4fv(uC['u_rip[0]'], rip);
    gl.uniform4fv(uC['u_sr[0]'], sr);
    gl.uniform4fv(uC['u_su[0]'], su);
    gl.uniform4fv(uC['u_sp[0]'], sp);
    gl.uniform4fv(uC['u_se[0]'], se);
    gl.uniform4fv(uC['u_zone[0]'], zn);
    gl.uniform1f(uC.u_zsoft, cell * 2.2);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* ---- 塗り替えの進み ---- */
    let wipeOn = 0, wipeP = 0, wc: [number, number, number] = this.col.g;
    if (this.wipe) {
      const w = this.wipe;
      wipeP = Math.min(1, (now - w.t0) / w.dur);
      const t = THEMES[w.to];
      wc = rgb(this.inverted ? t.fg : t.g);
      wipeOn = 1;
      if (!w.flipped && wipeP > 0.45) { w.flipped = true; document.documentElement.dataset.ground = w.to; }
      if (wipeP >= 1) {
        this.applyTheme(w.to);
        this.wipe = null;
        wipeOn = 0;
        this.dotA = 0;
      }
    }
    this.dotA = Math.min(1, this.dotA + dt * 3.2);

    /* ---- pass2 ---- */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.back!.width, this.back!.height);
    gl.useProgram(this.pDots!);
    bindTri(gl, this.pDots!, this.triB!);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.cells.tex);
    gl.uniform1i(uD.u_cells, 0);
    gl.uniform2f(uD.u_grid, gw, gh);
    gl.uniform1f(uD.u_cell, cell);
    gl.uniform2f(uD.u_origin, ox, oy);
    gl.uniform2f(uD.u_view, this.W, this.H);
    gl.uniform1f(uD.u_dpr, this.dpr);
    gl.uniform1f(uD.u_time, time);
    gl.uniform1f(uD.u_warp, this.reduce ? 0 : this.mood.warp);
    gl.uniform3f(uD.u_ptr, this.ptr.x, this.ptr.y, this.reduce ? 0 : this.ptr.k);
    gl.uniform1f(uD.u_pull, 0.16 + this.ptr.hold * 0.55);
    gl.uniform1f(uD.u_lensR, 110 + this.ptr.hold * 60);
    gl.uniform4fv(uD['u_rip[0]'], rip);
    gl.uniform3fv(uD.u_g, this.col.g);
    gl.uniform3fv(uD.u_fg, this.col.fg);
    gl.uniform3fv(uD.u_acc, this.col.acc);
    gl.uniform3fv(uD.u_tint, this.col.tint);
    gl.uniform4f(uD.u_wipe, this.wipe?.x ?? 0, this.wipe?.y ?? 0, wipeP, wipeOn);
    gl.uniform3fv(uD.u_wc, wc);
    gl.uniform1f(uD.u_dotA, this.dotA);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    return !!this.wipe || this.dotA < 1 || intro < 1;
  }

  private frontDirty = false;

  private drawFront(now: number, time: number): boolean {
    const gl = this.fg!;
    const active = !!this.cover || !!this.swarm || !!this.coverHold;
    if (!active) {
      if (this.frontDirty) {
        gl.viewport(0, 0, this.front!.width, this.front!.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.frontDirty = false;
        this.front!.style.visibility = 'hidden';
      }
      return false;
    }
    this.frontDirty = true;
    this.front!.style.visibility = 'visible';
    gl.viewport(0, 0, this.front!.width, this.front!.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    /* 覆い */
    if (this.coverHold && !this.cover) {
      gl.clearColor(this.coverHold[0], this.coverHold[1], this.coverHold[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    if (this.cover) {
      const c = this.cover;
      const p = Math.max(0, Math.min(1, (now - c.t0) / c.dur));
      const e = c.dir > 0 ? easeInOut(p) : easeInOut(p);
      const uK = this.uK!;
      gl.useProgram(this.pCover!);
      bindTri(gl, this.pCover!, this.triF!);
      gl.uniform2f(uK.u_view, this.W, this.H);
      gl.uniform1f(uK.u_dpr, this.dpr);
      gl.uniform1f(uK.u_time, time);
      gl.uniform1f(uK.u_size, Math.max(12, Math.min(22, this.W / 70)));
      gl.uniform4f(uK.u_cov, c.x, c.y, e, c.dir);
      gl.uniform3fv(uK.u_col, c.col);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (p >= 1 && !c.fired) {
        c.fired = true;
        c.done?.();
        if (c.dir > 0) { this.coverHold = c.col; this.cover = null; }
        else { this.cover = null; }
      }
    }

    /* 群れ */
    if (this.swarm) {
      const s = this.swarm;
      const t = Math.min(1, (now - s.t0) / s.dur);
      const out = s.outT0 > 0 ? Math.max(0, Math.min(1, (now - s.outT0) / s.outDur)) : 0;
      const fade = s.fadeT0 > 0 ? Math.max(0, 1 - (now - s.fadeT0) / s.outDur) : 1;
      if (t >= 1 && !s.fired) { s.fired = true; s.done?.(); }
      const uS = this.uS!;
      gl.useProgram(this.pSwarm!);
      const la = gl.getAttribLocation(this.pSwarm!, 'a_seed');
      const lb = gl.getAttribLocation(this.pSwarm!, 'a_target');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.seedBuf!);
      gl.enableVertexAttribArray(la);
      gl.vertexAttribPointer(la, 4, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.tgtBuf!);
      gl.enableVertexAttribArray(lb);
      gl.vertexAttribPointer(lb, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(uS.u_view, this.W, this.H);
      gl.uniform1f(uS.u_dpr, this.dpr);
      gl.uniform1f(uS.u_time, time);
      gl.uniform1f(uS.u_t, t);
      gl.uniform1f(uS.u_out, out);
      gl.uniform2f(uS.u_from, s.from[0], s.from[1]);
      gl.uniform1f(uS.u_spawn, s.spawn);
      gl.uniform1f(uS.u_size, s.size);
      gl.uniform3fv(uS.u_col, s.col);
      gl.uniform1f(uS.u_alpha, fade);
      gl.drawArrays(gl.POINTS, 0, s.n);
      gl.disableVertexAttribArray(la);
      gl.disableVertexAttribArray(lb);
      if (out >= 1 || fade <= 0) this.swarm = null;
    }
    gl.disable(gl.BLEND);
    return true;
  }
}

/* ---------------------------------------------------------------- 小道具 */
function mod(a: number, n: number) { return ((a % n) + n) % n; }
function easeInOut(t: number) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function bindTri(gl: WebGLRenderingContext, p: WebGLProgram, b: WebGLBuffer) {
  const loc = gl.getAttribLocation(p, 'a_p');
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
}

function uniformsCells(gl: WebGLRenderingContext, p: WebGLProgram) {
  return uniforms(gl, p, ['u_origin', 'u_cell', 'u_time', 'u_mood', 'u_intro', 'u_ptr', 'u_lensR', 'u_rip[0]', 'u_sr[0]', 'u_su[0]', 'u_sp[0]', 'u_se[0]', 'u_zone[0]', 'u_zsoft', 'u_atlas'] as const);
}
function uniformsDots(gl: WebGLRenderingContext, p: WebGLProgram) {
  return uniforms(gl, p, ['u_cells', 'u_grid', 'u_cell', 'u_origin', 'u_view', 'u_dpr', 'u_time', 'u_warp', 'u_ptr', 'u_pull', 'u_lensR', 'u_rip[0]', 'u_g', 'u_fg', 'u_acc', 'u_tint', 'u_wipe', 'u_wc', 'u_dotA'] as const);
}
function uniformsCover(gl: WebGLRenderingContext, p: WebGLProgram) {
  return uniforms(gl, p, ['u_view', 'u_dpr', 'u_time', 'u_size', 'u_cov', 'u_col'] as const);
}
function uniformsSwarm(gl: WebGLRenderingContext, p: WebGLProgram) {
  return uniforms(gl, p, ['u_view', 'u_dpr', 'u_time', 'u_t', 'u_out', 'u_from', 'u_spawn', 'u_size', 'u_col', 'u_alpha'] as const);
}

export const dots = new Field();
