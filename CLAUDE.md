# UTUTU コーポレートサイト（Next.js 版）

株式会社UTUTU のコーポレートサイトです。**2026-10 に全面リニューアルしました。**
旧版（KVのスクロール連動の連番映像＋紙のセクション）は廃止し、
「クリエイティブスタジオが手がけるDX」として打ち出し直しています。

```
本番  : https://ututu-website.vercel.app （main に push すると自動デプロイ）
GitHub: temmahirasawa-spec/ututu-website （Public ← 非公開にすることを推奨。§0）
旧版  : コミット 38caf2a 以前（KVの連番・ホモグラフィ・reference/ の原本もそこにある）
```

---

## 0. 最初に読むこと：YORKYS との関係（2026-10-01）

共同創業者・洋輔さんの別会社 **株式会社YORKYS ENTERTAINMENT** が破産手続きに入る。
UTUTU は別会社で事業は続けるが、手続きの過程で YORKYS と UTUTU のつながりが確認される。
**サイト上から YORKYS との結びつきを外してある。戻さないこと。**

- **出さないもの**：YORKYS の社名、店名（YORKYS BRUNCH / FROMA / PIECE OF BAKE /
  YORKYS Creperie / マドモアゼルクロケット など）、店舗の写真、料理の写真、
  洋輔さんの YORKYS での経歴（店名・FC展開・出店先）、YORKYS 案件の制作物
- **言わないこと**：「自分たちの店」「直営」「この店が開発室」「導入店舗」「稼働中」など、
  店を営んでいる前提・いまの状態として書く言い方
- **実績の数字**：店名を出さず、**期間を明記した過去形**で。
  いま使っているのは「神戸市内の飲食店／2026年6〜8月の実証期間／クチコミ 7件 → 42件」だけ
- **横領や破産の経緯は、サイトには一切書かない**
- **所在地は変えない**（本店の移転は弁護士の確認を経てから。登記が変わったら更新）
- 迷う表現が出てきたら、削除・言い換えの案を出して天真さんに確認する

素材にも入り込んでいたので、次の2つは差し替え済み：
- GOOD ORDER のスマホ画面 … 実店舗の撮影画像（店名ロゴ・料理写真入り）→ HTMLの見本
  （`components/products/OrderScreen.tsx`。架空の「GOOD CAFE」。料理は線画）
- GOOD REVIEW の映像（横・縦）… 39.3〜41.0秒の字幕「FROMA 神戸三宮店／導入後3か月の実測」を
  「神戸市内の飲食店／2026年6〜8月の実証期間」に焼き直し。**同じ映像を使っている各LPも要修正**

**リポジトリが Public** なので、過去のコミットには店舗写真・旧プロフィールが残っている。
非公開化（Vercel の連携は Private でも動く）か、少なくとも外部から辿られない状態にすることを推奨。

---

## 1. 打ち出しと情報設計

**一言：「2人で、全部つくる。」**（A creative studio building DX）
事業をつくってきた人（洋輔さん）と、つくる手を持つ人（天真さん）が、AIを道具に、
企画・デザイン・開発・映像まで短い時間と高い精度でかたちにする。
組織を大きく見せない。「少数でもAIを理解していれば大きなサービスをつくれる」が強み。

トップの並びは**問いの順番**で決めてある。入れ替えるときは理屈ごと見直すこと。

| # | 節 | 答える問い | 地 |
|---|---|---|---|
| 01 | ヒーロー `#top` | 誰が・何を | 紙＋点描（WebGL） |
| 02 | 宣言 `#why` | なぜ今、2人なのか | 墨 |
| 03 | 原則 `#how`「AIで、手を抜かない。」 | 何が違うのか | 紙（3枚が積み重なる） |
| 04 | できること `#services`「まるごと、任せてください。」 | 何を頼めるか | 紙 |
| 05 | つくったもの `#work` | 証拠 | 紙 → 生成り（GOOD SERIES）→ 紙 |
| 06 | ふたり `#team`「事業の人と、つくる人。」 | 誰がやるのか | 墨 |
| 07 | 締め `#contact-cta`「Let's build.」 | 次の一歩 | **朱** |

