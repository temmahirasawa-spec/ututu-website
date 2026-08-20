/* Founders のアバタービューア（全身・カラー版）
   - Avaturn 書き出しの GLB（テクスチャ・スケルトン入り）をそのまま表示する
   - ドラッグで回転（ヨーのみ・慣性つき）／タップで「一瞬驚く」
   - アニメーションクリップが入っていれば最初のクリップをループ再生し、
     タップ時は2つ目以降のクリップがあればそれを1回流して戻る。
     クリップが無いT-Pose書き出しでは、腕を体側に下ろして立たせ、
     タップはその場で小さく跳ねる
   - 3.8MBあるので読み込みは founders に近づいたときだけ（index.html側の遅延import）
   - 読み込みや WebGL に失敗したら、破線のプレースホルダのまま何もしない */
import * as THREE from './three.module.min.js';
import { GLTFLoader } from './GLTFLoader.min.js';

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PAPER = 0xF3F1EC, OLIVE = 0x93A878;
// モデルの版番号。GLBを差し替えたら必ず上げる。
// 付けないと端末が古いGLBやJSを掴み続ける（実際にそれで壊れた絵が出た）
const VER = '20260819b';

/* T-Pose の腕を体側へ下ろす。
   ボーンのローカル軸はリグ次第で当てにならないので、
   「いまの腕の向き→目標の向き」の回転をワールド空間で作り、
   親の姿勢でローカルに引き戻して適用する（リグの規約に依存しない） */
function aimBone(bone, child, targetDir){
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  bone.getWorldPosition(a); child.getWorldPosition(b);
  const dir = b.sub(a).normalize();
  const qw = new THREE.Quaternion().setFromUnitVectors(dir, targetDir.clone().normalize());
  const pw = new THREE.Quaternion();
  bone.parent.getWorldQuaternion(pw);
  const m = pw.clone().invert().multiply(qw).multiply(pw);
  bone.quaternion.premultiply(m);
  bone.updateMatrixWorld(true);
}

function relaxArms(root){
  const arms = [['LeftArm', 'LeftForeArm'], ['RightArm', 'RightForeArm']];
  arms.forEach(function(pair){
    const bone = root.getObjectByName(pair[0]);
    const child = root.getObjectByName(pair[1]);
    if (!bone || !child) return;
    const a = new THREE.Vector3(), b = new THREE.Vector3();
    bone.getWorldPosition(a); child.getWorldPosition(b);
    const outward = Math.sign(b.x - a.x) || 1;          // 外側に少し開く
    aimBone(bone, child, new THREE.Vector3(outward * 0.13, -1, 0.04));
    const hand = root.getObjectByName(pair[1].replace('ForeArm', 'Hand'));
    if (hand) aimBone(child, hand, new THREE.Vector3(outward * 0.10, -1, 0.10));
  });
}

/* いまのポーズでの本当の境界箱を出す。
   Box3.setFromObject はスキンメッシュだとバインドポーズ（T-Pose）の箱を返すので、
   腕を下ろしても「腕を広げた幅」のままになり、カメラが無駄に引いて人が小さくなる。
   getVertexPosition はボーンの変形を反映した頂点を返すので、これで測り直す */
function poseBounds(root, mixer, clip){
  const box = new THREE.Box3();
  // 動きの途中で手足が枠から出ないよう、クリップ全体を等間隔で見て合成する
  const times = [];
  if (mixer && clip){
    const N = 8;
    for (let i = 0; i < N; i++) times.push(clip.duration * i / N);
  } else times.push(null);
  times.forEach(function(t){
    if (t !== null){ mixer.setTime(t); }
    accumulate(root, box);
  });
  if (mixer) mixer.setTime(0);
  return box;
}

function accumulate(root, box){
  const v = new THREE.Vector3();
  root.updateMatrixWorld(true);
  root.traverse(function(o){
    if (o.isSkinnedMesh){
      // 全頂点を見ると端末によっては数百msスレッドを止める。間引いて足りる
      const n = o.geometry.attributes.position.count;
      for (let i = 0; i < n; i += 4){
        o.getVertexPosition(i, v);
        box.expandByPoint(v.applyMatrix4(o.matrixWorld));
      }
    } else if (o.isMesh){
      o.geometry.computeBoundingBox();
      box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));
    }
  });
}

