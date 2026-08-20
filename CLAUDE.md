# UTUTU コーポレートサイト（Next.js 版）

株式会社UTUTU のコーポレートサイトを Next.js で作り直すリポジトリです。
**まだ土台だけ**で、中身はこれから移植します。

移植元は Dropbox の静的版です。**そちらが唯一の正解**なので、迷ったら原本を見てください。

```
移植元: ~/Library/CloudStorage/Dropbox/UTUTU/コーポレートサイト/UTUTU_Website/
本番  : https://ututu-website.vercel.app （移植が終わるまで、これが生きている本番）
参照用: reference/legacy-index.html      （1,965行。CSSとJSが全部入っている原本のコピー）
        reference/legacy-head-viewer.js  （Founders の3Dアバター）
        reference/legacy-CLAUDE.md       （★必読。踏んだ地雷が全部書いてある）
```

---

## 1. まず読むもの

`reference/legacy-CLAUDE.md` を先に読んでください。**このサイトの難所はほぼ全部そこに書いてあります。**
KVのコマ送り、ホモグラフィによるUI合成、読み込みキュー、章送り、そして
1日かけて潰した不具合の原因が、再発防止のために記録してあります。

---

## 2. 構成

```
app/            ルーティングとページ
components/     UIの部品（KV、アバターなど）
lib/three/      three.js r185 と GLTFLoader（自家ビルド版）。npm ではなく同梱
public/         連番画像・動画・写真・3Dモデル。パスは /frames/f_0001.webp の形
reference/      移植元の原本。配信しない（.vercelignore 済み）
scripts/        エッジ温めスクリプトと Blender 用スクリプト
```

素材は約27MB・888ファイル。`public/` 直下に置いてあるので、
`/frames/f_0001.webp` のように参照します。

---

## 3. 決めたこと

- **Tailwind は入れない。**KVのCSSは実機で詰めた実測値の塊で、書き換えると必ず事故る。
  原本のCSSをそのまま `globals.css` とKV用のCSSに分けて持ち込む。新ページも同じ流儀で書く
- **Next 16 / React 19 / TypeScript / App Router**（兄弟サイト GOOD_ORDER_LP と同じ）
- Vercel の function region は東京 `hnd1`（`vercel.json`）
- 連番・動画・モデルは1年 immutable キャッシュ（`vercel.json`）

### 踏んだ落とし穴（この土台を作る時点で1つ）

- **`next.config.ts` の `turbopack.root` は消さないこと。**
  `~/package-lock.json` が存在するため、指定しないと Turbopack がホームディレクトリを
  プロジェクトの根と誤認し、**`public/` の素材が全部404になる**。
  症状は「トップページは出るのに画像だけ出ない」。設定を変えたのに直らないときは、
  古い `next dev` のプロセスが残って応答していないか `pkill -f "next dev"` で確認する

---

## 4. 移植の順序（推奨）

1. **globals.css** … 原本の CSS をそのまま移す。まだ何も足さない
2. **KV（`components/hero/`）** … いちばん重い。ここが通れば残りは楽
   - `ScrollSequence` … canvas とコマ送り
   - `ScreenComposite` … ホモグラフィによるUI合成
   - `ChapterNav` … スマホの章送り
   - `heroConfig.ts` … `CFG.holds` の座標 / `CHAPTER_DUR` / `COPY_AT` を集約。
     **マジックナンバーを散らさない**
3. **紙のセクション（`#after`）** … 反転・帯・図解・Founders
4. **下層ページ** … GOOD ORDER / GOOD REVIEW / 会社概要 / お問い合わせ
5. **メタ情報** … OGP画像・favicon（いまだに未着手）

---

## 5. 移植で絶対に外さないこと

原本で実際に事故った項目です。詳細は `reference/legacy-CLAUDE.md`。

- **連番画像に `next/image` を使わない。**canvas に描くので素の `new Image()`
- **同時4本の優先度付きキュー（`pump()`）を維持する。**
  1,178枚を一斉にリクエストすると接続が埋まり、動画が永久に読み込まれない
- **three.js は `ssr:false` の動的 import。**WebGL はサーバーで動かない。
  Founders が近づいたときだけ読む構造も維持する（KVの速度に影響させない）
- **JSとGLBのURLには版番号（`?v=`）を付ける。**
  付けないと端末が古いものを掴み続ける。実際にそれで壊れた絵が出た
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

---

## 7. まだ残っている作業（移植元から引き継ぎ）

- 図解のイラレ版2点（PC 900×430 / SP 480×560）
- 実測の数字（いまは全部サンプル：+18% / 12→47 / 直営4 / 導入3 / 3.9倍）
- 洋輔さんの Avaturn アバター（`public/models/yosuke.glb` に置くだけで有効）
- 管理画面のスクリーンショット（Figmaから）
- OGP画像・favicon・メタ情報
- **未解決の不具合**：洋輔さんの PROFILE をタップするとトップへ戻る（移植元で再現できず、切り分け待ち）

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
