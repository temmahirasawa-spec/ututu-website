/* KV（映像区間）の設定。**数値はここだけに置く。**
   四隅の座標も間合いも実機で詰めた実測値なので、意味が分からないまま
   書き換えないこと。経緯は reference/legacy-CLAUDE.md にあります。 */

export type Corners = [number, number][];

export type Hold = {
  /** 止めるコマ番号（連番の実番号） */
  at: number;
  /** そこで何コマ分スクロールを費やすか */
  len: number;
  ui: 'order' | 'review';
  /** そのコマでのスマホ画面の四隅（横位置 / 縦位置） */
  land: Corners;
  port: Corners;
};

export function pad(i: number) {
  return String(i).padStart(4, '0');
}

export const CFG = {
  realFrames: 589, // 仮想の目盛り。停止点も四隅の座標もこの番号のまま
  frameStep: 2, // 実ファイルは1コマおき（24fps→12fps）。転送量と本数が半分になる
  files: 295, // 実際に置いてある枚数
  headHi: 60, // 冒頭のこの枚数だけは高解像度が揃うまで待つ
  loStep: 4, // 先読みは4枚に1枚。理由は enqueue() を参照

  /* 線画を引く順番（レイヤー名の頭の番号）。
     スマホは左右の植木（05）が画角の外なので、そこを最後に引いても動きが見えない。
     画面の中央にある開口部（03）と中の様子（04）を最後に回している */
  artOrder: [1, 2, 5, 3, 4],

  /* 素材は1年 immutable で配信している（vercel.json）。
     連番や動画を作り直したときは、必ずこの版を上げること。上げないと
     一度見た人のブラウザは古い絵を使い続ける */
  ver: '20260818b',
  maxWait: 15000, // それでも揃わなければ待たずに始める（ミリ秒）

  /* 停止点。映像の好きなコマで止めて、そこでUIを見せる */
  holds: [
    {
      at: 447,
      len: 220,
      ui: 'order',
      land: [[704, 538], [866, 547], [888, 722], [666, 709]],
      port: [[456, 805], [701, 819], [740, 1072], [398, 1060]], // 素材から実測（右下は画角の外）
    },
    {
      at: 589,
      len: 220,
      ui: 'review',
      land: [[596, 402], [710, 404], [717, 603], [584, 601]],
      port: [[293, 597], [464, 603], [474, 902], [275, 895]], // 実機で計測
    },
  ] as Hold[],
  fadeLen: 40, // 停止点どうしが同じコマの場合に挟む白フェードの長さ

  /* 低解像度は縦横それぞれに用意してある。**縦横比は高解像度と完全に一致**させること。
     ずれると cover の切り取りが変わり、はめ込みの座標が合わなくなる
     （横 1280x856 → 320x214 = 1/4、縦 720x1278 → 240x426 = 1/3）*/
  land: {
    hi: (i: number) => '/frames/f_' + pad(i) + '.webp' + V(),
    lo: (i: number) => '/frames_lo/f_' + pad(i) + '.webp' + V(),
    w: 1280,
    h: 856,
  },
  port: {
    hi: (i: number) => '/frames_p/f_' + pad(i) + '.webp' + V(),
    lo: (i: number) => '/frames_lo_p/f_' + pad(i) + '.webp' + V(),
    w: 720,
    h: 1278,
  },

  clipOrder: '/clips/good-order-clip.mp4',
  clipReview: '/clips/good-review-clip.mp4',
  radius: 44,
};

export function V() {
  return '?v=' + CFG.ver;
}

export type FrameSet = typeof CFG.land;

/* 実コマ番号（1..589）→ 置いてあるファイルの番号（1..295）。
   1コマおきに間引いてあるが、停止点の 447 と 589 はちょうど 224 / 295 に残る */
export function fileOf(real: number) {
  return Math.max(1, Math.min(CFG.files, Math.ceil(real / CFG.frameStep)));
}

export const HOLDS = CFG.holds;
export const TOTAL = HOLDS.reduce((n, h) => n + h.len, CFG.realFrames);

/* 仮想コマ v（1始まり）から、実コマ番号と「いまどの停止点にいるか」を求める */
export type Resolved = { real: number; hold: Hold | null; idx?: number; t: number };
export function resolve(v: number): Resolved {
  let acc = 0;
  for (let i = 0; i < HOLDS.length; i++) {
    const h = HOLDS[i];
    if (v <= h.at + acc) return { real: Math.max(1, v - acc), hold: null, t: 0 };
    if (v <= h.at + acc + h.len) {
      return { real: h.at, hold: h, idx: i, t: (v - (h.at + acc)) / h.len };
    }
    acc += h.len;
  }
  return { real: Math.min(v - acc, CFG.realFrames), hold: null, t: 0 };
}

/* 停止点の開始・終了を仮想コマ番号で返す（コピー区間を書くときの目安） */
export function holdRange(i: number): [number, number] {
  let acc = 0;
  for (let k = 0; k < i; k++) acc += HOLDS[k].len;
  return [HOLDS[i].at + acc, HOLDS[i].at + acc + HOLDS[i].len];
}