- 実績は**自社プロダクト（GOOD SERIES）を作品として見せる**。企画からブランド・UI・開発・LP・映像まで
  2人でつくったこと自体が、速さと精度の証拠になる（「Built by two」の数え上げ）
- 天真さんの経歴の社名（サイバーエージェント／Adobe）は**プロフィールの全文の中にだけ**置く。
  見出しや一言には出さない（本人判断：前面に出しすぎない）
- 洋輔さんは「神戸・阪神間で10年以上、飲食店の経営と出店」＋「UTUTUで何を担うか」で書く

---

## 2. 構成

```
app/
  layout.tsx              フォント（next/font）・メタ情報（**noindex はここ**）・共通ヘッダー
  page.tsx                トップ ＝ 各節を並べるだけ
  globals.css             トークン・ヘッダー・メニュー・現れ方・プロフィールのモーダル
  company/page.tsx        /company の器。中身は components/company/CompanyClient
  api/contact/route.ts    お問い合わせの送信（Resend）。鍵が無ければ 503
  not-found.tsx           404
components/
  site/
    Header.tsx            ヘッダー＋メニュー（layout に置く。ページを移っても作り直さない）
    Mark.tsx              ロゴ（正式ロゴを1文字ずつに分けた SVG）
    productLinks.ts       GOOD ORDER / GOOD REVIEW のLPのURL。**リンクは全部ここを見る**
  home/
    Hero.tsx              ヒーロー（見出しは HTML、点描は halftone.ts）
    halftone.ts           ヒーローの点描（WebGL。シェーダ1本、three.js は使わない）
    Sections.tsx          宣言・原則・できること・つくったもの・ふたり・締め・フッター
    HomeEffects.tsx       動きの起動（現れる・数え上げ・3Dの遅延読み込み・朱の上のヘッダー）
    reveal.ts             .rv / .rise に .in を付ける（/company と共用）
    Rise.tsx              見出しを行ごとに出す部品
    home.css              トップの各節の CSS
  products/               プロダクト節（GOOD SERIES の世界観。§5）
    Products.tsx / ProductVideo.tsx / OrderScreen.tsx / products.css
  team/
    BioModal.tsx          プロフィール（スマホは下からのシート）
    bios.ts               2人の全文
  company/
    CompanyClient.tsx     会社概要＋お問い合わせ
    company.css
lib/three/      three.js r185・GLTFLoader（自家ビルド版）と headViewer.js。npm ではなく同梱
public/
  clips/products/         プロダクト節の映像 {order,review}-{wide,tall}.mp4 とポスター
  img/products/           REVIEW の画面・卓の上の小物
  img/logos/              GOOD ORDER / GOOD REVIEW の正式ロゴ
  models/                 2人のアバター（GLB）
scripts/        エッジ温め（warm.sh）と GLB まわりの道具
```

---

## 3. デザインの決まりごと

### 色

紙 `#ECE9E1` ／ 墨 `#0E0E0D` ／ **朱 `#FF4D1F` 1点**（トークンは globals.css の `:root`）。
- 朱は「ここが要点」「押せる」の印にだけ使う。**面で使うのは締めの節だけ**（ほかで使うと締めが弱まる）
- プロダクト節だけは GOOD SERIES の色（黄／緑・紺／墨・赤ペン）。こちらに朱を持ち込まない

### 書体（app/layout.tsx）

| 役割 | 書体 |
|---|---|
| 欧文の見出し | **Archivo 可変**（幅 62–125・太さ 100–900）。幅の軸をスクロールや hover で動かす |
| 番号・ラベル・時刻 | Geist Mono |
| 和文の見出し | Zen Kaku Gothic New **700 / 900**（大見出しは 900） |
| 和文の本文 | Noto Sans JP 400 / 500 |
| プロダクト節だけ | Barlow（LPと同じ） |

和文は `preload:false`（容量が大きい）。swap で遅れて当たるので、`html{overflow-anchor:none}` を
**消さないこと**（Chrome だけ、組み直しのたびに scrollY を黙って動かす。旧版で実測済み）。
和文の見出しは `word-break:auto-phrase` で**文節で折り返す**（Chrome。Safari は普通に折れる）。

