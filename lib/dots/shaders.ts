/* 点描のシェーダ。3つある。

   1) 膜（membrane）… サイト全体の地。2パスで描く。
      pass1：升目1つ＝1画素の小さなテクスチャに「その升目の点の大きさ・色・揺れの許可」を書く。
             うねり（静脈のような筋）・印（ロゴ・数字・QR…）・文字の避け場所・ポインタ・波紋はここ
      pass2：画面の1画素ごとに「どの升目の点の中か」を引いて丸を描く。
             格子そのものを波打たせる（＝うねうね）のと、地の色の塗り替え（網点の幕）はここ
   2) 覆い（cover）… ページ遷移で画面を網点で塗りつぶす／剥がす
   3) 群れ（swarm）… 粒が飛んできて形を組む。遷移の文字、ヒーローのロゴ

   **WebGL1（GLSL ES 1.00）で書くこと。**iOS の古い端末でも動かすため。
   ループの回数は定数、uniform の配列は小さく（印6・避け場所12・波紋6） */

const NOISE = `
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0 - 2.0*f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}`;

export const VS_TRI = `
attribute vec2 a_p;
void main(){ gl_Position = vec4(a_p, 0.0, 1.0); }`;

/* ---------------------------------------------------------------- pass1：升目 */
export const FS_CELLS = `
precision highp float;
uniform vec2 u_origin;     // 格子の原点（css px）。升目(i,j)の中心 = origin + (ij - 1.5) * cell
uniform float u_cell;
uniform float u_time;
uniform vec4 u_mood;       // x 静脈 / y 塊 / z 粉（どこにでもある小さな点）/ w 流れの速さ
uniform float u_intro;     // 0 = ノイズ、1 = 解像
uniform vec3 u_ptr;        // x, y, 効き
uniform float u_lensR;
uniform vec4 u_rip[6];     // x, y, 経過秒, 強さ
uniform vec4 u_sr[6];      // 印の矩形：中心x, 中心y, 半幅, 半高（css px）
uniform vec4 u_su[6];      // 印の絵の場所（アトラスの uv）：u0, v0, u1, v1
uniform vec4 u_sp[6];      // 強さ, 種類, 散らばり, 色（0 = 墨, 1 = 印の色）
uniform vec4 u_se[6];      // 種類ごとの値
uniform vec4 u_zone[12];   // 文字の避け場所：x0, y0, x1, y1
uniform float u_zsoft;
uniform sampler2D u_atlas;
${NOISE}
void main(){
  vec2 ij = floor(gl_FragCoord.xy);
  vec2 p = u_origin + (ij - 1.5) * u_cell;
  float t = u_time * u_mood.w;
  float h = hash(ij);

  /* うねり。ねじった値ノイズの尾根を細く取ると、静脈や虫のような筋になる */
  vec2 q = p / 250.0;
  vec2 w = vec2(vnoise(q*0.9 + vec2(t*0.11, -t*0.07)), vnoise(q*0.9 + vec2(5.2 - t*0.09, 1.7 + t*0.06)));
  float n = vnoise(q*1.45 + 2.7*w + vec2(0.0, t*0.05));
  float ridge = 1.0 - abs(2.0*n - 1.0);
  float veins = smoothstep(0.85, 0.99, ridge);
  float blobs = smoothstep(0.66, 0.95, vnoise(q*0.6 - 1.4*w + t*0.035));
  float dust = 0.06 + 0.045*vnoise(ij*0.21 + t*0.7);
  float r = max(max(veins*u_mood.x*0.56, blobs*u_mood.y*0.5), dust*u_mood.z);
  float acc = 0.0, tint = 0.0, warp = 1.0;

  /* 印 */
  for (int k = 0; k < 6; k++){
    vec4 sp = u_sp[k];
    if (sp.x <= 0.001) continue;
    vec4 sr = u_sr[k];
    vec2 uv = (p - sr.xy) / (2.0*sr.zw) + 0.5;
    if (uv.x < -0.04 || uv.x > 1.04 || uv.y < -0.04 || uv.y > 1.04) continue;
    float mode = sp.y;
    vec4 se = u_se[k];
    vec2 us = uv;
    if (mode > 0.5 && mode < 1.5) us.x = fract(uv.x*se.x + t*se.y);                         // 流れる帯
    if (mode > 2.5 && mode < 3.5) { float row = floor(uv.y*14.0);                          // 速さの線
      us.x = fract(uv.x - t*se.y*(0.55 + hash(vec2(row, 7.0)))); }
    us += (vec2(hash(ij + 1.3), hash(ij + 7.7)) - 0.5) * sp.z;                              // 散らばり
    float inside = step(0.0, us.x)*step(us.x, 1.0)*step(0.0, us.y)*step(us.y, 1.0);
    float d = texture2D(u_atlas, mix(u_su[k].xy, u_su[k].zw, clamp(us, 0.0, 1.0))).r * inside;
    if (mode > 1.5 && mode < 2.5) {                                                         // 棒グラフ
      float bi = floor(uv.x*5.0);
      float hgt = (0.28 + 0.18*bi) * se.x;
      d *= step(1.0 - hgt, uv.y); }
    if (mode > 3.5 && mode < 4.5) { float si = floor(uv.x*5.0); d *= si < se.x ? 1.0 : 0.2; } // 星（点いている数）
    if (mode > 4.5 && mode < 5.5) {                                                         // QR
      float on = step(0.5, d);
      float wob = 0.5 + 0.5*sin(t*3.0 + h*6.283);
      float rr = mix(on*(0.42 + 0.3*wob) + (1.0 - on)*0.04*wob, on*0.88, se.x);
      float a = inside*sp.x;
      r = mix(r, rr, a);
      warp = min(warp, 1.0 - se.x*a);
      tint = max(tint, on*sp.w*a);
      continue; }
    if (mode > 5.5 && mode < 6.5) {                                                         // 面で塗る
      float e = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
      d = step(0.0, e) * smoothstep(0.0, 0.06, e) * (0.5 + 0.5*vnoise(ij*0.45 + t*2.2)); }
    if (mode > 6.5 && mode < 7.5) {                                                         // 床（足元の楕円と波）
      vec2 e2 = (uv - 0.5)*2.0; float rd = length(e2);
      float wob = vnoise(vec2(atan(e2.y, e2.x)*2.0, t*0.8))*0.25;
      d = (1.0 - smoothstep(0.45 + wob, 1.0, rd)) * (0.3 + 0.7*(0.5 + 0.5*sin(rd*15.0 - t*3.2 - se.x*24.0 + wob*6.0))); }
    if (mode > 7.5) {                                                                       // 精度：格子を止めて正す
      float a = inside*sp.x;
      r = mix(r, 0.15, a);
      warp = min(warp, 1.0 - a); }
    d *= sp.x;
    r = max(r, d*0.8);
    tint = max(tint, d*sp.w);
    /* 形の中は格子を揺らさない（形がほどけて読めなくなる）。散らばっているあいだは揺らす。
       足元（床）だけは逆に、うんと揺らす（アバターの下でうごめく） */
    if (mode > 6.5 && mode < 7.5) warp = max(warp, 1.0);
    else warp = min(warp, 1.0 - clamp(d*1.3, 0.0, 0.92)*(1.0 - min(1.0, sp.z*2.0)));
  }

  /* 文字の避け場所。点を小さく、揺れを弱く（読めなくなるのは不可） */
  float z = 0.0;
  for (int k = 0; k < 12; k++){
    vec4 zr = u_zone[k];
    if (zr.z <= zr.x) continue;
    vec2 dd = max(max(zr.xy - p, p - zr.zw), 0.0);
    z = max(z, 1.0 - smoothstep(0.0, u_zsoft, length(dd)));
  }
  r = mix(r, min(r, 0.075), z);
  warp = min(warp, 1.0 - 0.8*z);

  /* ポインタ。点がふくらみ、朱になる */
  vec2 dp = p - u_ptr.xy;
  float L = exp(-dot(dp, dp)/(u_lensR*u_lensR)) * u_ptr.z;
  r += L * (0.12 + 0.55*r) * (1.0 - z*0.85);
  acc = max(acc, smoothstep(0.3, 0.8, L) * step(0.07, r));

  /* 波紋 */
  for (int k = 0; k < 6; k++){
    vec4 R = u_rip[k];
    if (R.w <= 0.0) continue;
    float dist = length(p - R.xy);
    float front = R.z * 820.0;
    float ring = exp(-pow((dist - front)/(55.0 + R.z*110.0), 2.0)) * (1.0 - smoothstep(0.15, 1.5, R.z)) * R.w;
    r += ring * 0.45 * (1.0 - z*0.85);
    acc = max(acc, ring);
  }

  /* 解像（読み込み直後はノイズ） */
  float it = clamp(u_intro*1.7 - h*0.7, 0.0, 1.0);
  it = it*it*(3.0 - 2.0*it);
  float noisy = pow(hash(ij + floor(u_time*11.0 + h*9.0)), 3.0) * 0.6;
  r = mix(noisy, r, it);

  gl_FragColor = vec4(clamp(r, 0.0, 1.0), clamp(acc, 0.0, 1.0), clamp(tint, 0.0, 1.0), clamp(warp, 0.0, 1.0));
}`;