/* ボーンを「ワールドのこの軸まわりに」回す。
   ボーンのローカル軸はリグ次第なので、軸を親の空間に持ち込んでから掛ける。
   mixer.update() のあとに呼べば、走りの動きの上に重なる（毎フレーム
   クリップから書き直されるので、掛け続けても溜まらない） */
function nudge(bone, worldAxis, angle){
  if (!bone || !angle) return;
  const q = new THREE.Quaternion();
  bone.parent.getWorldQuaternion(q);
  const axis = worldAxis.clone().applyQuaternion(q.invert()).normalize();
  bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, angle));
}

const X = new THREE.Vector3(1, 0, 0), Z = new THREE.Vector3(0, 0, 1);

/* びくっとする。k は 0〜1 の強さ。

   これらの回転は「掛けて、描いて、すぐ戻す」。次のフレームは必ず
   mixer が書いた状態から始まるので、絶対に溜まらない。

   以前は「クリップが動かすボーンかどうか」を調べて、動かさないものだけ
   戻していたが、これが誤りだった。**トラックがあっても値が一定なら
   three.js はシーンに書き戻さない**（変化が無いときは setValue を省く）。
   走りのモーションは頭が首に対して静止しているため、頭のトラックはあるのに
   書き戻されず、掛けた回転が積み上がって首が折れた。
   検出に頼らないこの方式なら、クリップの中身が何であれ壊れない。 */
function applyStartle(b, k){
  if (!k) return;
  [b.spine, b.spine1, b.spine2].forEach(function(x){ nudge(x, X, -0.17 * k); });
  // のけぞりは控えめに。背骨・首・頭は連なって効くので、
  // 大きくすると首が折れたように見える。反応は腕で見せる
  nudge(b.neck, X, -0.15 * k);
  nudge(b.head, X, -0.18 * k);
  // 両手を「わっ」と顔の高さまで上げる。肩から開いて、肘を深く曲げる
  nudge(b.lShoulder, Z,  0.30 * k); nudge(b.rShoulder, Z, -0.30 * k);
  nudge(b.lArm, Z,  1.45 * k);      nudge(b.rArm, Z, -1.45 * k);
  nudge(b.lArm, X, -0.35 * k);      nudge(b.rArm, X, -0.35 * k);
  nudge(b.lFore, X, -1.25 * k);     nudge(b.rFore, X, -1.25 * k);
}

