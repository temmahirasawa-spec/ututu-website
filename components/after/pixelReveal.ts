/* ピクセルで解ける見出し。

   読み順に1行ずつ、先端ほど粗い升目で現れ、後ろへ行くほど解像して字になる。
   升目はアクセント色（--acc）から本来の文字色（--tx）へ寄っていく。

   **字は DOM に残したまま。**canvas は解けきるまでのあいだ上に重ねるだけで、
   終わったら消して本物の字に戻す。読み上げ・検索・選択はそのまま効く。

   **行の位置と改行位置は Range から実測すること。**canvas 側で折り返しを
   組み直すと、DOM の word-break: auto-phrase と食い違い、終わりの差し替えで
   字が跳ぶ。実測なら DOM が折った通りの位置に、同じ字を置ける。

   色は #after のトークンから読む。計算済みの color は反転の途中経過を
   拾ってしまうため（.rv が color を 0.9s で遷移させている）、変数そのものを見る。 */

export type PixelReveal = { play: () => void; settle: () => void; dispose: () => void };

const LAYERS = 7;        // 帯を何段に割るか。少ないと縞に見える
const MAXB = 15;         // いちばん粗いときの升（CSSピクセル）
const BAND = 210;        // 帯の長さ（CSSピクセル）
const LINE_MS = 900;     // 1行を解き切るまで。サイトの他の動き（.rv の .9s）に合わせてある
const LINE_LAG = 0.55;   // 次の行は前の行の途中から始める（1.0 で完全に順番）

type Line = { text: string; x: number; w: number; top: number; bottom: number };

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function toRGB(v: string): number[] | null {
  const s = v.trim();
  let m = /^#([0-9a-f]{3})$/i.exec(s);
  if (m) return [0, 1, 2].map((i) => parseInt(m![1][i] + m![1][i], 16));
  m = /^#([0-9a-f]{6})$/i.exec(s);
  if (m) return [0, 2, 4].map((i) => parseInt(m![1].slice(i, i + 2), 16));
  m = /rgba?\(([^)]+)\)/i.exec(s);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (p.length >= 3) return [p[0], p[1], p[2]];
  }
  return null;
}

function mix(a: string, b: string, u: number) {
  const A = toRGB(a), B = toRGB(b);
  if (!A || !B) return u > 0.5 ? b : a;
  const r = Math.round(A[0] + (B[0] - A[0]) * u);
  const g = Math.round(A[1] + (B[1] - A[1]) * u);
  const bl = Math.round(A[2] + (B[2] - A[2]) * u);
  return `rgb(${r},${g},${bl})`;
}

/* DOM が実際に折った行を読み取る。1文字ずつ Range を当てて、
   上端が変わったところを行の切れ目とみなす */
function readLines(el: HTMLElement): Line[] {
  const node = Array.from(el.childNodes).find((n) => n.nodeType === Node.TEXT_NODE) as Text | undefined;
  const text = node?.nodeValue ?? '';
  if (!node || !text.trim()) return [];
  const base = el.getBoundingClientRect();
  const range = document.createRange();
  const lines: Line[] = [];
  let cur: Line | null = null;
  for (let i = 0; i < text.length; i++) {
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    const r = range.getBoundingClientRect();
    if (!r.width && !r.height) { if (cur) cur.text += text[i]; continue; }
    const top = r.top - base.top;
    if (!cur || Math.abs(top - cur.top) > 1) {
      cur = { text: text[i], x: r.left - base.left, w: r.width, top, bottom: r.bottom - base.top };
      lines.push(cur);
    } else {
      cur.text += text[i];
      cur.w = r.right - base.left - cur.x;
      cur.bottom = Math.max(cur.bottom, r.bottom - base.top);
    }
  }
  return lines;
}