/* コピーを出す区間（仮想コマ番号）。
   **開始は停止点より手前に置くこと。** 停止区間に入ってから出すと、
   章の移動の9割を過ぎてからの出現になり、1枚目→2枚目（7割あたり）と
   揃いません。下の値は、どの章でも移動の約7割で出そろうように引いてあります。

   **区間どうしを重ねないこと。** 重なったコマでは両方が不透明度1になり、
   同じ位置に2つの文章が出ます。そのうえで、隙間は広すぎても狭すぎても
   いけません。狭いと消えきる前に次が出て重なり、広いと文字のない時間が
   延びます。どの区間も**無表示が 0.3〜0.4 秒**になるように引いてあります。
   3枚目の終わりが停止点より後ろ（+73）なのはそのためで、停止点で切ると
   2.4秒も文字のない時間ができます（停止区間は速く通り抜けるので、
   コマ数のわりに時間が進むため） */
export const COPY_AT: [number, number][] = [
  [1, 150], // 店舗に、いい一日を。（最初から表示）
  [230, 395], // この店が、開発室です。
  [holdRange(0)[0] - 30, holdRange(0)[1] + 73], // 埋もれる一品を、なくす。
  [holdRange(1)[0] - 40, holdRange(1)[1] - 30], // ほめ言葉は外、苦言は内。
];

/* 出入りにかける時間（秒）。**コマ数で決めないこと。**
   章によって毎秒進むコマ数が4倍以上違うため、コマ基準にすると
   速い区間では一瞬で切り替わってカクつき、遅い区間ではだらだら続きます */
export const COPY_FADE_SEC = 0.38;

/* 線画は横位置の画角で描かれている。縦位置のときは、縦の連番が写している
   範囲だけを見せて画角を揃える（横位置の x 400〜879 に相当。
   1コマ目どうしの相関で実測、一致度 0.988） */
export const ART_VB = { land: '0 0 1281.74 856.99', port: '400 0 479 851' };

/* 線を引く速さの上限（秒）。キャッシュ済みで一瞬で終わる場合でも、
   引き切るまでにこれだけかける */
export const LOAD_DRAW_SEC = 1.6;
export const LOAD_HOLD_MS = 420; // 引き終わった絵を見せる間

/* 同時4本だと1枚ごとの往復が積み上がって効かない（実測 295枚で約7秒）。
   HTTP/2 は1本の接続に多重化されるので、8本まで開いても接続は埋まらない */
export const MAXC = 8;

/* 章から章への移動にかける時間（ミリ秒）。[0→1, 1→2, 2→3] の順。
   素材は1コマおき（12fps）なので、移動が遅いほどコマ送りに見える。
   4200msでは毎秒18枚しか出ず、そこがカクつきの正体だった */
export const CHAPTER_DUR = [1300, 1700, 2100];
export const AFTER_DUR = 650; // 最後のNEXTで下のセクションへ送る時間

/* 停止区間は絵が止まっている。ここに素のスクロール量を割り当てると、
   **スクロールしても何も起きない区間**ができる（PCで実測 578px×2＝全体の43%）。
   rate は停止区間の1コマを通常の何コマ分として数えるか。

   SCROLL_RATE … スクロール↔コマ。詰めすぎると停止点を一瞬で通り過ぎるので中庸に
   TWEEN_RATE  … 章送りの補間。押した瞬間に絵が動き出すよう、より強く詰める */
export const SCROLL_RATE = 0.3;
export const TWEEN_RATE = 0.05;

/* スマホのスワイプ判定。
   映像区間では指のスクロールを止めているが、**下から上で次、上から下で前**に送る。
   送りボタンとドットがあっても、スクロールしようとする人のほうが多いため。

   ゆるめに取ってあります。短くても速ければスワイプと見なすのは、
   親指の小さな弾きを拾うためです。厳しくすると「動かない」と受け取られます */
export const SWIPE = {
  min: 44,      // これだけ動けばスワイプ（px）
  fastPx: 24,   // 短くても
  fastMs: 260,  // これより速ければスワイプ
};

/* 章の位置（仮想コマ）。**ピクセルではなくコマで持つこと。**
   iOSはURLバーの出入りで innerHeight が変わり heroMax が縮む */
export function chapterFrames(): number[] {
  const o = holdRange(0), r = holdRange(1);
  return [
    1, // 冒頭
    330, // 入店
    (o[0] + o[1]) / 2, // GOOD ORDER
    (r[0] + r[1]) / 2, // GOOD REVIEW
  ];
}

/* ロゴの遊び。UTUTU は回文で、1文字152・字送り248の等間隔 */
export const MARK = {
  base: [0, 248, 496, 744, 992], // 正式ロゴの字送り
  slideMap: [2, 3, 4, 1, 0], // 位置pにいる文字の行き先
  slideDur: 2800, // ゆっくり見せる
  flipDur: 1250,
  flipGap: 210, // 1文字ずつずらす間隔
  pivot: 76, // 1文字の中心（幅152の半分）。裏返す軸
  first: 5000, // 明けてから最初に動くまで
  every: 15000, // 次に動くまで
  ease: 'cubic-bezier(.42,.02,.32,1)',
};