/* ---------------------------------------------------------------- pass2：画面 */
export const FS_DOTS = `
precision highp float;
uniform sampler2D u_cells;
uniform vec2 u_grid;
uniform float u_cell;
uniform vec2 u_origin;
uniform vec2 u_view;       // css px
uniform float u_dpr;
uniform float u_time;
uniform float u_warp;      // 格子のうねりの大きさ（升目の何個ぶん）
uniform vec3 u_ptr;
uniform float u_pull;      // ポインタへ寄せる強さ（長押しで強まる）
uniform float u_lensR;
uniform vec4 u_rip[6];
uniform vec3 u_g, u_fg, u_acc, u_tint;
uniform vec4 u_wipe;       // x, y, 進み, 有効
uniform vec3 u_wc;         // 塗り替える色
uniform float u_dotA;
${NOISE}
void main(){
  vec2 frag = vec2(gl_FragCoord.x, u_view.y*u_dpr - gl_FragCoord.y) / u_dpr;
  float t = u_time;
  vec2 g0 = (frag - u_origin)/u_cell + 2.0;
  float ws = texture2D(u_cells, g0/u_grid).a;

  /* 格子のうねり。点が泳いで見える */
  vec2 wv = vec2(sin(frag.y*0.011 + t*0.9) + 0.6*sin((frag.x + frag.y)*0.0072 - t*0.7),
                 cos(frag.x*0.0125 - t*0.8) + 0.6*cos((frag.x - frag.y)*0.0061 + t*0.6));
  vec2 D = wv * u_warp * u_cell * ws;
  /* ポインタへ群がる */
  vec2 tp = u_ptr.xy - frag;
  D += tp * u_ptr.z * u_pull * exp(-dot(tp, tp)/(u_lensR*u_lensR*2.4));
  /* 波紋で押し出される */
  for (int k = 0; k < 6; k++){
    vec4 R = u_rip[k];
    if (R.w <= 0.0) continue;
    vec2 dir = frag - R.xy;
    float dist = length(dir);
    float ring = exp(-pow((dist - R.z*820.0)/(55.0 + R.z*110.0), 2.0)) * (1.0 - smoothstep(0.15, 1.5, R.z)) * R.w;
    D += dir/(dist + 1.0) * ring * 18.0;
  }
  vec2 q = frag - D;
  vec2 g = (q - u_origin)/u_cell + 2.0;
  vec2 ci = floor(g);
  vec4 c = texture2D(u_cells, (ci + 0.5)/u_grid);
  /* 揺らしてはいけない升目（形や文字の場所）に、揺れで遠くから入り込まない。
     入り込むと、形の点が外側にずれて写り、輪郭が二重に見える（実際に起きた） */
  if (c.a < 0.98) {
    q = frag - D*c.a;
    g = (q - u_origin)/u_cell + 2.0;
    ci = floor(g);
    c = texture2D(u_cells, (ci + 0.5)/u_grid);
  }
  vec2 f = g - ci - 0.5;
  /* 点ひとつずつの揺れ（升目ごとに位相をずらした円運動。ノイズより軽い） */
  float hc = hash(ci);
  vec2 jit = vec2(sin(t*0.9 + hc*6.283), cos(t*0.75 + hc*12.57)) * 0.5;
  f -= jit * 0.3 * c.a;
  float r = c.r * 0.8;
  float aa = 0.9/(u_cell*u_dpr) + 0.015;
  float a = (1.0 - smoothstep(r - aa, r + aa, length(f))) * step(0.012, r) * u_dotA;
  vec3 col = mix(mix(u_fg, u_acc, c.g), u_tint, c.b);
  vec3 o = mix(u_g, col, a);

  /* 地の塗り替え。新しい色の点が、起点から膨らんで面になる */
  if (u_wipe.w > 0.5) {
    vec2 cc = u_origin + (ci - 1.5)*u_cell;
    float dist = length(cc - u_wipe.xy)/(length(u_view)*1.02);
    float nz = vnoise(ci*0.23 + t*2.5);
    float cov = clamp((u_wipe.z*1.3 - dist)*3.2 + (nz - 0.5)*0.9, 0.0, 1.0);
    float rr = cov*0.84;
    float aw = 1.0 - smoothstep(rr - aa, rr + aa, length(f));
    if (cov > 0.999) aw = 1.0;
    if (cov < 0.01) aw = 0.0;
    o = mix(o, u_wc, aw);
  }
  gl_FragColor = vec4(o, 1.0);
}`;

