# UTUTU コーポレートサイト（Next.js 版）

株式会社UTUTU のコーポレートサイトです。

**いま出来ているもの**
- トップ `/` … KV（映像区間）＋紙のセクション（プロダクト2節／Founders）。静的版からの移植は完了
- `/company` … 会社概要＋お問い合わせ（同一ページ）。フォームの送信先だけ未設定
- 共通ナビ `components/site/SiteNav.tsx` … 両ページで使い回し

**まだ無いもの**は §7 にまとめてあります。KVの動きの正解は静的版です。
**迷ったら原本を見てください。**

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
  layout.tsx              フォント（next/font）とメタ情報。**noindex はここ**
  page.tsx                トップ ＝ <Hero /> ＋ <After />
  globals.css             トークン・素の指定・ロゴ/メニュー・紙のセクション
  company/page.tsx        /company の器。中身は components/company/CompanyClient
  api/contact/route.ts    お問い合わせの送信（Resend）。鍵が無ければ 503
components/
  site/
    SiteNav.tsx           ハンバーガー＋メニュー。**トップと /company で共通**
    productLinks.ts       GOOD ORDER / GOOD REVIEW のLPのURL。**サイト内のリンクは全部ここを見る**
  company/
    CompanyClient.tsx     会社概要（品書き）＋お問い合わせ（伝票）
    company.css           同上のCSS
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
scripts/        エッジ温め（warm.sh）と GLB まわりの道具
                shrink_glb_images.py … テクスチャだけ縮める（Blender を通さない）
                diff_glb.py          … 縮めた前後で骨とアニメが変わっていないか照合
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

- **`html{overflow-anchor:none}` を消さないこと（globals.css）。**
  Chrome は画面より上の中身の高さが変わると、見た目を保とうとして
  **scrollY のほうを黙って動かす**（スクロールアンカリング）。
  **この機能があるのは Chrome だけで Safari には無い。**
  和文を preload せず swap で当てているため、遅れて届くと `#after` の長い本文が
  一斉に組み直され、そこで Chrome が補正に入る。症状は「Chromeでだけ
  スクロール位置が飛ぶ・戻される、Safariでは起きない」。
  和文を7秒遅らせ、y=5200 で止めて**一切操作せずに**観察すると、
  切る前は 5200→5174 と動き、切ると 5200 のまま動かない（各3回で再現）
- **映像区間を抜けたら KV は止まる**（`heroEngine` の `heroHidden()` / `.kv-idle`）。
  `#stage` は `#after` に完全に覆われて見えないのに、放っておくと canvas への
  描き込みとコピーの濃度計算が毎フレーム走り、動画も loop で回り続ける。
  `#after` の上端は必ず `heroMax + innerHeight` にあるので、そこが境目。
  **止める前に `updateOverlays` を1回ぶん寄せ切ること。**途中で抜けると
  コピーの濃度が寄り切らず、SKIP と SCROLL の案内が出たまま固まる。
  `resize` では `scroll` が飛ばないので `applySnapMode` からも起こしている
- **ハンバーガーは Liquid Glass**（`SiteNav` の `#frosted` フィルター＋`glassMap.ts`）。
  SVG フィルターを `backdrop-filter` に使えるのは Chrome 系だけなので、
  Safari は `@supports` で普通のぼかしに落としている

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

## 4. いま出来ているもの

| | 状態 |
|---|---|
| `globals.css` | 済。原本のCSSを**行ごと切り出して**分けた。打ち直していないので実測値はそのまま |
| KV（`components/hero/`） | 済。canvas・ホモグラフィ・読み込みキュー・章送り・スワイプ |
| 紙のセクション（`#after`） | 済。反転・帯・プロダクト2節・Founders・アバター・モーダル |
| `/company` | 済。会社概要＋お問い合わせ。**送信先の鍵だけ未設定** |
| 共通ナビ（`components/site/`） | 済。トップと `/company` で共通 |
| メタ情報 | 未着手。OGP画像・favicon |

**GOOD ORDER / GOOD REVIEW の詳細ページは作りません**（本人判断）。
代表サービスとして、ナビと各節から各LPへ新タブで飛ばすだけです。

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

### 映像区間の操作（2026-08-21）

**スマホは、送りボタン／ドットに加えてスワイプでも進みます。**
下から上で次の章、上から下で前の章。ボタンとドットがあっても、
スクロールしようとする人のほうが多いためです。

