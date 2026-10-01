/* 点が組む「形」の原画（アトラス）。1枚の 2D canvas に全部描いて、テクスチャにする。
   白い部分ほど点が大きくなる。少しぼかしておくと、点の大小が滑らかにつながる。

   形と意味：
   - mark     … UTUTU のロゴ（ヒーロー／フッター）
   - two      … 「2」。2人であること（宣言／数え上げ）
   - marquee  … BUSINESS × CRAFT × AI = TWO の帯（流れる文字）
   - speed    … 速さの線（原則 01）
   - grid     … 照準と升目（原則 02 精度）
   - bars     … 棒グラフ（原則 03 事業）
   - qr       … **本物のQRコード**（GOOD ORDER の公式サイトへ）。卓上のQRそのものが点の集まりなので
   - stars    … 星5つ（GOOD REVIEW）
   - floor    … 足元の楕円（ふたりのアバター）
   - fill     … 面（できることの行を塗る）

   欧文の形は Archivo で描く。**書体が届く前に描くと別の書体になる**ので、
   document.fonts で待ってから描き直す（それまでは文字の形だけ空のまま） */

import qrcode from 'qrcode-generator';
import { PRODUCT_URL } from '@/components/site/productLinks';

export type ShapeName = 'mark' | 'two' | 'marquee' | 'speed' | 'grid' | 'bars' | 'qr' | 'stars' | 'floor' | 'fill';
export type UV = [number, number, number, number];

/* 置き場所は 2048 四方の座標で書き、実際の絵は半分（1024 四方）で描く。
   点は升目の中心でしか読まないので、これで十分。2048 だとソフト描画の環境で毎フレームが極端に重くなった */
const SIZE = 2048;
const SCALE = 0.5;

/* 置き場所（px）。重ならないように手で割り付けてある */
const SLOTS: Record<ShapeName, [number, number, number, number]> = {
  marquee: [0, 0, 2048, 220],
  mark: [0, 240, 1144, 133],
  stars: [1160, 240, 880, 180],
  two: [0, 400, 440, 560],
  qr: [460, 400, 500, 500],
  grid: [980, 440, 520, 520],
  bars: [1520, 440, 500, 400],
  speed: [0, 980, 1000, 400],
  floor: [1020, 980, 600, 300],
  fill: [1640, 980, 64, 64],
};

const GLYPH_U = 'M0 0V57A76 76 0 0 0 152 57V0H130V57A54 54 0 0 1 22 57V0Z';
const GLYPH_T = 'M0 0H152V22H87V133H65V22H0Z';

export const MARQUEE_TEXT = 'BUSINESS × CRAFT × AI = TWO — ';

/* QR の周りの余白（モジュールの数）。読み取りには最低2〜4が要る */
const QR_QUIET = 2;
function makeQR() {
  const qr = qrcode(0, 'M');
  qr.addData(PRODUCT_URL.order);
  qr.make();
  return qr;
}
let qrN = 0;
/** QR の一辺のモジュール数（余白込み）。点の升目にモジュールを合わせるときに使う */
export function qrModules(): number {
  if (!qrN) qrN = makeQR().getModuleCount() + QR_QUIET * 2;
  return qrN;
}

export function uvOf(name: ShapeName): UV {
  const [x, y, w, h] = SLOTS[name];
  return [x / SIZE, y / SIZE, (x + w) / SIZE, (y + h) / SIZE];
}

/** 形の縦横比（幅 / 高さ）。印の矩形をこれに合わせると歪まない */
export function aspectOf(name: ShapeName): number {
  const [, , w, h] = SLOTS[name];
  return w / h;
}

/** Archivo の font-family（next/font が変数で渡してくる） */
export function displayFamily(): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--font-archivo').trim();
  return v || 'Arial, sans-serif';
}