/* ---------------------------------------------------------------- 覆い */
export const FS_COVER = `
precision highp float;
uniform vec2 u_view;
uniform float u_dpr, u_time, u_size;
uniform vec4 u_cov;        // x, y, 進み, 向き（+1 覆う / -1 剥がす）
uniform vec3 u_col;
${NOISE}
void main(){
  vec2 frag = vec2(gl_FragCoord.x, u_view.y*u_dpr - gl_FragCoord.y) / u_dpr;
  float cell = u_size;
  vec2 ci = floor(frag/cell);
  vec2 f = fract(frag/cell) - 0.5;
  vec2 cc = (ci + 0.5)*cell;
  float dist = length(cc - u_cov.xy)/length(u_view);
  float nz = vnoise(ci*0.21 + u_time*3.0);
  float h = hash(ci);
  float k = clamp((u_cov.z*1.5 - dist)*2.6 + (nz - 0.5)*1.2 + (h - 0.5)*0.35, 0.0, 1.0);
  float cov = u_cov.w > 0.0 ? k : 1.0 - k;
  /* 縁は沸き立つ（点がもぞもぞ動く） */
  float edge = cov*(1.0 - cov)*4.0;
  float tt = floor(u_time*24.0);
  f += (vec2(hash(ci + tt), hash(ci + 3.1 + tt)) - 0.5) * 0.6 * edge;
  float r = cov*0.8;
  float aa = 1.2/(cell*u_dpr);
  float a = 1.0 - smoothstep(r - aa, r + aa, length(f));
  if (cov > 0.999) a = 1.0;
  if (r < 0.01) a = 0.0;
  gl_FragColor = vec4(u_col*a, a);
}`;

