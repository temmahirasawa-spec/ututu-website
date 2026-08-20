# UTUTU コーポレートサイト（Next.js 版）

株式会社UTUTU のコーポレートサイトを Next.js で作り直すリポジトリです。
**トップページ（KV＋紙のセクション）の移植は済んでいます。**残りは下層ページです。

動きの正解は静的版です。**迷ったら原本を見てください。**

```
本番  : https://ututu-website.vercel.app （main に push すると自動デプロイ）
GitHub: temmahirasawa-spec/ututu-website （Public）
参照用: reference/legacy-index.html      （1,965行。CSSとJSが全部入っている原本のコピー）
        reference/legacy-head-viewer.js  （Founders の3Dアバター）
        reference/legacy-CLAUDE.md       （★必読。踏んだ地雷が全部書いてある）
原本の作業コピー: ~/Library/CloudStorage/Dropbox/UTUTU/コーポレートサイト/UTUTU_Website/
```

**2026-08-20、静的版のリポジトリをこれで上書きしました。**GitHub も Vercel も
静的版のものを使い回しています。Dropbox の `UTUTU_Website/` はそのまま残して
ありますが、**remote はこちらに置き換わっているので、あそこで pull しないこと**
（まったく別のものが落ちてきます）。

---

## 1. まず読むもの

`reference/legacy-CLAUDE.md` を先に読んでください。**このサイトの難所はほぼ全部そこに書いてあります。**
KVのコマ送り、ホモグラフィによるUI合成、読み込みキュー、章送り、そして
1日かけて潰した不具合の原因が、再発防止のために記録してあります。

---

## 2. 構成

```
app/
  layout.tsx              フォント（next/font）とメタ情報
  page.tsx                トップ ＝ <Hero /> ＋ <After />
  globals.css             トークン・素の指定・ロゴ/メニュー・紙のセクション
components/
  hero/                   KV（映像区間）
    Hero.tsx              マークアップ。useEffect で startHero() を起動し、戻り値で破棄
    heroEngine.ts         コマ送り・ホモグラフィ・読み込みキュー・章送り・ロゴの遊び
    heroConfig.ts         **数値はここだけ。**holds の四隅 / COPY_AT / CHAPTER_DUR / MARK
    hero.css              KVのCSS（原本から行ごと切り出したもの）
    LoadArt.tsx           ローディングの線画（差し替えるのはここ）
    Mark.tsx              ロゴ。#brand と #loadMark で同じものを使う
  after/                  紙のセクション（#after）
    After.tsx             マークアップ
    Products.tsx          GOOD ORDER / GOOD REVIEW の2節。**紙ではなく各サービスのトンマナ**
    products.css          同上のCSS
    afterEffects.ts       現れる / 紙⇄墨の反転 / 帯の速さ / 3Dの遅延読み込み
    BioModal.tsx          プロフィール。本文は状態で持つ
    bios.ts               Founders の全文（本人支給の確定稿）
lib/three/      three.js r185・GLTFLoader（自家ビルド版）と headViewer.js。npm ではなく同梱
public/         連番画像・動画・写真・3Dモデル。パスは /frames/f_0001.webp の形
reference/      移植元の原本。配信しない（.vercelignore 済み）
scripts/        エッジ温めスクリプトと Blender 用スクリプト
```

素材は約29MB・1,183ファイル。`public/` 直下に置いてあるので、
`/frames/f_0001.webp` のように参照します。

**連番は4種類あります。**片方の向きしか読まないので、実際に落ちるのは半分です。

| | 中身 |
|---|---|
| `frames/` `frames_lo/` | 横位置（PC）の本番と先読み |
| `frames_p/` `frames_lo_p/` | 縦位置（スマホ）の本番と先読み |

---

## 3. 決めたこと

- **Tailwind は入れない。**KVのCSSは実機で詰めた実測値の塊で、書き換えると必ず事故る。
  原本のCSSをそのまま `globals.css` とKV用のCSSに分けて持ち込む。新ページも同じ流儀で書く
- **Next 16 / React 19 / TypeScript / App Router**（兄弟サイト GOOD_ORDER_LP と同じ）
- Vercel の function region は東京 `hnd1`（`vercel.json`）
- 連番・動画・モデルは1年 immutable キャッシュ（`vercel.json`）
- **`vercel.json` の `"framework": "nextjs"` は消さないこと。**
  このVercelプロジェクトは静的版から使い回していて、ダッシュボードの
  Framework Preset が `Other`／出力先 `public` のまま残っている。
  この1行が無いと**アプリではなく `public/` の連番がそのまま配信される**。
  なお `vercel.json` にコメントは書けない（`"//"` のようなキーを足すと
  スキーマ検証で落ちてデプロイが失敗する）
- **フォントは `next/font`**（app/layout.tsx）。原本の `<link>` はやめ、変数で渡している。
  `--jp-body` / `--jp-title` の中身が `var(--font-barlow)` などに変わっただけで、
  **並び（欧文が先、和文が次）は原本のまま**。和文は容量が大きいので `preload:false`。
  先に読ませるとKVの連番と帯域を取り合う