### 動きの語彙は4つだけ。増やさないこと

1. **解像** … ヒーローの点が、ノイズから形に揃う（halftone.ts）。生成AIの拡散の見立て
2. **点灯** … 宣言の文が、スクロールに合わせて一語（文節）ずつ灯る
3. **立ち上がる** … 見出しが行ごとに下から出る（`.rise`）。それ以外は静かに出る（`.rv`）
4. **積み重なる** … 原則の3枚が `position:sticky` で重なっていく

ほかに、流れる帯（Business × Craft × AI = Two）と、欧文の幅の伸縮がある。
旧版で「節の見出しをピクセルから解く」効果を入れて**やりすぎで取り下げた**経緯がある
（コミット b368f85）。**点描（ピクセル的な表現）はヒーローとアバターの床だけ**にとどめること。

スクロール連動（点灯・幅・左右からの寄り）は **CSS の `animation-timeline`** で書いてある。
メインスレッドを使わないのでスマホでも詰まらない。非対応のブラウザでは `@supports` の外側
（止まった完成形）が見えるので、**完成形のほうを先に正しく書くこと**。

`.rv` / `.rise` は `html.js` のときだけ隠す（layout.tsx の小さなスクリプトが付ける）。
JS が無くても全部読める。

### ヘッダー

- **`.hd` 自体に `mix-blend-mode:difference`**。白で描くと紙の上では墨、墨の上では紙に見える。
  **子に掛けても効かない**（fixed＋z-index で重なりの文脈が閉じる。実際に白いまま残った）
- 朱の「相談する」は `.hd` の外に置く（中に入れると補色の水色になる）
- 朱の締めの上では差が水色になるので、`body.on-shu` で `.hd` を朱で描く（差が0＝墨に見える）

### ヒーローの点描（halftone.ts）

- 画面を升目に切り、升目ごとに1点。点の大きさは「密度の絵」（2D canvas に描いたロゴ）で決まる。
  **赤＝ロゴ、緑＝文字の置き場所**（緑の上には地のノイズを出さない。読みやすさのため）
- ロゴの位置は `.hero-mark` の箱を読む。**縦横比は字の外形 1144:133 に合わせること**
- レンズ（朱）はポインタを追う。触れていない間はロゴの上を巡回する（スマホはこれだけ）
- 見えていない間は描かない（IntersectionObserver / visibilitychange）。reduced motion は止め絵
- WebGL が無ければ `.hero-mark` の SVG がそのまま見える
- 起動して破棄を返す形（開発中は effect が2回走る。畳み残すとループが二重になる）

---

## 4. 決めたこと（旧版から引き継ぎ）

- **Tailwind は入れない。**CSS は素で書き、節ごとにファイルを分ける
- **Next 16 / React 19 / TypeScript / App Router**（兄弟サイト GOOD_ORDER_LP と同じ）
- Vercel の function region は東京 `hnd1`（`vercel.json`）
- 映像・モデルは1年 immutable キャッシュ（`vercel.json`）。**中身を差し替えたら `?v=` を上げる**
  （映像 … ProductVideo.tsx の `VER`、モデル … headViewer.js の `VER`）
- **`vercel.json` の `"framework": "nextjs"` は消さないこと。**このVercelプロジェクトは静的版から
  使い回していて、ダッシュボードの Framework Preset が `Other`／出力先 `public` のまま残っている。
  この1行が無いと**アプリではなく `public/` がそのまま配信される**。`vercel.json` にコメントは書けない
- **`next.config.ts` の `turbopack.root` は消さないこと。**`~/package-lock.json` があるため、
  指定しないと Turbopack がホームを根と誤認し、`public/` の素材が全部404になる
- **three.js はブラウザでしか触らない。**#team が近づいたときだけ動的 import する（HomeEffects）
- **Vercelへは Git 経由でデプロイする**（CLI だと24時間5,000ファイル制限に当たる）

---

## 5. 各部の詳細

### プロダクト節（components/products/。2026-09-28 に作り直し）