- 判定は **touchend で一度だけ**。1スワイプ＝1つ進む。
  touchmove の途中で送ると、指を動かし続けるあいだ何章も飛びます
- しきい値は `SWIPE`（heroConfig）。44px、または24px以上を260ms以内。
  **ゆるめに取ってあります。**厳しくすると「動かない」と受け取られます
- **送りボタン・ドット・ロゴ・SKIP の上から始めた指は無視すること。**
  ここを外すと、ボタンを押しただけで二重に進みます
- 最後の章から上へスワイプすると、NEXTと同じく映像を抜けて `#after` へ。
  抜けたところで `lockScroll(false)` が効き、ふつうのスクロールに戻ります
  （実測：dot 0→1→2→3、さらに上へで y=3248・past-hero・overflow 解除）

**SKIP に下向きの山形は付けないこと。**ドロップダウンに見えます（本人判断）。
文字だけの長丸にしてあります。SCROLL の山形は「下へ続く」の合図なので別で、こちらは残します。

**SKIP はスマホにも出します。**NEXT の帯の左側に長丸で。
`#skip` は1つの要素を両方で使い回し、位置だけ切り替えています。
**z-index は `#navBar`(6) より上にすること。**下だと NEXT に指を吸われます
（実測：重なり順は skip → nextBtn → navBar）。

**SCROLL の案内は、映像を抜けるまで出し続けます。**途中で消すと、
まだ続くことが伝わりません（`prog > 0.985` でだけ消す）。

- メニューを開いたときに SKIP を隠すのは **`visibility` で**。
  エンジンが inline で `opacity` を書くので、CSSの opacity では勝てません

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
| 3つの要点 | 見つかる／選ばれる／もう一品 | 1分で答える／下書き／声が分かれる |

- **ここは概要だけ。説明はしない。**（2026-08-21 本人判断）
  細かい話はLPに書いてあるので、同じことを二度読ませることになります。
  置くのは「お客様にとって何が良くなるか」だけ。カードの本文は持たせず、
  英字のラベルと一行の見出しで止めてあります。**説明を足したくなったら、
  それはLPに書くべき内容です。**（実測：PCで 2341px → 1797px）
- **スマホでは3枚を横スライドにします。**縦に積むと、コーポレートサイトの
  概要紹介としては長くなりすぎます。次のカードを少しのぞかせて指を誘う形
  （`scroll-snap-type: x mandatory`、カード幅は 74%）
- 画像は `public/img/products/`（6点・約230KB）。**公式LPから落として webp に変換したもの**です。
  LPの画面を差し替えたら、ここも作り直してください
- **GOOD ORDER に数字は出さないこと。**LPでも客単価・注文点数は「測定中」です
- **★3.5→★4.2 は FROMA の実測値**（LPの REAL STORE RESULT）。盛らないこと
- **`.pv-run` の `white-space: nowrap` を外さないこと。**和文はどこでも折れるため、
  flex の中では min-content が1文字ぶんになり、縦1列に潰れます（実際に潰れました）
- **`.pv-blob` には必ず位置と上限を付けること。**位置指定を省くと静的位置から
  108% 四方に広がり、下の特長カードに被ります（実際に被りました）
- **カード内の画面は `.pv-shot` の中で切ること。**マイナスマージンで下へ食い込ませると、
  枠の高さは縮むのに絵は縮まず、下のラベルに重なります（実際に30px重なりました）。
  高さを決めて `overflow:hidden` で切り、裾を地の色へ溶かしています
- **上下の余白は `.pv` だけで持つこと。**帯の前後に紙を挟むと
  「紙 → クリーム → 紙 → ミント」と地の色が細かく切り替わり、崩れて見えます。
  2つの帯は隙間なく続けて置き、前後にだけ紙の間合いをとっています
  （実測：橋→ORDER 166px ／ ORDER→REVIEW 0px ／ REVIEW→Founders 185px）。
  **`.pv + .af-sec` の上マージンを消さないこと。**`.af-sec` は下マージンしか
  持たないので、これが無いと Founders の見出しが帯にくっつきます（18pxまで詰まりました）