/* ---------- 1体ぶんの組み立て ---------- */
async function makeAvatar(slot){
  const name = slot.getAttribute('data-head');
  if (!name) return null;

  const canvas = document.createElement('canvas');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) { return null; }                          // WebGL不可 → プレースホルダのまま
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  let gltf;
  try {
    gltf = await new GLTFLoader().loadAsync('./models/' + name + '.glb?v=' + VER);
  } catch (e) {
    console.warn('アバターを読み込めませんでした:', name, e);
    renderer.dispose();
    return null;
  }

  const model = gltf.scene;
  model.traverse(function(o){
    if (o.isSkinnedMesh) o.frustumCulled = false;       // スキン変形でAABBが狂うため
  });

  // アニメーションが無い書き出し（T-Pose）は腕を下ろして立たせる
  const clips = gltf.animations || [];
  let mixer = null, idleAction = null;
  if (clips.length){
    mixer = new THREE.AnimationMixer(model);
    idleAction = mixer.clipAction(clips[0]);
    idleAction.play();
    mixer.update(0);                                     // 1コマ目の姿勢を反映してから採寸する
  } else {
    relaxArms(model);
  }

  const bones = {
    spine: model.getObjectByName('Spine'),  spine1: model.getObjectByName('Spine1'),
    spine2: model.getObjectByName('Spine2'), neck: model.getObjectByName('Neck'),
    head: model.getObjectByName('Head'),
    lArm: model.getObjectByName('LeftArm'),  rArm: model.getObjectByName('RightArm'),
    lFore: model.getObjectByName('LeftForeArm'), rFore: model.getObjectByName('RightForeArm'),
    lShoulder: model.getObjectByName('LeftShoulder'), rShoulder: model.getObjectByName('RightShoulder')
  };

  // 驚きで触るボーンの一覧。毎フレーム、掛ける前に控えて描画後に戻す
  bones.list = Object.keys(bones)
    .map(function(k){ return bones[k]; })
    .filter(function(x){ return x && x.isObject3D; });

  // 採寸して、回転の軸が体の中心を通るように包む
  const box = poseBounds(model, mixer, clips.length ? clips[0] : null);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const pivot = new THREE.Group();
  pivot.add(model);
  model.position.sub(center);

  const scene = new THREE.Scene();
  scene.add(pivot);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);

  scene.add(new THREE.HemisphereLight(PAPER, 0x6b705c, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(2, 3, 3);
  const rim = new THREE.DirectionalLight(OLIVE, 1.1);    rim.position.set(-2.5, 1, -3);
  scene.add(key, rim);

  const st = {
    slot, canvas, renderer, scene, camera, pivot, size, bones,
    mixer, clips, idleAction, oneShot: null, startleT: 1,
    yaw: -0.4, vyaw: 0, hopT: 1,
    dragging: false, decided: false, pointer: -1, moved: 0, px: 0, py: 0,
    lastTouch: performance.now()
  };

  function frame(){
    const w = slot.clientWidth || 140;
    const h = slot.clientHeight || 220;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);   // setSize より先。逆だと次の setSize まで効かない
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // 高さと幅のどちらも収まる距離に引く
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    // 注視点はずらさない。上げると足元が枠の下端で切れる
    const dH = (size.y / 2) * 1.09 / t;
    const dW = (Math.max(size.x, size.z) / 2) * 1.15 / (t * camera.aspect);
    camera.position.set(0, 0, Math.max(dH, dW));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }
  frame();
  addEventListener('resize', frame);

  /* 操作。
     縦スワイプはページのスクロールなので、絶対に横取りしない。
     pointerdown で即 setPointerCapture すると、アバターの上から始めた
     スクロールまで奪ってしまい、ページが遅れて追いつく＝画面が飛ぶ。
     指が横に動いたと分かってから初めて捕まえる（マウスは競合しないので即座に） */
  canvas.addEventListener('pointerdown', function(e){
    st.pointer = e.pointerId;
    st.px = e.clientX; st.py = e.clientY;
    st.moved = 0; st.vyaw = 0;
    st.decided = (e.pointerType === 'mouse');
    st.dragging = st.decided;
    if (st.decided) canvas.setPointerCapture(e.pointerId);
    st.lastTouch = performance.now();
  });
  canvas.addEventListener('pointermove', function(e){
    if (st.pointer !== e.pointerId) return;
    const dx = e.clientX - st.px, dy = e.clientY - st.py;
    if (!st.decided){
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)){
        st.pointer = -1;                 // 縦の指運び → 手を引いてページに任せる
        return;
      }
      if (Math.abs(dx) < 8) return;      // まだ判断がつかない
      st.decided = true; st.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    }
    st.px = e.clientX; st.py = e.clientY;
    st.moved += Math.abs(dx);
    st.yaw += dx * 0.012;
    st.vyaw = dx * 0.012;
    st.lastTouch = performance.now();
  });
  canvas.addEventListener('pointerup', function(e){
    if (st.pointer !== e.pointerId) return;
    st.pointer = -1;
    const wasDragging = st.dragging;
    st.dragging = false;
    st.lastTouch = performance.now();
    if (!wasDragging || st.moved < 6) startle(st);   // 動かしていなければタップ扱い
  });
  canvas.addEventListener('pointercancel', function(){
    st.pointer = -1; st.dragging = false;
  });

  // 最初の1フレームは同期的に描く。rAFが止まっている環境でも絵が出るし、
  // 失敗すればここで例外になり、プレースホルダが残る
  renderer.render(scene, camera);

  slot.querySelectorAll('svg').forEach(function(el){ el.remove(); });
  slot.appendChild(canvas);
  slot.classList.add('live');
  return st;
}

/* タップ＝一瞬驚く。
   予備のクリップ（2つ目以降）があればそれを1回流して戻る。
   無ければその場で小さく跳ねる */
