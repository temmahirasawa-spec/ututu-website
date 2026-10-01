/* ヒーローの点描（「解像」）。
   画面を升目に切り、升目ごとに1つの点を描く。点の大きさは「密度の絵」で決まり、
   密度の絵にはロゴ（UTUTU）を描いてある。

   - 読み込み直後は、点の大きさがでたらめ（＝ノイズ）。升目ごとに少しずつ時間をずらして
     本来の大きさへ揃い、ロゴが「解像」する。生成AIの拡散（ノイズを取り除いて絵にする）の見立て
   - ポインタのまわりは朱になり、点が少しふくらむ。触れていないあいだは、
     レンズがロゴの上をゆっくり巡回する（スマホでもこれが見える）
   - スクロールでヒーローを抜けるほど、ふたたびノイズに戻る

   シェーダは1枚の板に描く1本だけ。three.js は使わない（ここで読むと重い）。
   **見えていないあいだは描かない**（IntersectionObserver と visibilitychange）。
   WebGL が使えなければ何もせず、.hero-mark の SVG がそのまま見える。

   起動して、破棄を返す形（開発中は effect が2回走るので、畳み残すとループが二重になる） */

/* 正式ロゴの5文字（Mark.tsx と同じ形）。字の高さは133、字幅は152、送りは248 */
const GLYPH_U = 'M0 0V57A76 76 0 0 0 152 57V0H130V57A54 54 0 0 1 22 57V0Z';
const GLYPH_T = 'M0 0H152V22H87V133H65V22H0Z';
const MARK_H = 133;