- **エンジンは「起動して、破棄を返す」形**（`startHero()` / `startAfter()`）。
  開発中はReactが effect を2回走らせるので、**畳み残すとループが二重に回る**。
  登録したイベント・タイマー・rAF は全部戻り値で畳むこと

### 踏んだ落とし穴

- **`public/frames_lo_p/` を忘れないこと。**土台を作ったとき、この1つだけ
  コピーが漏れていた。**縦位置の先読みが全部404になる**が、欠けたコマは
  直前のコマで埋まる実装なので、PCで見るかぎり何も起きず気づけない。
  `vercel.json` の `headers` のパターンにも入れること（入れ忘れると
  縦位置だけキャッシュが効かない）
- **`next.config.ts` の `turbopack.root` は消さないこと。**
  `~/package-lock.json` が存在するため、指定しないと Turbopack がホームディレクトリを
  プロジェクトの根と誤認し、**`public/` の素材が全部404になる**。
  症状は「トップページは出るのに画像だけ出ない」。設定を変えたのに直らないときは、
  古い `next dev` のプロセスが残って応答していないか `pkill -f "next dev"` で確認する

---

## 4. 移植の進み具合

1. ~~**globals.css**~~ … 済。原本のCSSを**行ごと切り出して**2つに分けた。
   打ち直していないので、実測値はそのまま残っている
2. ~~**KV（`components/hero/`）**~~ … 済。canvas・ホモグラフィ・読み込みキュー・章送り
3. ~~**紙のセクション（`#after`）**~~ … 済。反転・帯・図解・Founders・モーダル
4. **下層ページ** … GOOD ORDER / GOOD REVIEW / 会社概要 / お問い合わせ　← いまここ
5. **メタ情報** … OGP画像・favicon（未着手）

分け方は原本の構成に合わせてあります。`ScrollSequence` / `ScreenComposite` /
`ChapterNav` の3つに割るという当初案は採りませんでした。**3つは同じ状態
（`cur` / `target` / `imgs` / 1本のrAF）を共有していて、切ると受け渡しの
ためだけの配線が増えるからです。**代わりに「マークアップ＝React、
動き＝1つのエンジン、数値＝config」で割ってあります。

### 原本と一致しているか、数値で確かめる方法

見た目を目で比べる必要はありません。**静的版を隣で動かして、
同じスクロール位置での `matrix3d` を突き合わせれば一致は証明できます。**

```bash
npx serve ~/Library/CloudStorage/Dropbox/UTUTU/コーポレートサイト/UTUTU_Website -l 5054
```

同じ画面サイズにして、両方で同じ位置までスクロールし、
`document.getElementById('tint').style.transform` を比べます。
四隅・fit・ホモグラフィ・停止点の解決が全部そこに畳み込まれているので、
**1文字でも違えばどこかがずれています。**
移植した時点では、縦横それぞれ10点で完全一致していました
（`scrollY` / 停止点の入り / `stage` のズーム / `scrim` / コピーの濃度 / 帯の秒数も同じ）。

---

### プロダクト2節（2026-08-20 に作り直し）

**この2節だけ、紙のトンマナから外れます。**映像セクションで概要は伝えているので、
ここからは「それぞれのサービスの世界」に切り替えて見せる、という判断です（本人）。

最初はSVGの線画で図解を作りましたが、**プレゼン資料のようで先進的に見えない**という
指摘があり、実物の画面とブランドのイラストで組み直しました。線画の図解（`.fig` / `.fg`）は
撤去済みです。戻したくなったら 2026-08-20 のコミットから拾えます。

| | GOOD ORDER | GOOD REVIEW |
|---|---|---|
| 採色元 | good-order-lp.vercel.app | goodloop-official.vercel.app |
| 地 | 白→クリーム `#FCF7EE` | 白→ミント `#F3FCF9` |
| アクセント | 琥珀 `#FAC03D` / 濃い `#996B00` | 緑 `#34CA9B` / 濃い `#1F8C6B`、星は `#FFC32B` |
| 見出し | LPのヒーロー「いいデザインは、売上に効く。」 | LPのSOLUTION「良い声は表へ、本音はお店へ。」 |
| 主役 | 実機の注文画面2枚＋フロートチップ | ブランドのイラスト＋実機の画面3枚 |
| 3つの特長 | LPの SOLUTION 01〜03 | LPの FEATURE 01〜03 |

- 画像は `public/img/products/`（8点・約300KB）。**公式LPから落として webp に変換したもの**です。
  LPの画面を差し替えたら、ここも作り直してください
- **GOOD ORDER に数字は出さないこと。**LPでも客単価・注文点数は「測定中」です
- **★3.5→★4.2 は FROMA の実測値**（LPの REAL STORE RESULT）。盛らないこと
- **`.pv-run` の `white-space: nowrap` を外さないこと。**和文はどこでも折れるため、
  flex の中では min-content が1文字ぶんになり、縦1列に潰れます（実際に潰れました）