**名前の食い違いに注意。**レビュー側のサービス本体は、2026-08-24 に `GOOD LOOP` から
`GOOD REVIEW` へ改名されています（good-loop リポジトリの docs/handoff.md）。
アプリは `app.good-review.jp`。コーポレートの表記はこれと揃っています。
ただし**LP（`goodloop-official.vercel.app`）は改名前に作ったもの**で、ホスト名に旧名が
残っています（2026-08-20 時点では、LP上の表記も GOOD LOOP でした）。
リンクは独自ドメイン `good-order.jp` / `good-review.jp` に向けてあります
（`components/site/productLinks.ts`。2026-09-23、DNSの切り替えに先立って本人判断で変更）。
`goodloop.jp` / `good-loop.jp` は**別会社**のサイトです。

### Founders のアバター（2026-08-21 に洋輔さんぶんを追加）

2人ともAvaturnの全身アバターです。`public/models/{temma,yosuke}.glb`。

- **テクスチャは `scripts/shrink_glb_images.py` で512pxに縮める。**
  Blender版（`shrink_textures.py`）と目的は同じですが、**Blenderを通しません。**
  インポート→エクスポートを挟むとリグ・スキン・アニメが書き換わりうるためです。
  縮めたら `scripts/diff_glb.py 元.glb 後.glb` で、
  ノード名・親子・TRS・スキン関節・アニメのチャンネル・**絵以外のバイト列**が
  一致することを必ず確認してください（洋輔さんぶんは 3.96MB → 1.47MB、完全一致）
- **GLBを差し替えたら `headViewer.js` の `VER` を必ず上げること。**
  上げないと端末が古いGLBを掴み続けます

**洋輔さんのクリップには Head のトラックがありません**（40チャンネル。天真さんは156）。
これは以前「首が90°折れた」不具合が起きた条件そのものです。いまの実装は
「掛けて、描いて、すぐ戻す」で、**トラックの有無に関係なく全ボーンを無条件に戻す**ので
溜まりません。12回連続タップ後の頭のずれは実測 0.000°でした。
**トラックの有無で処理を分ける実装に戻さないこと。**

このとき見つけて直したもの:

- **二重作成。**`makeAvatar` の印は「待つ前」に付けること。GLBの読み込みを挟むので、
  `.live` が付くのは最後であり、同時に呼ばれると素通りして枠あたり canvas が2つできます
  （開発中の二重実行で実際に4つできました）。失敗したときは印を戻すこと
- **枠の追従。**`window` の resize だけを見ていると、あとから枠の高さが決まる場面で
  潰れた大きさのまま残ります（実測 258x54 で固まった）。ResizeObserver で枠を見張ります
- 片付けは `stopHeads()`。canvas を消して `.live` と印を外します

なお**アバターの読み込みでレイアウトは動きません**（canvas は絶対配置、枠の高さは
`aspect-ratio` 由来）。実マークアップで Founders・ページ全高とも 0px のずれを確認済みです。

#### 身長差と、タップの反応

枠の `data-cm`（身長）と `data-tap`（反応の種類）で決めます。

```html
<div class="fd-ph ava" data-head="yosuke" data-cm="173" data-tap="stumble">
<div class="fd-ph ava" data-head="temma"  data-cm="160" data-tap="startle">
```

- **カメラは2人とも同じ世界の高さ（`FRAME_H`）を写します。**モデルごとに採寸して
  合わせると、それぞれが枠いっぱいに収まって身長差が消えます。
  いちばん高い人を 1.0 として比を取り、足元を枠の下端に揃えています
  （実測：背の高さの比 0.925＝160/173、足元のズレ 0.003）
- 段は **model → inner → pivot** の三段。inner が「大きさと足元」、pivot が「回転と跳ね」。
  ひとつにまとめると跳ねの量まで身長比で変わります
- 走りは2人とも同じクリップなので、**個性はタップの反応で出しています**
  - `startle`（天真さん）… のけぞって両手を上げ、上へ跳ねる（傾き −0.07rad）
  - `stumble`（洋輔さん）… 前へつんのめり、沈む（傾き +0.15rad、沈み −0.045）
  - **顔は必ず前を向かせること。**うつむかせると「転んだ」に見えて後味が悪いので、
    上体の前傾ぶんを首と頭で打ち消しています
- どちらも「掛けて、描いて、すぐ戻す」ので溜まりません
  （12回連続タップ後の頭のずれは実測 0.0000°）