**この節だけ、サイトの色（紙・墨・朱）から外れます。**2つのLPが共通の世界観「GOOD SERIES」に
リブランドしたので（2026-09 の v2）、コーポレートもそれに合わせました。
デザイン案4つ（並べる／切り替える／映像を主役に／ノート）から、
**「2つの卓を並べる」案に、映像を小さく添える形**を本人が選んでいます。

```
components/products/Products.tsx      2枚の卓（<Product> ひとつの型）と節の見出し
components/products/ProductVideo.tsx  映像。LPの PromoVideo と同じ動き
components/products/products.css      同上のCSS
public/clips/products/             映像 {order,review}-{wide,tall}.mp4 とポスター（約15.7MB）
public/img/products/               スマホの画面2枚と、卓の上の小物6点（props/）
```

- **GOOD SERIES の文法はLPのものをそのまま使う。**値の出どころは各LPの
  `styles/v2/tokens.css`（good-order-lp / good-review-website）。
  生成りの地 `#FAF6EC`、色の強い「卓」に 60° の光の帯、**ぼかさない影**（インキ14%を右下へ 2:3）、
  見出しは「小さい1行目／大きい2行目」で2行目にだけ赤ペンの線、押せない札は角丸6pxの四角

  | | GOOD ORDER | GOOD REVIEW |
  |---|---|---|
  | 卓 / 帯 | 黄 `#FAC03D` / `#FBCF6C` | 緑 `#34CA9B` / `#65D7B3` |
  | インキ | 紺 `#222460` | 墨 `#233029` |
  | 赤ペン | `#FA3524` | `#E53A0A` |
- **2枚は同じ型。**違うのは色と中身だけ。小物も同じ位置に同じ数（cup 右上／card 右下／accent 左上）。
  片方だけに飾りを足さないこと
- **映像は主役にしない（本人判断）。**左に映像、右にスマホの画面を並べる。PCは 映像7：画面3
  - **PCは横長（16:9）、スマホは縦長（9:16）。**2本とも DOM に置いて CSS（900px）で切り替える。
    隠れているほうは画面に入らないので、再生も読み込みも起きない
  - 自動再生は音なし・ページの読み込み後・半分以上見えているあいだだけ。
    左下に「再生／音／全画面」、止まっているときは中央に再生ボタン（押すと音あり）。
    iPhone は要素の全画面が無いので、動画だけを端末のプレーヤーで開く
  - `preload="none"`。**映像を差し替えたら `ProductVideo.tsx` の `VER` を上げること**（clips/ は1年 immutable）
  - スマホの横スライドでは、隣の卓の映像は画面外なので再生されない
  - **ヘッドレスの Chromium は H.264 を再生できない**（`canPlayType` が空）。
    手元の自動確認で `error 4` になるのは正常。実ブラウザで確かめること
- **訴求はLPの今の版に合わせる。**
  - ORDER … 見出し「いいデザインは、売上に効く。」。要点は 迷わない／一覧性／“もう一品”。
    **数字は出さないこと**（LPでも「測定中」。判子で示している）
  - REVIEW … 見出し「黙って帰っていた人の、クチコミが増える。」。要点は ★だけでも／話題ごとに／
    **届け先はお客様が選ぶ**。LPの軸は「評価で誘い方を変えない」なので、
    **「仕分ける」「良い声はGoogleへ、本音はお店へ」と読める書き方に戻さないこと**。
    「1分」「AIが書く」もLPでは表に出さなくなった言葉なので使わない
  - 実績は **「神戸市内の飲食店 ／ 2026年6〜8月の実証期間」で「クチコミ 7件 → 42件」**。盛らないこと。
    **店名は出さないこと**（2026-10-01、YORKYS の破産手続きに伴い外した。映像の字幕も差し替え済み）
  - ORDER の画面は**HTMLで組んだ見本**（`OrderScreen.tsx`、架空の GOOD CAFE）。実店舗の撮影画像は店名と料理写真が写っていたので外した
- **ここは概要だけ。説明はしない。**（2026-08-21 本人判断）置くのは紹介文1つと、英字の札＋一行の要点3つまで。
  **説明を足したくなったら、それはLPに書くべき内容です**