export function drawAtlas(withText: boolean): ImageData {
  const cv = document.createElement('canvas');
  cv.width = SIZE * SCALE;
  cv.height = SIZE * SCALE;
  /* CPU 側に置く（GPU の canvas から読み戻すより速く、テクスチャへの受け渡しも素直） */
  const c = cv.getContext('2d', { willReadFrequently: true })!;
  c.scale(SCALE, SCALE);
  c.fillStyle = '#000';
  c.fillRect(0, 0, SIZE, SIZE);
  c.fillStyle = '#fff';
  c.strokeStyle = '#fff';

  const slot = (name: ShapeName, fn: (w: number, h: number) => void, blur = 3) => {
    const [x, y, w, h] = SLOTS[name];
    c.save();
    c.beginPath();
    c.rect(x, y, w, h);
    c.clip();
    c.translate(x, y);
    c.filter = blur ? `blur(${blur * SCALE}px)` : 'none';
    fn(w, h);
    c.restore();
  };

  /* ロゴ：1文字ずつ。字の高さ133、送り248 */
  slot('mark', () => {
    const u = new Path2D(GLYPH_U), t = new Path2D(GLYPH_T);
    for (let i = 0; i < 5; i++) {
      c.save(); c.translate(i * 248, 0); c.fill(i % 2 ? t : u); c.restore();
    }
  }, 2);

  /* 星5つ */
  slot('stars', (w, h) => {
    for (let i = 0; i < 5; i++) {
      const cx = w * (i + 0.5) / 5, cy = h / 2, R = h * 0.46, r = R * 0.42;
      c.beginPath();
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + k * Math.PI / 5;
        const rr = k % 2 ? r : R;
        c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      c.closePath();
      c.fill();
    }
  });

  /* 本物のQR（GOOD ORDER の公式サイト）。升目はぼかさない */
  slot('qr', (w) => {
    const qr = makeQR();
    const n = qr.getModuleCount();
    const quiet = QR_QUIET;
    const m = w / (n + quiet * 2);
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) {
      if (qr.isDark(r, k)) c.fillRect(Math.round((k + quiet) * m), Math.round((r + quiet) * m), Math.ceil(m), Math.ceil(m));
    }
  }, 0);

  /* 照準と升目（精度） */
  slot('grid', (w, h) => {
    c.lineWidth = 14;
    c.strokeRect(w * 0.22, h * 0.22, w * 0.56, h * 0.56);
    c.lineWidth = 10;
    c.beginPath();
    c.moveTo(w / 2, 0); c.lineTo(w / 2, h);
    c.moveTo(0, h / 2); c.lineTo(w, h / 2);
    c.stroke();
    c.beginPath(); c.arc(w / 2, h / 2, w * 0.07, 0, Math.PI * 2); c.fill();
    for (let i = 1; i < 10; i++) { const x = (w * i) / 10; c.fillRect(x - 3, h - 34, 6, i % 5 ? 18 : 34); }
  });

  /* 棒グラフ（高さは shader が伸ばす。ここは全部いちばん上まで描く） */
  slot('bars', (w, h) => {
    for (let i = 0; i < 5; i++) c.fillRect(w * (i / 5) + w * 0.03, 0, w / 5 - w * 0.06, h);
  });

  /* 速さの線 */
  slot('speed', (w, h) => {
    const rows = 14;
    for (let i = 0; i < rows; i++) {
      const y = (h * (i + 0.5)) / rows;
      const len = w * (0.25 + ((i * 37) % 11) / 22);
      const x = (w * ((i * 53) % 17)) / 17;
      const g = c.createLinearGradient(x, 0, x + len, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(1, 'rgba(255,255,255,1)');
      c.fillStyle = g;
      c.fillRect(x, y - 9, len, 18);
      c.fillRect(x - w, y - 9, len, 18);
    }
    c.fillStyle = '#fff';
  });

  /* 足元の楕円 */
  slot('floor', (w, h) => {
    c.translate(w / 2, h / 2);
    c.scale(1, h / w);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, w / 2);
    g.addColorStop(0, '#fff');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.beginPath(); c.arc(0, 0, w / 2, 0, Math.PI * 2); c.fill();
  }, 0);

  slot('fill', (w, h) => { c.fillRect(0, 0, w, h); }, 0);

  if (withText) {
    const fam = displayFamily();
    /* 「2」 */
    slot('two', (w, h) => {
      c.font = `800 ${Math.round(h * 1.02)}px ${fam}`;
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      c.fillText('2', w / 2, h * 0.88);
    });
    /* 流れる帯。1周ぶんで割り付け、端で切れ目なくつながるようにする */
    slot('marquee', (w, h) => {
      let px = h * 0.78;
      c.font = `800 ${px}px ${fam}`;
      const mw = c.measureText(MARQUEE_TEXT).width;
      px = (px * w) / mw;
      c.font = `800 ${Math.min(px, h * 0.86)}px ${fam}`;
      c.textBaseline = 'middle';
      const tw = c.measureText(MARQUEE_TEXT).width;
      c.save();
      c.scale(w / tw, 1);
      c.fillText(MARQUEE_TEXT, 0, h * 0.54);
      c.restore();
    }, 2);
  }
  return c.getImageData(0, 0, cv.width, cv.height);
}