**検証のしかた。**ペインが隠れていると rAF が止まり、反応そのものが走らないので
空振りします。rAF を手送りに差し替えて `st.hopT` が進むことを確かめてから測ってください。
ヘッドレスは `prefers-reduced-motion: reduce` 扱いになり、タップが無効化されます
（`matchMedia` を import より前に差し替えると動く側に倒せます）。

### /company（会社概要＋お問い合わせ。2026-08-21）

1ページに統合（本人判断）。組版は品書きと伝票の見立て。
会社の情報は品書きの体裁で読ませ、問い合わせは伝票の体裁で受ける。

**ただし文字は普通の言葉で書くこと。**「お品書き」「ご注文伝票」「合計 ¥0」と
直に名乗ると寒くなる（本人判断で撤去済み）。見立ては見た目だけで伝わる。
見出しは「会社概要」「お問い合わせ」、ボタンは「送信する」。

```
app/company/page.tsx                メタ情報だけ
components/company/CompanyClient.tsx  お品書き・伝票・送信まわり
components/company/company.css        専用CSS（トークンは紙のセクションと共通）
app/api/contact/route.ts              Resend でメール1通送るだけの受け口
```

- 動きの語彙は「静かに現れる」だけ。クラスは `.cp-rv`
  （トップの `.rv` と同名にすると、あちらの初期化に依存するので分けてある）。
  お品書きの中トビの点線は `.in` で左から伸びる
- `?reveal` を付けると全部開いた状態になる（スクリーンショット確認用。
  ヘッドレスでは IntersectionObserver が凍るため）
- 伝票のミシン目は CSS mask。効かないブラウザでは角の丸い紙に落ちる
- **確定していない情報は会社概要に足さないこと。**
- **上部はロゴだけを置くこと。**両脇に何か入れると、その幅の差ぶんだけ
  ロゴが中央からずれる（実際にずれた）。ハンバーガーは position:fixed で
  流れの外にいるので影響しない。上下は `--markY` にロゴの中心が乗るよう取る
- ORDER / REVIEW の詳細ページはコーポレートに**持たない**（本人判断）。
  代表サービスとしてナビから各LPへ新タブで飛ばすだけ

**メール送信は Resend。**Vercel の環境変数が要る（未設定だと503を返し、
フロントは「準備中」の案内に切り替わる）。

| 変数 | 中身 |
|---|---|
| `RESEND_API_KEY` | Resend のAPIキー |
| `CONTACT_TO` | 受け取るアドレス |
| `CONTACT_FROM` | 差出人（任意）。独自ドメインを Resend に登録したら設定 |
| `NEXT_PUBLIC_CONTACT_EMAIL` | 503時の案内に出す予備アドレス（任意） |

手元で送信まで試すときは `.env.local` に同じ2つを書きます
（`.gitignore` 済みなので、**鍵をリポジトリに入れないこと**）。

迷惑投稿は蜜壺（画面外の `website` 欄）で捨てる。埋まっていたら
**成功したふりをして捨てる**（エラーを返すと機械が学習する）。

### ナビゲーション（components/site/SiteNav.tsx）

トップと /company で**同じものを使い回す**。並びは下記（本人判断）。

```
        TOP
COMPANY / CONTACT     ← 同じページなので1行に
     ──────
     PRODUCTS
GOOD ORDER ↗ | GOOD REVIEW ↗   ← 画面下部に小さく
```

- **ORDER / REVIEW は下部に小さく、新タブの印をつけること。**同じ大きさで
  並べると、コーポレート内に詳細ページがあるように見える
- トップでの「TOP」は**ロゴ（#brand）の click を借りる**。あちらは映像区間の
  スクロール固定を解いてから戻す処理まで持っている。素の遷移だと KV を読み直す
- 紙の上ではハンバーガーを墨に（`tone="ink"` → `.on-paper`）

### トップの導線（同日）

- 締め（#next）にCTA：`.cta-main`（お問い合わせ）＋ `.cta-sub`（会社概要）。
  **塗りはトークン（--tx/--pg）で書くこと。**直に色を書くと墨反転から取り残される
- Founders の下に「会社概要を見る →」。
  **`.profile-btn` と同じ形にしないこと。**同じ丸ボタンだと二人の PROFILE と
  同じ重さに見え、ページを移る道だと分からない。角を落とし、一回り大きく、矢印つき
- フッターの「（準備中）」を実リンクに

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

### 見た目を確かめるときの近道