- **本文は紙（白）の上に置く。**卓の上に直接置くのは、ロゴ・種別・見出しまで
- **種別は必ずロゴの下の行に。**成り行きで折り返すと ORDER は1行・REVIEW は2行になり、
  見出しの高さが2枚でずれる（幅1000pxで実際にずれた）
- **2枚の高さの差は映像の段（`.pv-media` の flex:1）で吸う。**紙の側で吸うと、
  短いほうの卓だけ画面と紙のあいだに隙間が空く
- **スマホでは2枚を横スライドにする**（86%幅、次の卓をのぞかせる）。縦に積むと長すぎる
- **見出しの頭は正式ロゴ**（`public/img/logos/good-order.svg` / `good-review.svg`。
  2026-09-28 支給、原本は Dropbox の `UTUTU/LOGOS/` の横組み `*_yoko.svg`。バイト列は無加工）。
  - **SVG をインラインで埋めないこと。`<img>` で読むこと。**Illustrator の書き出しは
    どちらも `.st0`〜`.st3` というクラス名で色を持っていて、同じページに2つ埋めると
    互いに上書きし合う（実際に ORDER の文字が消え、丸が緑になった）
  - **2つは同じ縮尺で置くこと。**単位あたりの大きさ（`--lu`）を揃え、REVIEW のしっぽは下へはみ出させる
  - **明るい地専用。**黒を含むので、卓の色の上には白い札を敷いてから置く。
    墨の地・映像の上・メニューの幕では使わない（メニューは文字のまま）
  - 縦組み（`*_tate.svg`）は使っていない。Dropbox に残してある
- 画面と映像は**各LPから持ってきたもの**。REVIEW の画面は、LP側でもまだ旧版のアンケート画面
  （LPの docs に「v5 の撮影素材ができたら差し替え」とある）。LPが差し替えたら、こちらも追いかける
- **上下の余白は `.pv` だけで持つこと。**帯の前後に紙を挟まない。
- 以前の版（白→クリーム／ミントの地、ブロブ、画面つきカード3枚）は 2026-09-28 より前のコミットにあります


**名前の食い違いに注意。**レビュー側のサービス本体は、2026-08-24 に `GOOD LOOP` から
`GOOD REVIEW` へ改名されています（good-loop リポジトリの docs/handoff.md）。
アプリは `app.good-review.jp`。コーポレートの表記はこれと揃っています。
ただし**LP（`goodloop-official.vercel.app`）は改名前に作ったもの**で、ホスト名に旧名が
残っています（2026-08-20 時点では、LP上の表記も GOOD LOOP でした）。
リンクは独自ドメイン `good-order.jp` / `good-review.jp` に向けてあります
（`components/site/productLinks.ts`。2026-09-23、DNSの切り替えに先立って本人判断で変更）。
`goodloop.jp` / `good-loop.jp` は**別会社**のサイトです。

### Founders のアバター（lib/three/headViewer.js）

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


### /company（会社概要＋お問い合わせ）

- 旧版の「品書き・伝票」の見立ては、スタジオとしての打ち出しに合わないので撤去（2026-10）。
  トップと同じ設計言語（罫線の表、下線の入力欄、朱の送信ボタン）
- **確定していない情報は会社概要に足さないこと。**事業内容は 2026-10-01 に
  「デジタルプロダクトの企画・デザイン・開発／店舗向けソフトウェア『GOOD SERIES』の提供」に書き換えた
  （**定款の目的と食い違わないか要確認**）
- ご用件の選択肢：制作・開発のご相談／GOOD SERIES の導入／取材・掲載／その他
- `?reveal` を付けると全部開いた状態になる（スクリーンショット確認用）

**メール送信は Resend。**Vercel の環境変数が要る（未設定だと503を返し、フォームは「準備中」に切り替わる）。

| 変数 | 中身 |
|---|---|
| `RESEND_API_KEY` | Resend のAPIキー |
| `CONTACT_TO` | 受け取るアドレス |
| `CONTACT_FROM` | 差出人（任意）。独自ドメインを Resend に登録したら設定 |
| `NEXT_PUBLIC_CONTACT_EMAIL` | 503時の案内に出す予備アドレス（任意） |