/* ---------------------------------------------------------------- 群れ */
export const VS_SWARM = `
attribute vec4 a_seed;
attribute vec2 a_target;
uniform vec2 u_view;
uniform float u_dpr, u_time;
uniform float u_t;         // 集まる 0..1
uniform float u_out;       // 散る 0..1
uniform vec2 u_from;       // 湧き出す場所
uniform float u_spawn;     // 0 = 画面じゅうから / 1 = 湧き出す場所から
uniform float u_size;
varying float v_a;
void main(){
  vec2 rnd = a_seed.xy * u_view * 1.3 - u_view*0.15;
  vec2 start = mix(rnd, u_from + (a_seed.zw - 0.5)*90.0, u_spawn);
  float delay = a_seed.x * 0.42;
  float tt = clamp((u_t - delay)/0.58, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - tt, 3.0);
  vec2 p = mix(start, a_target, e);
  vec2 dir = a_target - start;
  vec2 perp = vec2(-dir.y, dir.x);
  p += perp * 0.38 * sin(e*3.14159) * (a_seed.y - 0.5) * 2.0;
  /* 虫のようにもぞもぞ */
  p += vec2(sin(u_time*13.0 + a_seed.z*60.0), cos(u_time*11.0 + a_seed.w*60.0)) * (1.2 + 16.0*(1.0 - e));
  /* 散る */
  float o = clamp((u_out - a_seed.w*0.35)/0.65, 0.0, 1.0);
  o = o*o;
  vec2 c = u_view*0.5;
  vec2 away = normalize(a_target - c + vec2(0.001, 0.002));
  p += (away*u_view.x*0.7 + perp*0.15) * o
     + vec2(sin(a_seed.x*40.0 + u_time*3.0), cos(a_seed.y*40.0 + u_time*2.6)) * 160.0 * o;
  vec2 clip = p / u_view * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = u_size * u_dpr * (0.75 + 0.5*a_seed.w) * mix(1.7, 1.0, e) * (1.0 - o*0.6);
  v_a = (1.0 - o) * smoothstep(0.0, 0.12, u_t - delay*0.25);
}`;

export const FS_SWARM = `
precision highp float;
uniform vec3 u_col;
uniform float u_alpha;
varying float v_a;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = (1.0 - smoothstep(0.42, 0.5, d)) * v_a * u_alpha;
  gl_FragColor = vec4(u_col*a, a);
}`;