export function createPixelReveal(el: HTMLElement): PixelReveal {
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let layers: HTMLCanvasElement[] = [];
  let lines: Line[] = [];
  let w = 0, h = 0, span = 1, total = LINE_MS;
  let raf = 0, done = false, ready = false;

  function build(): boolean {
    w = el.offsetWidth;
    h = el.offsetHeight;
    if (!w || !h) return false;
    lines = readLines(el);
    if (!lines.length) return false;

    const cs = getComputedStyle(el);
    const host = (el.closest('#after') as HTMLElement | null) ?? document.body;
    const hs = getComputedStyle(host);
    const fin = (hs.getPropertyValue('--tx') || cs.color).trim() || '#14161A';
    const acc = (hs.getPropertyValue('--acc') || fin).trim() || fin;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'pxr-cv';
      canvas.setAttribute('aria-hidden', 'true');
      el.appendChild(canvas);
    }
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx = canvas.getContext('2d');
    if (!ctx) return false;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* 原版。DOM が折った位置に、DOM と同じ字を置く */
    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    const o = off.getContext('2d');
    if (!o) return false;
    o.setTransform(dpr, 0, 0, dpr, 0, 0);
    o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    try { o.letterSpacing = cs.letterSpacing; } catch { /* 未対応でも幅が少し違うだけ */ }
    o.textBaseline = 'alphabetic';
    o.fillStyle = fin;
    const m = o.measureText('M') as TextMetrics & { fontBoundingBoxAscent?: number };
    const asc = m.fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.88;
    lines.forEach((L) => o.fillText(L.text, L.x, L.top + asc));

    /* 段ごとに、粗さと色を焼いておく。時間で変わるのは「どこを見せるか」だけなので、
       毎フレーム作り直す必要はない */
    layers = [];
    for (let k = 0; k < LAYERS; k++) {
      const u = k / (LAYERS - 1);
      const b = Math.max(1, Math.round(1 + (MAXB - 1) * u * u));
      const c = document.createElement('canvas');
      c.width = off.width;
      c.height = off.height;
      const g = c.getContext('2d');
      if (!g) continue;
      if (b === 1) {
        g.drawImage(off, 0, 0);
      } else {
        const sw = Math.max(1, Math.round(w / b));
        const sh = Math.max(1, Math.round(h / b));
        const tmp = document.createElement('canvas');
        tmp.width = sw;
        tmp.height = sh;
        const tg = tmp.getContext('2d');
        if (!tg) continue;
        tg.drawImage(off, 0, 0, sw, sh);             // 平均して縮める
        g.imageSmoothingEnabled = false;
        g.drawImage(tmp, 0, 0, sw, sh, 0, 0, sw * b * dpr, sh * b * dpr);  // 升のまま広げる
      }
      if (u > 0) {
        g.globalCompositeOperation = 'source-in';
        g.fillStyle = mix(fin, acc, u);
        g.fillRect(0, 0, c.width, c.height);
        g.globalCompositeOperation = 'source-over';
        // 先端の升は薄いと沈むので、一度だけ重ねて濃くする
        if (u > 0.5) g.drawImage(c, 0, 0);
      }
      layers.push(c);
    }

    total = LINE_MS * (1 + (lines.length - 1) * LINE_LAG);
    span = LINE_MS / total;
    ready = true;
    return true;
  }

  function draw(t: number) {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    const slice = BAND / LAYERS;
    for (let j = 0; j < lines.length; j++) {
      const L = lines[j];
      const tj = clamp01((t - j * LINE_LAG * span) / span);
      if (tj <= 0) continue;
      const lead = L.x + tj * (L.w + BAND);
      const res = lead - BAND;
      const top = j === 0 ? 0 : (lines[j - 1].bottom + L.top) / 2;
      const bot = j === lines.length - 1 ? h : (L.bottom + lines[j + 1].top) / 2;
      for (let k = 0; k < LAYERS; k++) {
        // k=0 は「解け切ったところ」も受け持つので、左端まで伸ばす
        const x0 = k === 0 ? -MAXB : res + k * slice;
        const x1 = Math.min(res + (k + 1) * slice, lead);
        if (x1 <= x0 || !layers[k]) continue;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x0, top, x1 - x0, bot - top);
        ctx.clip();
        ctx.drawImage(layers[k], 0, 0, w, h);
        ctx.restore();
      }
    }
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  /* 本物の字に戻す。**戻すときに color の遷移を効かせないこと。**
     #after h3 には反転用の transition が載っているので、そのまま外すと
     透明から 0.9 秒かけて滲み出てくる */
  function settle() {
    stop();
    done = true;
    if (ctx) ctx.clearRect(0, 0, w, h);
    el.style.transition = 'none';
    el.classList.remove('pxr-on');
    void el.offsetWidth;
    requestAnimationFrame(() => { el.style.transition = ''; });
    if (canvas) { canvas.remove(); canvas = null; ctx = null; }
    layers = [];
  }

  function play() {
    if (done) return;
    stop();
    el.classList.add('pxr-on');
    if (!ready && !build()) { settle(); return; }
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / total);
      draw(t);
      if (t < 1) raf = requestAnimationFrame(step);
      else settle();
    };
    draw(0);
    raf = requestAnimationFrame(step);
  }

  function dispose() {
    stop();
    if (canvas) { canvas.remove(); canvas = null; ctx = null; }
    layers = [];
    el.classList.remove('pxr-on');
  }

  return { play, settle, dispose };
}