手元で試すときは `.env.local` に同じものを書く（`.gitignore` 済み。**鍵をリポジトリに入れないこと**）。
迷惑投稿は蜜壺（画面外の `website` 欄）で捨てる。埋まっていたら**成功したふりをして捨てる**。

### メニュー（components/site/Header.tsx）

- サイト内の行き先を大きく（Studio / Services / Work / Team / Company / Contact）
- その下に **PRODUCTS（見出し。押せない）→ GOOD ORDER / GOOD REVIEW（新タブの印つき）**。
  PRODUCTS を押せるようにしないこと。ORDER / REVIEW を同じ大きさで並べないこと
  （コーポレートの中に詳細ページがあるように見える）
- GOOD ORDER / GOOD REVIEW の詳細ページはコーポレートに**持たない**（本人判断）

---

## 6. ローカルでの起動と確認

```bash
npm run dev      # http://localhost:3000
npm run check    # lint と型チェック
npm run build    # 本番ビルド
```

- **ブラウザーのペインが隠れていると rAF も IntersectionObserver も止まる。**
  `.rv` がいつまでも現れないときはだいたいこれ。確認は `/?reveal` `/company?reveal`
- ヘッドレスの Chromium で撮るときは、WebGL のために `--use-angle=swiftshader` を付ける。
  既定で `prefers-reduced-motion: reduce` 扱いになるので、動きを見るなら
  `reducedMotion: 'no-preference'` を指定する（Playwright）
- **ヘッドレスの Chromium は H.264 を再生できない**（映像が error 4 になるのは正常）
- Playwright の要素スクリーンショットは、固定要素（ヘッダー・下からのシート）が
  途中に写り込むことがある。撮影の都合で、実際の表示ではない
- スマホの確認は、幅を変えた実ブラウザで `document.documentElement.scrollWidth` を見るのが確実

---

## 7. まだ残っている作業

### 人の手を待っているもの

- **本番（main）への反映**。YORKYS を外す外科的修正（9256df6・cf8e72c）は、リニューアルと
  切り離して先に main に入れられる
- **各LP（good-order-lp / good-review-website）の同じ修正**。REVIEW の映像の字幕と冒頭の実測、
  ORDER の「測定中」の横の店名など、LP側にも YORKYS の店名が残っている可能性が高い
- **お問い合わせの受け口**。Resend のキーを入れるまで `/api/contact` は 503
- **`good-order.jp` / `good-review.jp` のDNS**。リンクは先に独自ドメインへ向けてある
  （`components/site/productLinks.ts`。つなぎに戻すURLはファイルのコメントにある）
- **確認待ちの文言**（下の「確認待ち」）

### 確認待ち（2026-10-01 時点。本人に確認してから確定）

- 「企画、ブランド、UI、開発、LP、映像まで、すべてを2人で」と言い切ってよいか（外注した部分が無いか）
- 「Built by two」の数（プロダクト2／ブランド1／LP2／映像2／人数2）
- できること（受託の範囲）の4本と、その中身
- 洋輔さんの全文の「スタッフの育成」、タグの「出店」「要件定義」
- 実証期間の「2026年6〜8月」（旧表記は「導入後3か月」）
- 会社概要の事業内容

### これから作るもの

- **OGP画像**（1200×630）。`public/og.png` に置いて `app/layout.tsx` に `openGraph.images` を足す。
  ヒーローの点描のロゴをそのまま書き出すのが早い
- 管理画面のスクリーンショット（Figmaから）。プロダクト節に入れる想定
- 次の作品が出たら、つくったもの（#work）に足す。**最初の受託案件が出たら、ここが一番効く**

### 公開の日にやること（この順で）

1. `app/layout.tsx` の `robots: { index: false, follow: false }` の行を**削除**
2. 独自ドメインが決まっていたら、Vercel の環境変数 `NEXT_PUBLIC_SITE_URL` に入れる
3. Vercel のダッシュボードで `/api/contact` に WAF のレートリミットを掛ける
4. Node のバージョンを確認し、`package.json` に `engines` として書き写す


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
