/* KV（映像区間）のエンジン。
   原本 reference/legacy-index.html の <script> をそのまま移したもの。
   数値は heroConfig.ts に集めてあります。ここには手順だけを置くこと。

   React 版で足したのは**破棄（dispose）だけ**です。開発中の二重実行や
   ページ遷移でループが二重に回らないよう、登録したものは全部畳みます。 */

import {
  ART_VB, AFTER_DUR, CFG, CHAPTER_DUR, COPY_AT, COPY_FADE_SEC,
  HOLDS, LOAD_DRAW_SEC, LOAD_HOLD_MS, MARK, MAXC, SCROLL_RATE, TOTAL,
  TWEEN_RATE, chapterFrames, fileOf, holdRange, pad, resolve, V,
  type Corners, type FrameSet,
} from './heroConfig';

export function startHero(): () => void {
  /* ---- 畳むもの置き場 ---- */
  const offs: Array<() => void> = [];
  const on = <K extends keyof WindowEventMap>(
    t: EventTarget, ev: K | string, fn: EventListenerOrEventListenerObject,
    opt?: AddEventListenerOptions,
  ) => {
    t.addEventListener(ev, fn, opt);
    offs.push(() => t.removeEventListener(ev, fn, opt));
  };
  const timers: ReturnType<typeof setTimeout>[] = [];
  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  };
  const every = (fn: () => void, ms: number) => {
    const id = setInterval(fn, ms);
    timers.push(id);
    return id;
  };
  let dead = false;
  let raf = 0;
  const frame = (fn: FrameRequestCallback) => { raf = requestAnimationFrame(fn); };

  /* ============================================================
     準備
     ============================================================ */
  const $ = (id: string) => document.getElementById(id);
  const canvas = $('seq') as HTMLCanvasElement | null;
  const track = $('track');
  const loadEl = $('load');
  const pctEl = $('loadPct');
  if (!canvas || !track || !loadEl || !pctEl) return () => {};
  const ctx = canvas.getContext('2d', { alpha: false })!;

  /* ---- 線を引く ----
     全パスの長さを足し、進み具合ぶんだけ順に引いていく。
     同時に少しずつ引くと機械的に見えるので、1本ずつ引き切る。
     path だけでなく line / polyline / polygon なども拾う
     （イラレは直線を <line>、折れ線を <polyline> で書き出すため） */
  let artPaths = Array.from(document.querySelectorAll<SVGGeometryElement>(
    '#loadArt path,#loadArt line,#loadArt polyline,#loadArt polygon,'
    + '#loadArt circle,#loadArt ellipse,#loadArt rect'));

  function setArtView() {
    const el = $('loadArt');
    if (el) el.setAttribute('viewBox', ART_VB[portrait ? 'port' : 'land']);
  }

  /* 引く順番。
     何も指定がなければ SVG の記述順です。イラレは**レイヤーパネルの下から順に**
     書き出すので、そのままだと「一番下のレイヤー」から引かれます。
     レイヤー名を 01_ 02_ … と数字で始めておけば、重ね順に関係なく
     **CFG.artOrder に書いた順**で引きます。
     一部にしか番号が無いときは、事故を避けるため記述順のままにします */
  (function orderArt() {
    function num(el: Element | null): number | null {
      for (let n: Node | null = el; n && n.nodeType === 1; n = n.parentNode) {
        const m = ((n as Element).id || '').match(/\d+/);
        if (m) return parseInt(m[0], 10);
      }
      return null;
    }
    const keys = artPaths.map(num);
    if (!keys.length || keys.some((k) => k === null)) return;
    const rank = (k: number | null) => {
      const i = CFG.artOrder.indexOf(k as number);
      return i < 0 ? 99 : i;
    };
    const idx = artPaths.map((_, i) => i);
    idx.sort((a, b) => rank(keys[a]) - rank(keys[b]) || a - b);
    artPaths = idx.map((i) => artPaths[i]);
  })();

  const artLens = artPaths.map((p) => p.getTotalLength());
  const artTotal = artLens.reduce((a, b) => a + b, 0);
  artPaths.forEach((p, i) => {
    p.style.strokeDasharray = String(artLens[i]);
    p.style.strokeDashoffset = String(artLens[i]);
    p.style.visibility = 'hidden';
  });
  function drawArt(t: number) {
    const want = artTotal * t;
    let acc = 0;
    for (let i = 0; i < artPaths.length; i++) {
      const seg = Math.max(0, Math.min(artLens[i], want - acc));
      /* 線端が丸なので、長さ0でも始点に点が描かれてしまう。
         まだ引いていない線は隠す */
      artPaths[i].style.visibility = seg > 0.5 ? 'visible' : 'hidden';
      artPaths[i].style.strokeDashoffset = (artLens[i] - seg).toFixed(1);
      acc += artLens[i];
    }
  }

  const stageEl = $('stage')!;
  const whiteEl = $('white')!;
  const scrimEl = $('scrim')!;
  const skipEl = $('skip')!;
  const progEl = $('prog')!;
  const progFill = progEl.firstElementChild as HTMLElement;
  const hintEl = $('scrollHint')!;
  const copies = Array.from(document.querySelectorAll<HTMLElement>('.copy'));
  const slots = ['vidOrder', 'vidReview', 'tint', 'sheen'].map((id) => $(id)!);
  const vOrder = $('vOrder') as HTMLVideoElement;
  const vReview = $('vReview') as HTMLVideoElement;

  let DPR = Math.min(devicePixelRatio || 1, 2);
  // 明確に縦長のときだけ縦位置素材を使う
  const isPortrait = () => innerHeight / innerWidth > 1.15;
  let portrait = isPortrait();
  setArtView();
  let SET: FrameSet = portrait ? CFG.port : CFG.land;
  let curCorners: Corners = portrait ? HOLDS[0].port : HOLDS[0].land;

  let imgs: HTMLImageElement[] = new Array(CFG.files + 1); // 1始まりで使う。添字はファイル番号
  let low: HTMLImageElement[] = new Array(CFG.files + 1);
  let loLoaded = 0, hiLoaded = 0, ready = false;

  /* ---- 動画は縦横で共通。読み込みは表示の直前でよい ---- */
  vOrder.src = CFG.clipOrder + V();
  vReview.src = CFG.clipReview + V();

  /* ============================================================
     ホモグラフィ（矩形 → 画面の四隅）
     ============================================================ */
  function homography(dst: Corners) {
    const W = 390, H = 844;
    const src = [[0, 0], [W, 0], [W, H], [0, H]];
    const A: number[][] = [], b: number[] = [];
    for (let i = 0; i < 4; i++) {
      const sx = src[i][0], sy = src[i][1], dx = dst[i][0], dy = dst[i][1];
      A.push([sx, sy, 1, 0, 0, 0, -sx * dx, -sy * dx]); b.push(dx);
      A.push([0, 0, 0, sx, sy, 1, -sx * dy, -sy * dy]); b.push(dy);
    }
    for (let c = 0; c < 8; c++) {
      let piv = c;
      for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      const t = A[c]; A[c] = A[piv]; A[piv] = t;
      const tb = b[c]; b[c] = b[piv]; b[piv] = tb;
      for (let r2 = 0; r2 < 8; r2++) {
        if (r2 === c) continue;
        const f = A[r2][c] / A[c][c];
        for (let c2 = c; c2 < 8; c2++) A[r2][c2] -= f * A[c][c2];
        b[r2] -= f * b[c];
      }
    }
    const h: number[] = [];
    for (let k = 0; k < 8; k++) h.push(b[k] / A[k][k]);
    h.push(1);
    return h;
  }

  /* ---- 素材の座標 → 画面の座標（cover表示に合わせる） ---- */
  const fit = { s: 1, ox: 0, oy: 0 };
  function computeFit() {
    const cw = innerWidth, ch = innerHeight;
    const s = Math.max(cw / SET.w, ch / SET.h);
    fit.s = s;
    fit.ox = (cw - SET.w * s) / 2;
    fit.oy = (ch - SET.h * s) / 2;
  }
  function applyScreenTransform() {
    const d = curCorners.map((p) => [p[0] * fit.s + fit.ox, p[1] * fit.s + fit.oy]) as Corners;
    const h = homography(d);
    const m = 'matrix3d(' + [h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, 1].join(',') + ')';
    slots.forEach((el) => {
      el.style.transform = m;
      el.style.borderRadius = CFG.radius + 'px';
    });
  }

  /* ============================================================
     描画
     ============================================================ */
  function resize() {
    canvas!.width = Math.round(innerWidth * DPR);
    canvas!.height = Math.round(innerHeight * DPR);
    canvas!.style.width = innerWidth + 'px';
    canvas!.style.height = innerHeight + 'px';
    computeFit();
    applyScreenTransform();
    shown = -1;
  }

  /* 低解像度は縦横それぞれ用意してあるので、どちらの向きでも使える。
     高解像度 → 同じコマの低解像度 → ひとつ前のコマ、の順に落とす */
  let drawnIdx = 0, drawnExact = false, drawnHi = false;
  const usable = (im?: HTMLImageElement) => !!(im && im.complete && im.naturalWidth);
  function pick(i: number) {
    if (usable(imgs[i])) { drawnIdx = i; drawnExact = true; drawnHi = true; return imgs[i]; }
    if (usable(low[i])) { drawnIdx = i; drawnExact = true; drawnHi = false; return low[i]; }
    for (let k = i - 1; k >= 1; k--) {
      if (usable(imgs[k])) { drawnIdx = k; drawnExact = false; drawnHi = true; return imgs[k]; }
      if (usable(low[k])) { drawnIdx = k; drawnExact = false; drawnHi = false; return low[k]; }
    }
    return null;
  }
  function draw(i: number) {
    const im = pick(i);
    if (!im) return;
    const cw = canvas!.width, ch = canvas!.height;
    const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  /* ============================================================
     読み込み
     ============================================================ */
  const queue: { i: number; hi: boolean }[] = [];
  let active = 0;
  let curFile = 1; // いま描いているファイル番号。読み込みの優先順位に使う

  /* 先読みで取る低解像度のファイル番号。
     全編を1枚ずつ取ると295往復かかり、バイト数のわりに時間を食う
     （実測で2.2MBに3.9秒。遅いのは容量ではなく往復の回数）。
     4枚に1枚だけ取れば74往復で済む。欠けたところは直前のコマを出すが、
     元が12fpsなので最大3枚ぶん＝映像0.25秒の差でしかなく、見分けがつかない。
     ただし停止点のコマだけは別。ここはUIを重ねる位置なので、
     別のコマが出ているとはめ込みがずれて見える */
  function lowList() {
    const set: Record<number, 1> = {}, out: number[] = [];
    for (let i = 1; i <= CFG.files; i += CFG.loStep) set[i] = 1;
    set[CFG.files] = 1;
    HOLDS.forEach((h) => { set[fileOf(h.at)] = 1; });
    for (const k in set) out.push(+k);
    return out.sort((a, b) => a - b);
  }
  let LOW_LIST: number[] | null = null;

  function enqueue() {
    LOW_LIST = lowList();
    LOW_LIST.forEach((i) => queue.push({ i, hi: false }));
    for (let j = 1; j <= CFG.files; j++) queue.push({ i: j, hi: true });
    pump();
  }

  /* ローディング画面を閉じてよいか。
     「全編が低解像度で揃っている」ことと「冒頭が高解像度で揃っている」ことの両方を見る。
     前者だけだと、粗い絵のまま操作できてしまう */
  function loadProgress() {
    const a = Math.min(1, loLoaded / (LOW_LIST ? LOW_LIST.length : CFG.files));
    const b = Math.min(1, hiLoaded / CFG.headHi);
    return a * 0.45 + b * 0.55;
  }

  function pump() {
    while (!dead && active < MAXC && queue.length) {
      // いま見ているコマに近いものから読む。低解像度を優先
      let bi = 0, bd = Infinity;
      for (let k = 0; k < queue.length; k++) {
        const d = Math.abs(queue[k].i - curFile) + (queue[k].hi ? 100000 : 0);
        if (d < bd) { bd = d; bi = k; }
      }
      const job = queue.splice(bi, 1)[0];
      active++;
      const im = new Image();
      im.decoding = 'async';
      im.onload = im.onerror = () => {
        active--;
        if (job.hi) hiLoaded++; else loLoaded++;
        if (job.hi && job.i === shown) shown = -1; // 高解像度が来たら描き直す
        pump();
      };
      im.src = job.hi ? SET.hi(job.i) : SET.lo(job.i);
      (job.hi ? imgs : low)[job.i] = im;
    }
  }

  let artT = 0, loadFloor = 0, lastLoad = 0;
  function loadTick(now: number) {
    if (dead) return;
    const dt = Math.min((now - lastLoad) / 1000, 0.05);
    lastLoad = now;
    const want = Math.max(loadProgress(), loadFloor);
    artT = Math.min(want, artT + dt / LOAD_DRAW_SEC);
    drawArt(artT);
    pctEl!.textContent = String(Math.round(artT * 100));
    if (artT >= 1) { start(); return; }
    frame(loadTick);
  }

  function loadAll() {
    lastLoad = performance.now();
    frame(loadTick);
    enqueue();
    // 動画は停止点まで要らない。画像と並行して取り、間に合わなければHTMLのUIに切り替える
    [vOrder, vReview].forEach((v) => {
      on(v, 'loadeddata', () => tryPlay(v), { once: true });
      v.load();
      later(() => {
        if (v.readyState < 2) {
          (v.parentNode as HTMLElement).classList.add('usefb');
          console.warn('動画を読み込めないため、HTMLのUIに切り替えました:', v.currentSrc || v.src);
        }
      }, 6000);
    });
    // 回線が細いときにローディングで足止めしない。
    // 打ち切っても線は同じ速さで引き切ってから始める
    later(() => {
      if (!ready) {
        console.warn('読み込みが ' + CFG.maxWait + 'ms で揃わないため、先に始めます');
        loadFloor = 1;
      }
    }, CFG.maxWait);
  }

  function start() {
    ready = true;
    console.log('読み込み完了まで ' + Math.round(performance.now()) + 'ms'
      + '（先読み ' + loLoaded + ' / 高解像度 ' + hiLoaded + '）');
    resize(); // 裏で1コマ目を描いておく。明けたときに線画とそのまま入れ替わる
    // 引き終わった絵を一拍見せてから明ける。すぐ消すと完成した絵が目に入らない
    later(() => {
      loadEl!.style.opacity = '0';
      startMarkPlay(); // ロゴの遊びはここから
      later(() => { loadEl!.style.display = 'none'; }, 720);
    }, LOAD_HOLD_MS);
    (window as unknown as { __ready?: boolean }).__ready = true;
  }

  /* ============================================================
     スクロール → コマ番号
     ============================================================ */
  let target = 1, cur = 1, shown = -1, prog = 0;
  function readScroll() {
    const max = track!.offsetHeight - innerHeight;
    prog = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    target = expand(SCROLL_BASE + prog * SCROLL_SPAN, SCROLL_RATE);
  }
  on(window, 'scroll', () => {
    readScroll();
    syncChrome();
    if (!SNAP) return;
    if (tweening) return;
    const n = nearestChapter();
    if (n !== chapIdx) { chapIdx = n; markDots(); }
    else lockScroll(inHero());
  }, { passive: true });

  let resizeTimer: ReturnType<typeof setTimeout> | null = null;
  on(window, 'resize', () => {
    DPR = Math.min(devicePixelRatio || 1, 2);
    const p = isPortrait();
    if (p !== portrait) {
      portrait = p;
      setArtView();
      SET = portrait ? CFG.port : CFG.land;
      // 向きが変わると素材そのものが変わるので、読み込み直す。
      // これをしないと、古い向きの絵に新しい向きの座標を当てることになりズレる
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = later(reloadForOrientation, 200);
    }
    resize(); readScroll();
    applySnapMode();
  });
  function reloadForOrientation() {
    queue.length = 0;
    imgs = new Array(CFG.files + 1);
    low = new Array(CFG.files + 1);
    loLoaded = 0; hiLoaded = 0; shown = -1;
    const r = resolve(Math.round(cur));
    curCorners = r.hold ? (portrait ? r.hold.port : r.hold.land)
      : (portrait ? HOLDS[0].port : HOLDS[0].land);
    applyScreenTransform();
    enqueue();
  }

  /* ============================================================
     区間ごとの演出
     ============================================================ */
  const copyOpa = copies.map(() => 0);
  function updateOverlays(f: number, dt: number) {
    const r = resolve(f);
    const h = r.hold;

    /* 停止のあいだは絵が止まる。スクロールしても無反応に見えないよう、
       ごくゆっくり寄る。sin なので両端で 1.0 に戻り、前後の映像と継ぎ目が出ない。
       canvas と はめ込み は同じ #stage の中なので、一緒に拡縮されてズレない。
       編集モードでは掛けない（緑の丸は #stage の外にあり、ズレるため）。
       **スマホでは掛けない。** 章送りは停止区間を数%の時間で駆け抜けるので、
       着地際に拡大が一瞬で入り、かえってカクついて見える */
    const zoom = (h && !EDIT && !SNAP) ? Math.sin(r.t * Math.PI) * 0.045 : 0;
    stageEl.style.transform = zoom > 0.0005 ? 'scale(' + (1 + zoom).toFixed(4) + ')' : '';

    // 停止点に入ったら、その点の四隅に切り替える
    if (h) {
      const want = portrait ? h.port : h.land;
      if (want !== curCorners) { curCorners = want; applyScreenTransform(); }
    }

    // コピー。区間に入っているかで行き先を決め、そこへ一定の速さで寄せる
    const step = dt / COPY_FADE_SEC;
    copies.forEach((c, i) => {
      const rr = COPY_AT[i];
      const want = (f >= rr[0] && f <= rr[1]) ? 1 : 0;
      let o = copyOpa[i];
      o = want > o ? Math.min(want, o + step) : Math.max(want, o - step);
      copyOpa[i] = o;
      c.style.opacity = o.toFixed(3);
      c.style.setProperty('--dy', ((1 - o) * 22).toFixed(1) + 'px');
    });

    // 白フェード：同じコマで止まる停止点どうしの切り替えにだけ使う
    let w = 0;
    for (let i = 0; i < HOLDS.length - 1; i++) {
      if (HOLDS[i].at !== HOLDS[i + 1].at) continue;
      const end = holdRange(i)[1], half = CFG.fadeLen / 2;
      if (f > end - half && f < end + half) {
        w = Math.sin(((f - (end - half)) / CFG.fadeLen) * Math.PI);
      }
    }
    whiteEl.style.opacity = (w * 0.92).toFixed(3);

    // 端末UI
    const showOrder = !!h && h.ui === 'order' && w < 0.5;
    const showReview = !!h && h.ui === 'review' && w < 0.5;
    slots[0].classList.toggle('on', showOrder);
    slots[1].classList.toggle('on', showReview);
    slots[2].classList.toggle('on', showOrder || showReview);
    slots[3].classList.toggle('on', showOrder || showReview);
    playIf(vOrder, showOrder);
    playIf(vReview, showReview);

    scrimEl.style.opacity = String(h ? (portrait ? 0.85 : 0.45) : 1);
    skipEl.style.opacity = prog > 0.96 ? '0' : '1';
    // 右側のスクロール位置。映像を抜けたら引っ込める
    progFill.style.height = (prog * 100).toFixed(2) + '%';
    progEl.style.opacity = prog > 0.995 ? '0' : '1';
    // スマホは送りボタンで進むので案内は出さない
    hintEl.style.opacity = SNAP ? '0' : (prog > 0.03 ? '0' : '1');
  }

  /* 一時停止と再生を繰り返すと自動再生の制限に当たりやすい。
     軽い動画なので、読み込めたら止めずに回し続ける */
  function tryPlay(v: HTMLVideoElement) {
    if (!v || !v.paused) return;
    const pr = v.play();
    if (pr && pr.catch) pr.catch(() => {});
  }
  function playIf(v: HTMLVideoElement, isOn: boolean) { if (isOn) tryPlay(v); }

  /* 自動再生が拒否された場合に備え、最初の操作で解除する */
  (function unlock() {
    let done = false;
    const evs = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'];
    const go = () => {
      if (done) return;
      done = true;
      tryPlay(vOrder); tryPlay(vReview);
      evs.forEach((ev) => window.removeEventListener(ev, go));
    };
    evs.forEach((ev) => on(window, ev, go, { passive: true }));
    every(() => { tryPlay(vOrder); tryPlay(vReview); }, 1500);
  })();

  /* ============================================================
     四隅の調整モード  …  URLに ?edit を付けると有効
     緑の丸をドラッグして合わせ、出てきた座標を heroConfig の holds に貼る
     ============================================================ */
  console.log('%cUTUTU scroll sequence  build 2026-08-20-next', 'color:#00E5A0;font-weight:bold');
  console.log('編集モード: URLに ?edit=1 を付けるか、Eキーを押してください');

  let EDIT = /[?&]edit/.test(location.search) || /edit/.test(location.hash);
  let editReady = false;
  on(window, 'keydown', (e) => {
    const k = (e as KeyboardEvent).key;
    if (k === 'e' || k === 'E') { EDIT = !EDIT; setupEdit(); }
  });
  function setupEdit() {
    if (editUI) editUI.style.display = EDIT ? 'block' : 'none';
    hsAll.forEach((h) => { h.style.display = EDIT ? 'block' : 'none'; });
    if (EDIT && !editReady) buildEdit();
  }
  let editUI: HTMLElement | null = null;
  const hsAll: HTMLElement[] = [];
  function buildEdit() {
    editReady = true;
    const box = document.createElement('div');
    editUI = box;
    box.style.cssText = 'position:fixed;z-index:30;left:14px;top:14px;background:rgba(16,18,22,.92);'
      + 'color:#EDEFF2;font:11px/1.8 ui-monospace,Menlo,monospace;padding:12px 14px;border-radius:10px;'
      + 'border:1px solid rgba(255,255,255,.16);white-space:pre;user-select:all;max-width:60vw';
    document.body.appendChild(box);
    offs.push(() => box.remove());
    const hs: HTMLElement[] = [];
    for (let hi = 0; hi < 4; hi++) {
      ((hi: number) => {
        const d = document.createElement('div');
        d.style.cssText = 'position:fixed;z-index:31;width:34px;height:34px;margin:-17px 0 0 -17px;'
          + 'border-radius:50%;border:3px solid #00E5A0;background:rgba(0,229,160,.25);cursor:grab;'
          + 'touch-action:none;box-shadow:0 0 0 1px rgba(0,0,0,.5),0 0 18px rgba(0,229,160,.6)';
        document.body.appendChild(d);
        offs.push(() => d.remove());
        let drag = false;
        d.addEventListener('pointerdown', (e) => { drag = true; d.setPointerCapture(e.pointerId); e.preventDefault(); });
        d.addEventListener('pointermove', (e) => {
          if (!drag) return;
          curCorners[hi][0] = Math.round((e.clientX - fit.ox) / fit.s);
          curCorners[hi][1] = Math.round((e.clientY - fit.oy) / fit.s);
          applyScreenTransform();
        });
        d.addEventListener('pointerup', () => { drag = false; });
        hs.push(d); hsAll.push(d);
      })(hi);
    }
    every(() => {
      for (let i = 0; i < 4; i++) {
        const sx = curCorners[i][0] * fit.s + fit.ox;
        const sy = curCorners[i][1] * fit.s + fit.oy;
        const cx = Math.max(20, Math.min(innerWidth - 20, sx));
        const cy = Math.max(20, Math.min(innerHeight - 20, sy));
        const off = (cx !== sx || cy !== sy);
        hs[i].style.left = cx + 'px';
        hs[i].style.top = cy + 'px';
        // 画面外にはみ出しているときは色を変えて知らせる（掴んで戻せる）
        hs[i].style.borderColor = off ? '#FF9F43' : '#00E5A0';
        hs[i].style.background = off ? 'rgba(255,159,67,.3)' : 'rgba(0,229,160,.25)';
      }
      const names = ['左上', '右上', '右下', '左下'];
      if (!EDIT) return;
      const want = fileOf(resolve(Math.round(cur)).real);
      const ok = drawnExact && drawnHi && drawnIdx === want;
      box.innerHTML = '● EDIT MODE　（Eキーで切替）<br><br>'
        + '<span style="color:' + (ok ? '#00E5A0' : '#FF9F43') + '">'
        + (ok ? '表示中 f_' + pad(want) + '　高解像度'
          : '⚠ 目標 f_' + pad(want) + ' / 実表示 f_' + pad(drawnIdx)
            + (drawnExact && !drawnHi ? '（低解像度）' : '')
            + '<br>　読み込み待ちです。完了してから合わせてください')
        + '</span><br><br>'
        + (portrait ? 'port' : 'land') + ': [<br>'
        + curCorners.map((c, i) => '　[' + c[0] + ',' + c[1] + ']' + (i < 3 ? ',' : '') + '　// ' + names[i]).join('<br>')
        + '<br>]<br>画面 ' + innerWidth + ' × ' + innerHeight
        + '<br>読み込み 低 ' + loLoaded + '/' + (LOW_LIST ? LOW_LIST.length : '-') + '　高 ' + hiLoaded + '/' + CFG.files
        + '<br>※ファイルは1コマおき（' + CFG.files + '枚）。実コマ ' + CFG.realFrames + ' に対応';
    }, 120);
  }
  setupEdit();

  /* ============================================================
     スマホの章送り
     スクロール量が読めないと不安なので、1スワイプ／1タップで
     次の停止点まで自動で移動する。PCは自由スクラブのまま
     ============================================================ */
  let SNAP = false, chapters: number[] = [], chapIdx = 0, tweening = false;
  const dotsEl = $('dots')!;
  const nextBtn = $('nextBtn')!;
  const backBtn = $('backBtn')!;

  const heroMax = () => Math.max(1, track!.offsetHeight - innerHeight);
  const frameToY = (f: number) => (compress(f, SCROLL_RATE) - SCROLL_BASE) / SCROLL_SPAN * heroMax();

  function compress(v: number, rate: number) {
    let acc = 0, out = 0, prev = 0;
    for (let i = 0; i < HOLDS.length; i++) {
      const s0 = HOLDS[i].at + acc, e0 = s0 + HOLDS[i].len;
      if (v <= s0) return out + (v - prev);
      out += (s0 - prev);
      if (v <= e0) return out + (v - s0) * rate;
      out += HOLDS[i].len * rate;
      prev = e0; acc += HOLDS[i].len;
    }
    return out + (v - prev);
  }
  function expand(x: number, rate: number) {
    let acc = 0, out = 0, prev = 0;
    for (let i = 0; i < HOLDS.length; i++) {
      const s0 = HOLDS[i].at + acc, e0 = s0 + HOLDS[i].len;
      if (x <= out + (s0 - prev)) return prev + (x - out);
      out += (s0 - prev);
      if (x <= out + HOLDS[i].len * rate) return s0 + (x - out) / rate;
      out += HOLDS[i].len * rate;
      prev = e0; acc += HOLDS[i].len;
    }
    return prev + (x - out);
  }
  const SCROLL_BASE = compress(1, SCROLL_RATE);
  const SCROLL_SPAN = compress(TOTAL, SCROLL_RATE) - SCROLL_BASE;

  /* **章はピクセルではなくコマ番号で持つこと。**
     iOSはURLバーの出入りで innerHeight が変わり heroMax が縮む。ピクセルで
     覚えておくと、縮んだあとは同じ座標が別のコマを指し、最後の章に至っては
     heroMax を超えて到達不能になる（映像が途中で止まる） */
  const chapY = (i: number) => frameToY(chapters[i]);
  function buildChapters() {
    chapters = chapterFrames();
    dotsEl.innerHTML = '';
    chapters.forEach((_, i) => {
      const b = document.createElement('button');
      b.innerHTML = '<i></i>';
      b.addEventListener('click', () => gotoChapter(i));
      dotsEl.appendChild(b);
    });
  }
  function nearestChapter() {
    const y = scrollY;
    let best = 0, bd = Infinity;
    chapters.forEach((_, i) => {
      const d = Math.abs(chapY(i) - y);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }
  function markDots() {
    const kids = dotsEl.children;
    for (let i = 0; i < kids.length; i++) kids[i].classList.toggle('on', i === chapIdx);
    const first = chapIdx <= 0;
    backBtn.style.opacity = first ? '0' : '1';
    backBtn.style.pointerEvents = first ? 'none' : 'auto';
    if (SNAP) lockScroll(inHero());
  }
  /* 等速。行きも戻りも同じ速さで動かす。
     イーズアウトを入れると、着地の直前に数コマだけ動く尾が残って気になる */
  const easeMove = (t: number) => t;

  let tweenToken = 0;
  function gotoChapter(i: number) {
    i = Math.max(0, Math.min(chapters.length - 1, i));
    const prev = chapIdx;
    if (i === prev && !tweening) return;
    chapIdx = i; markDots();

    const from = scrollY, to = chapY(i);
    if (Math.abs(to - from) < 2) { tweening = false; return; }

    /* 停止区間を詰めた“見た目の距離”で補間する。ここが実際に絵の変わる量。
       行き先はコマから直に取る（ピクセルへ往復させると誤差が乗る） */
    const vFrom = compress(yToFrame(from), TWEEN_RATE), vTo = compress(chapters[i], TWEEN_RATE);

    // 移動する区間ごとに時間を決める（進む向き・戻る向きで同じ）
    const lo = Math.min(prev, i);
    const seg = Math.max(0, Math.min(CHAPTER_DUR.length - 1, lo));
    let dur = CHAPTER_DUR[seg] || 2400;
    // 途中から引き返す場合は、残りの距離に応じて短くする
    const hi = Math.min(chapters.length - 1, lo + 1);
    const full = Math.abs(compress(chapters[hi], TWEEN_RATE) - compress(chapters[lo], TWEEN_RATE)) || 1;
    dur = Math.max(600, dur * Math.min(1, Math.abs(vTo - vFrom) / full));

    const my = ++tweenToken; // 新しい操作が来たら古い移動は捨てる
    const t0 = performance.now();
    tweening = true;
    lockScroll(false);
    (function step(now: number) {
      if (dead || my !== tweenToken) return; // 割り込まれた
      const t = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, frameToY(expand(vFrom + (vTo - vFrom) * easeMove(t), TWEEN_RATE)));
      readScroll();
      if (t < 1) requestAnimationFrame(step);
      else { tweening = false; markDots(); }
    })(performance.now());
  }
  const yToFrame = (y: number) => expand(SCROLL_BASE + (y / heroMax()) * SCROLL_SPAN, SCROLL_RATE);

  /* 最後のNEXTは、映像を抜けて下のセクションまで送る */
  function gotoAfter() {
    const after = $('after');
    if (!after) return;
    const from = scrollY;
    const to = Math.round(after.getBoundingClientRect().top + scrollY);
    if (to - from < 2) return;
    const my = ++tweenToken, t0 = performance.now();
    tweening = true;
    lockScroll(false);
    (function step(now: number) {
      if (dead || my !== tweenToken) return;
      const t = Math.min(1, (now - t0) / AFTER_DUR);
      window.scrollTo(0, from + (to - from) * easeMove(t));
      readScroll();
      if (t < 1) requestAnimationFrame(step);
      else { tweening = false; markDots(); }
    })(performance.now());
  }

  const inHero = () => scrollY < heroMax() - 2;
  /* 映像区間にいるかどうかで、標準のスクロールバーと送りUIの出し入れを決める */
  function syncChrome() {
    const v = inHero();
    document.documentElement.classList.toggle('hide-sb', v);
    document.body.classList.toggle('past-hero', !v);
  }
  /* スマホでは指のスクロールを完全に止め、ボタン操作だけにする */
  function lockScroll(isOn: boolean) {
    document.documentElement.style.overflow = isOn ? 'hidden' : '';
    document.body.style.overflow = isOn ? 'hidden' : '';
  }
  function applySnapMode() {
    SNAP = isPortrait();
    document.body.classList.toggle('snap', SNAP);
    if (SNAP) { buildChapters(); chapIdx = nearestChapter(); markDots(); }
    syncChrome();
    lockScroll(SNAP && inHero());
  }

  /* ============================================================
     ロゴの遊び
     2つの動きを交互に、たまに。UTUTU は回文で、字送りは等間隔。
     ・すべる … 位置を入れ替える（U3つが順ぐり、T2つが交換）。**語は UTUTU のまま**
     ・裏返す … 位置は変えず、左から1文字ずつ左右反転。どの文字も左右対称なので形は同じ
     どちらも終わった状態が正しい並びなので、何度くり返しても崩れません
     ============================================================ */
  type Letter = { pos: HTMLElement; flip: HTMLElement; at: number; sx: number };
  let markLetters: Letter[] | null = null, markTurn = 0;

  const markPivot = (x: number, s: number) =>
    'translateX(' + x + 'px) scaleX(' + s + ') translateX(' + (-x) + 'px)';

  function markSlide() {
    markLetters!.forEach((L) => {
      const to = MARK.slideMap[L.at];
      if (to === L.at) return;
      L.pos.animate([
        { transform: 'translateX(' + MARK.base[L.at] + 'px)' },
        { transform: 'translateX(' + MARK.base[to] + 'px)' },
      ], { duration: MARK.slideDur, easing: MARK.ease, fill: 'forwards' });
      L.at = to;
    });
  }
  function markFlip() {
    markLetters!.forEach((L, i) => {
      const a = L.sx, b = -a;
      L.flip.animate([
        { transform: markPivot(MARK.pivot, a) },
        { transform: markPivot(MARK.pivot, 0) },
        { transform: markPivot(MARK.pivot, b) },
      ], { duration: MARK.flipDur, delay: i * MARK.flipGap, easing: MARK.ease, fill: 'forwards' });
      L.sx = b;
    });
  }
  function startMarkPlay() {
    if (markLetters) return;
    const wrap = document.querySelector('#brand svg > g');
    if (!wrap) return;
    markLetters = Array.from(wrap.children).map((g, i) => {
      (g as HTMLElement).style.transform = 'translateX(' + MARK.base[i] + 'px)';
      return { pos: g as HTMLElement, flip: g.firstElementChild as HTMLElement, at: i, sx: 1 };
    });
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    (function next(wait: number) {
      later(() => {
        if (dead) return;
        if (!document.hidden) {
          if (markTurn++ % 2 === 0) markSlide(); else markFlip();
        }
        next(MARK.every);
      }, wait);
    })(MARK.first);
  }

  /* ロゴを押したら先頭へ。スマホは1つ目の章と同じ動き、PCも同じ速さで戻す */
  function gotoTop() {
    if (SNAP && chapters.length) { gotoChapter(0); return; }
    const from = scrollY;
    if (from < 2) return;
    const dur = Math.max(700, CHAPTER_DUR[0] * Math.min(1, from / heroMax()));
    const my = ++tweenToken, t0 = performance.now();
    tweening = true;
    (function step(now: number) {
      if (dead || my !== tweenToken) return;
      const t = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, Math.round(from * (1 - easeMove(t))));
      readScroll();
      if (t < 1) requestAnimationFrame(step);
      else { tweening = false; markDots(); }
    })(performance.now());
  }
  on($('brand')!, 'click', gotoTop);

  on(nextBtn, 'click', () => {
    if (chapIdx >= chapters.length - 1) gotoAfter(); // 最後は下のセクションへ
    else gotoChapter(chapIdx + 1);
  });
  on(backBtn, 'click', () => gotoChapter(chapIdx - 1));

  /* ---- 映像区間では指の操作を受け付けない（ボタン操作のみ） ---- */
  on(window, 'touchmove', (e) => {
    if (SNAP && inHero() && !document.body.classList.contains('menu-open')) e.preventDefault();
  }, { passive: false });

  /* ============================================================
     ループ
     ============================================================ */
  let last = performance.now();
  function tick(now: number) {
    if (dead) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    /* 送り中は補間しない。ここで指数の追従を挟むと、スクロールが止まったあとも
       しばらく絵が動き続け、着地に尾が残る。送りの動き自体が等速なので、
       そのまま写せばよい。指の操作で進む場合だけ、揺れを均すために補間する */
    if (tweening) cur = target;
    else cur += (target - cur) * (1 - Math.exp(-9 * dt));

    const idx = fileOf(resolve(Math.round(cur)).real); // 置いてあるファイルの番号
    curFile = idx;

    if (ready && idx !== shown) { draw(idx); shown = idx; }
    // コピーの濃度は小数のまま渡す。丸めるとフェードが段になる
    updateOverlays(cur, dt);

    frame(tick);
  }

  applySnapMode();
  loadAll();
  readScroll();
  syncChrome();
  cur = target;
  frame(tick);

  /* ---- 破棄 ---- */
  return () => {
    dead = true;
    cancelAnimationFrame(raf);
    timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
    offs.forEach((f) => f());
    queue.length = 0;
    lockScroll(false);
    document.documentElement.classList.remove('hide-sb');
    document.body.classList.remove('snap', 'past-hero');
  };
}