const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uIntro, uOut, uCell, uLensR;
uniform vec2 uLens;
uniform float uLensAmt;
uniform sampler2D uDen;
uniform vec3 uInk, uShu;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 cell = floor(frag / uCell);
  vec2 c = (cell + 0.5) * uCell;
  float d = texture2D(uDen, vec2(c.x / uRes.x, 1.0 - c.y / uRes.y)).r;   // 赤＝ロゴ
  float h = hash(cell);
  float h2 = hash(cell + 17.0);

  /* 地のノイズ。ゆっくり流れる、まばらな小さい点 */
  float n = vnoise(cell * 0.09 + vec2(uTime * 0.06, -uTime * 0.04));
  float bg = smoothstep(0.68, 1.0, n) * 0.17;
  /* 文字の下は地の点を出さない（密度の絵の緑＝文字の置き場所） */
  float clearZone = texture2D(uDen, vec2(c.x / uRes.x, 1.0 - c.y / uRes.y)).g;
  bg *= 1.0 - clearZone;

  /* レンズ（ポインタ／巡回） */
  float ld = distance(c, uLens) / uLensR;
  float lens = exp(-ld * ld * 2.2) * uLensAmt;

  /* 解像の進み具合。升目ごとにずらす。レンズの中は先に揃う */
  float t = clamp(uIntro * 1.5 - h * 0.5, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  t = max(t, lens);
  t *= 1.0 - uOut * (0.35 + 0.65 * h2);

  /* ノイズの状態：でたらめな大きさ（時間でちらつく） */
  float flick = hash(cell + floor(uTime * 9.0 + h * 9.0));
  float noisy = pow(flick, 3.0) * 0.46;

  float r = mix(noisy, max(d * 0.56, bg), t);
  r += lens * d * 0.08;

  vec2 q = (frag - c) / uCell;
  float aa = 0.9 / uCell;
  float a = 1.0 - smoothstep(r - aa, r + aa, length(q));
  if (r < 0.02) a = 0.0;

  vec3 col = mix(uInk, uShu, smoothstep(0.15, 0.7, lens) * step(0.2, d));
  gl_FragColor = vec4(col * a, a);
}`;

type Opts = {
  canvas: HTMLCanvasElement; markEl: HTMLElement; hero: HTMLElement;
  /** 地の点を避ける場所（見出し・説明文）。密度の絵の緑で渡す */
  clearEls?: HTMLElement[];
};

export function startHalftone({ canvas, markEl, hero, clearEls = [] }: Opts): () => void {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return () => {};

  const prog = link(gl);
  if (!prog) return () => {};
  hero.classList.add('ht-live');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(prog);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = {
    res: U('uRes'), time: U('uTime'), intro: U('uIntro'), out: U('uOut'), cell: U('uCell'),
    lens: U('uLens'), lensR: U('uLensR'), lensAmt: U('uLensAmt'), den: U('uDen'), ink: U('uInk'), shu: U('uShu'),
  };
  gl.uniform3f(u.ink, 0.055, 0.055, 0.051);
  gl.uniform3f(u.shu, 1.0, 0.302, 0.122);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(u.den, 0);

  const den = document.createElement('canvas');
  const dctx = den.getContext('2d')!;
  const pU = new Path2D(GLYPH_U), pT = new Path2D(GLYPH_T);

  let W = 0, H = 0, dpr = 1, cssCell = 8, markBox = { x: 0, y: 0, w: 0, h: 0 };

  function layout() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    canvas.width = W; canvas.height = H;
    gl!.viewport(0, 0, W, H);

    const m = markEl.getBoundingClientRect();
    markBox = { x: m.left - r.left, y: m.top - r.top, w: m.width, h: m.height };
    /* 升目の大きさ：ロゴの字の高さに 13〜15 個ならぶくらい。小さすぎると点に見えない */
    cssCell = Math.max(4, Math.min(11, markBox.h / 14));

    /* 密度の絵は半分の解像度で十分（升目の中心でしか読まない） */
    const s = 0.5;
    den.width = Math.ceil(r.width * s); den.height = Math.ceil(r.height * s);
    dctx.setTransform(1, 0, 0, 1, 0, 0);
    dctx.fillStyle = '#000'; dctx.fillRect(0, 0, den.width, den.height);
    dctx.filter = `blur(${(cssCell * s * 0.45).toFixed(2)}px)`;
    const k = (markBox.h * s) / MARK_H;
    dctx.setTransform(k, 0, 0, k, markBox.x * s, markBox.y * s);
    dctx.fillStyle = '#f00';
    for (let i = 0; i < 5; i++) {
      dctx.save(); dctx.translate(i * 248, 0); dctx.fill(i % 2 ? pT : pU); dctx.restore();
    }
    /* 文字の置き場所を緑で。'lighter' で赤に足す（赤を消さない） */
    dctx.setTransform(s, 0, 0, s, 0, 0);
    dctx.globalCompositeOperation = 'lighter';
    dctx.filter = `blur(${(cssCell * s * 2).toFixed(2)}px)`;
    dctx.fillStyle = '#0f0';
    clearEls.forEach((el) => {
      const b = el.getBoundingClientRect();
      const pad = cssCell * 2;
      dctx.fillRect(b.left - r.left - pad, b.top - r.top - pad, b.width + pad * 2, b.height + pad * 2);
    });
    dctx.globalCompositeOperation = 'source-over';
    dctx.filter = 'none';
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, den);

    gl!.uniform2f(u.res, W, H);
    gl!.uniform1f(u.cell, cssCell * dpr);
    gl!.uniform1f(u.lensR, Math.max(markBox.h * 0.9, 90) * dpr);
  }

  /* ---- ポインタ。触れていない間は、レンズがロゴの上を巡回する ---- */
  let px = -1e5, py = -1e5, lastMove = -1e5;
  let lx = 0, ly = 0, lensAmt = 0;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;          // スマホは巡回に任せる
    const r = canvas.getBoundingClientRect();
    px = (e.clientX - r.left) * dpr; py = H - (e.clientY - r.top) * dpr;
    lastMove = performance.now();
  };
  hero.addEventListener('pointermove', onMove, { passive: true });

  /* ---- 描くかどうか ---- */
  let visible = true, raf = 0;
  const io = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    if (visible) kick();
  });
  io.observe(hero);
  const onVis = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', onVis);

  const ro = new ResizeObserver(() => { layout(); if (reduce) frame(performance.now()); });
  ro.observe(canvas);

  const t0 = performance.now();
  let prev = t0;
  function frame(now: number) {
    raf = 0;
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
    const time = (now - t0) / 1000;
    const intro = reduce ? 1 : Math.min(1, Math.max(0, (time - 0.15) / 2.4));
    const out = Math.min(1, Math.max(0, window.scrollY / Math.max(1, hero.offsetHeight * 0.9)));

    /* レンズの目標：最近ポインタが動いていればポインタ、そうでなければ巡回 */
    const idle = now - lastMove > 2200;
    let tx: number, ty: number;
    if (!idle) { tx = px; ty = py; }
    else {
      const a = time * 0.23;
      tx = (markBox.x + markBox.w * (0.5 + 0.46 * Math.sin(a))) * dpr;
      ty = H - (markBox.y + markBox.h * (0.5 + 0.35 * Math.sin(a * 2.3))) * dpr;
    }
    const f = 1 - Math.pow(0.0008, dt);              // 追従のなめらかさ（フレームレートに依らない）
    lx += (tx - lx) * f; ly += (ty - ly) * f;
    const want = reduce ? 0 : Math.min(1, Math.max(0, (time - 1.6) / 0.8));
    lensAmt += (want - lensAmt) * f;

    gl!.clearColor(0, 0, 0, 0); gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniform1f(u.time, time);
    gl!.uniform1f(u.intro, intro);
    gl!.uniform1f(u.out, reduce ? 0 : out);
    gl!.uniform2f(u.lens, lx, ly);
    gl!.uniform1f(u.lensAmt, lensAmt);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    if (!reduce) kick();
  }
  function kick() {
    if (raf || !visible || document.hidden || reduce) return;
    raf = requestAnimationFrame(frame);
  }

  layout();
  lx = (markBox.x + markBox.w * 0.5) * dpr; ly = H - (markBox.y + markBox.h * 0.5) * dpr;
  if (reduce) frame(performance.now()); else kick();

  return () => {
    cancelAnimationFrame(raf); raf = 0; visible = false;
    io.disconnect(); ro.disconnect();
    hero.removeEventListener('pointermove', onMove);
    document.removeEventListener('visibilitychange', onVis);
    hero.classList.remove('ht-live');
    gl.deleteTexture(tex); gl.deleteBuffer(buf); gl.deleteProgram(prog);
  };
}

function link(gl: WebGLRenderingContext): WebGLProgram | null {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const v = sh(gl.VERTEX_SHADER, VERT), f = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!v || !f) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(p)); return null; }
  return p;
}
