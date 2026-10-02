/* キービジュアルの「細胞」（2026-10-02 本人の発案から）。

   ファーストビューだけは、点の世界ではなく**なめらかな世界**にしておく。
   墨の細胞＝ビジネス、朱の細胞＝クリエイティブ。離れた2つがゆっくり息をしている。
   **文字の名札は付けない**（2026-10-02 本人判断：色の違いで伝える）。
   スクロールすると（ヒーローを抜けるあいだに）：
     1) 2つが近づいて、1つになる（メタボール。縁がつながる）
     2) 1つになった細胞が膨らんで、画面を満たす
     3) 細胞が点に変わって弾ける。**このあいだは細胞の点だけ**（膜の点は出さない）
     4) 「できること」に着くところで、すでにうねっている膜の世界が現れる
   スクロールに結びつけてあるので、戻れば逆再生される。
   初めて開いたときだけ、核から外へ線が描き込まれていく（オープニング。約3.2秒）。

   描くのは lib/dots/shaders.ts（pass2 のなめらかな層と、pass1 の「細胞を点で描く」）。
   ここは位置と大きさと進みを計算するだけ。 */

import type { KV } from '@/lib/dots/field';

export type KVIn = {
  /** 細胞の置き場所（画面の css px。ヒーローの .hero-cells の箱） */
  rect: { x: number; y: number; w: number; h: number };
  W: number; H: number;
  /** ヒーローを抜ける進み 0..1（ヒーローの間＋できることまでの道のり） */
  p: number;
  /** オープニングが始まってからの秒数（オープニングなしなら大きな値） */
  tOpen: number;
  time: number;
  ptr: { x: number; y: number };
};

export type KVOut = { kv: KV };

const OPEN_DUR = 3.2;

export function kvState(i: KVIn): KVOut {
  const { rect: R, W, H, p, time: t } = i;
  /* 置き場所。横長の画面では、墨の細胞を見出しの下の空き（中央下）、朱の細胞を見出しの右に置く。
     墨の細胞を黒い大見出しの後ろに置くと、線が文字に埋もれて見えなくなった（実際に起きた）。
     縦長の画面（スマホ）は .hero-cells の箱（見出しの上の空き）に横並び */
  const wide = W / H > 1.1;
  const base = wide ? Math.max(60, Math.min(W * 0.14, H * 0.25)) : Math.max(40, Math.min(R.w * 0.19, R.h * 0.36));
  const rx1 = wide ? W * 0.52 : R.x + R.w * 0.22, ry1 = wide ? H * 0.63 : R.y + R.h * 0.56;
  const rx2 = wide ? W * 0.86 : R.x + R.w * 0.8, ry2 = wide ? H * 0.3 : R.y + R.h * 0.44;
  const dw = wide ? W * 0.02 : R.w * 0.035, dh = wide ? H * 0.03 : R.h * 0.05;
  let x1 = rx1 + Math.sin(t * 0.37) * dw;
  let y1 = ry1 + Math.cos(t * 0.29) * dh;
  let x2 = rx2 + Math.sin(t * 0.31 + 2) * dw;
  let y2 = ry2 + Math.cos(t * 0.41 + 1) * dh;
  let r1 = base * (1 + 0.035 * Math.sin(t * 1.1));
  let r2 = base * 0.94 * (1 + 0.035 * Math.sin(t * 1.3 + 1));

  /* ポインタに少し引き寄せられる（近いほうの細胞だけ） */
  const pull = (x: number, y: number, r: number) => {
    const dx = i.ptr.x - x, dy = i.ptr.y - y;
    const d = Math.hypot(dx, dy);
    const k = Math.exp(-(d * d) / (r * r * 4)) * 0.14 * r;
    return d > 1 ? [x + (dx / d) * k, y + (dy / d) * k] : [x, y];
  };
  if (Math.hypot(i.ptr.x - x1, i.ptr.y - y1) < Math.hypot(i.ptr.x - x2, i.ptr.y - y2)) [x1, y1] = pull(x1, y1, r1);
  else [x2, y2] = pull(x2, y2, r2);

  /* オープニング：核から外へ線が描き込まれ、細胞が少しずつ育ちながら、わずかに寄ってくる */
  const o = Math.min(1, Math.max(0, i.tOpen / OPEN_DUR));
  const oe = 1 - Math.pow(1 - o, 3);
  x1 -= (1 - oe) * base * 0.6; x2 += (1 - oe) * base * 0.6;
  r1 *= lerp(0.72, 1, oe); r2 *= lerp(0.72, 1, oe);
  const alpha = sm(0, 0.08, o);
  const open = 1 - Math.pow(1 - o, 2.2);

  /* 1) 近づいて1つに */
  const m = sm(0.02, 0.4, p);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  x1 = lerp(x1, mx, m * m); y1 = lerp(y1, my, m * m);
  x2 = lerp(x2, mx, m * m); y2 = lerp(y2, my, m * m);

  /* 2) 膨らんで、画面の真ん中へ */
  const g = sm(0.3, 0.72, p);
  const cx = W / 2, cy = H / 2;
  x1 = lerp(x1, cx, g); y1 = lerp(y1, cy, g); x2 = lerp(x2, cx, g); y2 = lerp(y2, cy, g);
  const grow = lerp(1, (Math.hypot(W, H) * 0.5) / base, g * g);
  r1 *= grow; r2 *= grow;

  /* 3) 点に変わって、弾ける */
  const smooth = 1 - sm(0.5, 0.7, p);
  const dots = sm(0.48, 0.66, p) * (1 - sm(0.74, 1, p));
  const burst = sm(0.64, 1, p);

  return {
    kv: {
      c: [x1, y1, x2, y2], r: [r1, r2], smooth, dots, burst, bx: cx, by: cy, alpha,
      nucleus: 1 - sm(0.28, 0.46, p), open,
      /* 膜の世界は、弾けた点の輪が抜けきってから（＝「できること」に着くところで）現れる */
      membrane: sm(0.88, 1, p),
    },
  };
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function sm(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