ブラウザーのペインが隠れていると rAF も IntersectionObserver も止まるので、
`.rv` が open せず真っ白に写ります。**ヘッドレスの Chrome で直接撮るのが速い**です。

```bash
npm run dev
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --window-size=1280,2600 --virtual-time-budget=15000 \
  --screenshot=/tmp/pv.png "http://localhost:3000/"
```

`.rv` を待たずに見たいときは、**`/company?reveal` のように `reveal` を付けます**
（`CompanyClient` が全部 `.in` にします）。トップにはまだ同じ口が無いので、
必要なら確認用のページを一時的に作って `.rv{opacity:1!important}` を当ててください（作ったら消すこと）。

**ヘッドレスの Chrome は既定で `prefers-reduced-motion: reduce` 扱いです。**
動きを止める分岐に入るので、タップの反応や現れる動きは既定では確かめられません
（アバターの確認では `matchMedia` を差し替えて回避しました。§Founders のアバター）。

なお**ヘッドレスは幅の狭い指定だと実機と違う折り返しになることがあります。**
モバイルの確認は、幅を変えた実ブラウザで `document.documentElement.scrollWidth` を
見るほうが確実です。

---

## 7. まだ残っている作業

上ほど効いてきます。

### 人の手を待っているもの（こちらでは進められない）

- **お問い合わせの受け口**。Resend のアカウントを作り、Vercel に
  `RESEND_API_KEY` と `CONTACT_TO` を入れるまで、`/api/contact` は 503 を返し、
  フォームは「準備中」と出ます。鍵を入れれば、コードの変更なしで送れるようになります
- **`good-order.jp` / `good-review.jp` のDNSの切り替え**。リンク6本（ナビの下段・
  KVのコピーの「公式サイトへ」・プロダクト2節の「公式サイトへ」）は**先に独自ドメインへ
  向けてある**ので、DNSが引けるまでの間はリンク切れになる（2026-09-23 時点では未解決）。
  切り替えが長引くようなら、`components/site/productLinks.ts` の2行を各LPの
  vercel.app に戻せば、つなぎになる（戻し先のURLはファイルのコメントに残してある）
- **橋の節の数字がサンプルのまま**（直営4 / 導入3 / 3.9倍 / +18%）。
  GOOD REVIEW の図解には FROMA の実測（★3.5→★4.2）が入っているので、
  **同じページに実測とサンプルが同居しています。**公開前に必ず揃えること

### これから作るもの

- **OGP画像**（1200×630）。`public/og.png` に置いて `app/layout.tsx` の
  `openGraph.images: ['/og.png']` を足す（metadataBase・OGPの文字情報・
  twitter card は設定済み）
- 管理画面のスクリーンショット（Figmaから）。プロダクト2節に入れる想定
- favicon は正式ロゴの「U」で作成済み（`app/icon.svg` / `favicon.ico` /
  `apple-icon.png`）。別デザインにするならこの3点を差し替える

### 公開の日にやること（この順で）

1. `app/layout.tsx` の `robots: { index: false, follow: false }` の行を**削除**
   （robots.ts / sitemap.ts は設置済みなので、これ1行で検索に載り始める）
2. 独自ドメインが決まっていたら、Vercel の環境変数 `NEXT_PUBLIC_SITE_URL` に
   `https://ドメイン` を入れる（未設定時は ututu-website.vercel.app として動く）
3. Vercel のダッシュボードで `/api/contact` に WAF のレートリミットを掛ける
   （コード側にも10分5通の簡易制限はあるが、インスタンス単位なので厳密ではない）
4. Vercel の Project Settings で Node のバージョンを確認し、`package.json` に
   `engines` として書き写す（ローカルとの乖離を見えるようにする）

### 画像を差し替えるときの約束

- `public/img/` は**1日キャッシュ＋1週間の stale-while-revalidate**（vercel.json）。
  ファイルを差し替えれば、翌日までには全員に行き渡る。即時に見せたいときだけ
  ファイル名を変える。frames系・models と違って `?v=` の管理はしない
- frames系・clips・models は immutable（1年）。**中身を差し替えたら必ず
  `?v=` を上げること**（heroConfig の `ver` / headViewer のコメント参照）

### 未解決の不具合

- 洋輔さんの PROFILE をタップするとトップへ戻る。移植元でも再現できず、切り分け待ち

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