/* ---------------------------------------------------------------- 群れの行き先 */
/** 文字や形を描いた絵から、点の行き先を拾う。格子（pitch）に揃えると、
 *  膜の点と同じ並びになり、受け渡しがつながって見える */
export function samplePoints(
  draw: (c: CanvasRenderingContext2D, w: number, h: number) => void,
  rect: { x: number; y: number; w: number; h: number },
  pitch: number,
  origin: { x: number; y: number } = { x: 0, y: 0 },
  max = 9000,
): Float32Array {
  const scale = 0.5;
  const w = Math.max(1, Math.round(rect.w * scale)), h = Math.max(1, Math.round(rect.h * scale));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const c = cv.getContext('2d', { willReadFrequently: true })!;
  c.fillStyle = '#fff';
  draw(c, w, h);
  const img = c.getImageData(0, 0, w, h).data;
  const pts: number[] = [];
  const x0 = origin.x + Math.ceil((rect.x - origin.x) / pitch) * pitch;
  const y0 = origin.y + Math.ceil((rect.y - origin.y) / pitch) * pitch;
  for (let y = y0; y < rect.y + rect.h; y += pitch) {
    for (let x = x0; x < rect.x + rect.w; x += pitch) {
      const sx = Math.floor((x - rect.x) * scale), sy = Math.floor((y - rect.y) * scale);
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
      if (img[(sy * w + sx) * 4 + 3] > 110) pts.push(x, y);
    }
  }
  /* 多すぎたら間引く（均等に） */
  const n = pts.length / 2;
  if (n <= max) return new Float32Array(pts);
  const out = new Float32Array(max * 2);
  for (let i = 0; i < max; i++) {
    const k = Math.floor((i * n) / max);
    out[i * 2] = pts[k * 2]; out[i * 2 + 1] = pts[k * 2 + 1];
  }
  return out;
}

/** ロゴを矩形いっぱいに描く（群れの行き先用） */
export function drawMark(c: CanvasRenderingContext2D, w: number, h: number) {
  const k = h / 133;
  const u = new Path2D(GLYPH_U), t = new Path2D(GLYPH_T);
  c.save();
  c.scale(k, k);
  for (let i = 0; i < 5; i++) { c.save(); c.translate(i * 248, 0); c.fill(i % 2 ? t : u); c.restore(); }
  c.restore();
  void w;
}

/** 欧文の言葉を矩形いっぱいに描く（遷移の文字） */
export function drawWord(word: string) {
  return (c: CanvasRenderingContext2D, w: number, h: number) => {
    const fam = displayFamily();
    let px = h * 0.9;
    c.font = `800 ${px}px ${fam}`;
    const tw = c.measureText(word).width;
    if (tw > w) px = (px * w) / tw;
    c.font = `800 ${px}px ${fam}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(word, w / 2, h * 0.53);
  };
}