- **`.pv-blob` には必ず位置と上限を付けること。**位置指定を省くと静的位置から
  108% 四方に広がり、下の特長カードに被ります（実際に被りました）

**名前の食い違いに注意。**レビュー側は、コーポレートでは `GOOD REVIEW` ですが、
公式LP・Figma・管理画面（`admin.goodloop.jp`）はすべて `GOOD LOOP` です。
2026-08-20 時点では**コーポレート側は GOOD REVIEW のまま**という判断（本人）。
なお `good-order.jp` と `good-review.jp` はまだDNSが引けず（＝「公式サイトへ」は
現状リンク切れ）、`goodloop.jp` / `good-loop.jp` は**別会社**のサイトです。

### 見た目を確かめるときの近道

ブラウザーのペインが隠れていると rAF も IntersectionObserver も止まるので、
`.rv` が open せず真っ白に写ります。**ヘッドレスの Chrome で直接撮るのが速い**です。

```bash
npm run dev
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --window-size=1280,2600 --virtual-time-budget=15000 \
  --screenshot=/tmp/pv.png "http://localhost:3000/"
```

`.rv` を待たずに見たいときは、確認用のページを一時的に作って
`.rv{opacity:1!important}` を当てるのが手っ取り早いです（作ったら消すこと）。
なお**ヘッドレスは幅の狭い指定だと実機と違う折り返しになることがあります。**
モバイルの確認は、幅を変えた実ブラウザで `document.documentElement.scrollWidth` を
見るほうが確実です。

---

## 5. 移植で絶対に外さないこと

原本で実際に事故った項目です。詳細は `reference/legacy-CLAUDE.md`。

- **連番画像に `next/image` を使わない。**canvas に描くので素の `new Image()`
- **同時8本の優先度付きキュー（`pump()`）を維持する。**
  一斉にリクエストすると接続が埋まり、動画が永久に読み込まれない。
  8本なのはHTTP/2で多重化されるから。24本にすると逆に半分の速度に落ちた
- **three.js はブラウザでしか触らない。**WebGL はサーバーで動かないので、
  `afterEffects.ts` の中（＝クライアント側）から動的 import している。
  Founders が近づいたときだけ読む構造も維持すること（KVの速度に影響させない）
- **GLBのURLには版番号（`?v=`）を付ける。**付けないと端末が古いものを掴み続け、
  実際にそれで壊れた絵が出た。`lib/three/headViewer.js` の `VER` を上げること。
  **JSのほうは要らなくなりました**（バンドラが内容ハッシュ付きの名前で出すため）
- **編集モード `?edit=1` は残す。**停止点の座標調整は今後も発生する
- **Vercelへは Git 経由でデプロイする。**CLI だと24時間5,000ファイル制限に当たる
- 画面の向きが変わると素材そのものが変わる。読み込み済み画像を捨てて読み直す
- 埋め込み動画（`CLIP_ORDER_DATA` / `CLIP_REVIEW_DATA`）は**削除する**。
  Vercel は Range に対応しているので外部ファイルでよい（約350KBの無駄）

---

## 6. ローカルでの起動

```bash
npm run dev      # http://localhost:3000
npm run check    # lint と型チェック
npm run build    # 本番ビルド
```

コンソールに `UTUTU scroll sequence build ...` と
`読み込み完了まで ○○ms` が出れば動いています。

### 動きを確かめるときの注意

**ブラウザーのペインが隠れていると、`requestAnimationFrame` も
`IntersectionObserver` も止まります**（間引かれるのではなく、完全に止まります）。
ローディングが数%から進まない、`.rv` がいつまでも現れない、というときは
だいたいこれで、コードのせいではありません。ペインを表に出してください。

どうしてもヘッドレスで確かめたいときは、rAF と `performance.now()` を
まとめて差し替えて手でコマを送ります。**時計は片方だけ差し替えないこと。**
章送りは `performance.now()` を基準に補間するので、rAF の時刻だけ偽物にすると
`dt` が負になり、絵が逆走したりコピーの濃度が範囲外まで膨らんだりします
（移植の検証中に実際に起きて、コードの不具合と1度取り違えました）。

---

## 7. まだ残っている作業

### 下層ページ（これから）

- GOOD ORDER / GOOD REVIEW / 会社概要 / お問い合わせ
- メニューのリンク先URL（いまは `good-order.jp` などの仮）
- フッターの「（準備中）」を、できたページへ差し替える

### 移植元から引き継いだもの

- **橋の節の数字がサンプルのまま**（直営4 / 導入3 / 3.9倍 / +18%）。
  GOOD REVIEW の図解には FROMA の実測（★3.5→★4.2）が入ったので、
  **同じページに実測とサンプルが混在している。**早めに揃えること
- 洋輔さんの Avaturn アバター（`public/models/yosuke.glb` に置くだけで有効）
- 管理画面のスクリーンショット（Figmaから）
- OGP画像・favicon・メタ情報
- **未解決の不具合**：洋輔さんの PROFILE をタップするとトップへ戻る（移植元で再現できず、切り分け待ち）

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