function startle(st){
  if (st.mixer && st.clips.length > 1){
    if (st.oneShot) return;                              // 連打で多重再生しない
    const clip = st.clips[1 + Math.floor(Math.random() * (st.clips.length - 1))];
    const act = st.mixer.clipAction(clip);
    act.reset();
    act.setLoop(THREE.LoopOnce, 1);
    act.clampWhenFinished = false;
    st.idleAction.crossFadeTo(act, 0.15, false);
    act.play();
    st.oneShot = act;
    st.mixer.addEventListener('finished', function onEnd(e){
      if (e.action !== act) return;
      st.mixer.removeEventListener('finished', onEnd);
      st.idleAction.reset().play();
      act.crossFadeTo(st.idleAction, 0.2, false);
      st.oneShot = null;
    });
    return;
  }
  if (REDUCE) return;
  st.hopT = 0;                                           // 跳ねる
  st.startleT = 0;                                       // びくっとする
}

/* ---------- 全体のループ。セクションが見えている間だけ回す ---------- */
const heads = [];
let running = false, rafId = 0, prevT = 0;

function tick(now){
  const dt = Math.min((now - prevT) / 1000 || 0.016, 0.05);
  prevT = now;
  heads.forEach(function(st){
    if (st.mixer) st.mixer.update(dt);

    // 驚き：一瞬で立ち上げて、ゆっくり戻す。
    // mixer.update() の「あと」に掛けるので走りの動きの上に重なる
    let saved = null;
    if (st.startleT < 1){
      st.startleT = Math.min(1, st.startleT + dt / 0.85);
      const t = st.startleT;
      const k = t < 0.16 ? t / 0.16 : Math.pow(1 - (t - 0.16) / 0.84, 2);
      saved = st.bones.list.map(function(b){ return b.quaternion.clone(); });
      applyStartle(st.bones, k);
    }

    // 跳ね（タップの驚き）：放物線で浮いて、少しのけぞる
    let hopY = 0, lean = 0;
    if (st.hopT < 1){
      st.hopT = Math.min(1, st.hopT + dt / 0.45);
      hopY = Math.sin(st.hopT * Math.PI) * st.size.y * 0.035;
      lean = -Math.sin(st.hopT * Math.PI) * 0.07;
    }
    // 慣性と、放っておいたときのゆらぎ・呼吸
    if (!st.dragging){
      st.yaw += st.vyaw; st.vyaw *= 0.93;
      if (!REDUCE && now - st.lastTouch > 2500){
        st.yaw += Math.sin(now / 2100) * 0.0012;
      }
    }
    const breathe = (!REDUCE && !st.mixer) ? Math.sin(now / 900) * st.size.y * 0.002 : 0;
    st.pivot.position.y = hopY + breathe;
    st.pivot.rotation.set(lean, st.yaw, 0);
    st.renderer.render(st.scene, st.camera);
    // 描いたらすぐ戻す。これで次フレームは mixer の状態から始まる
    if (saved) st.bones.list.forEach(function(b, i){ b.quaternion.copy(saved[i]); });
  });
  if (running) rafId = requestAnimationFrame(tick);
}
function setRunning(on){
  if (on === running) return;
  running = on;
  if (on) rafId = requestAnimationFrame(tick);
  else cancelAnimationFrame(rafId);
}

export async function initHeads(slots){
  const made = await Promise.all(slots.map(function(slot){
    return makeAvatar(slot).catch(function(e){
      console.warn('アバターを用意できませんでした', e); return null;
    });
  }));
  made.forEach(function(st){ if (st) heads.push(st); });
  if (!heads.length) return false;
  const sec = heads[0].slot.closest('#founders') || heads[0].slot;
  // IntersectionObserver の初回コールバックを待たず、いま見えていれば回し始める。
  // 読み込みが終わった時点で既に画面内、という場合に取りこぼさない
  const r = sec.getBoundingClientRect();
  if (r.top < innerHeight + 120 && r.bottom > -120) setRunning(true);
  const io = new IntersectionObserver(function(es){
    es.forEach(function(e){ setRunning(e.isIntersecting); });
  }, { rootMargin: '120px' });
  io.observe(sec);
  return true;
}
