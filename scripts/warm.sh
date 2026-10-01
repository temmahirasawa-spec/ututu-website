#!/bin/sh
# デプロイ直後にエッジのキャッシュを温める（映像・3Dモデル）。
# 2026-10 のリニューアルで KV の連番（1,180件）が無くなったので、対象はわずか。
#
#   sh scripts/warm.sh                         … 本番
#   sh scripts/warm.sh https://xxx.vercel.app  … プレビュー
set -e
BASE=${1:-https://ututu-website.vercel.app}
# 版番号は ProductVideo.tsx / headViewer.js が唯一の出どころ。ここに書き写さないこと
DIR="$(dirname "$0")/.."
VV=$(sed -n "s/^const VER = '\([^']*\)'.*/\1/p" "$DIR/components/products/ProductVideo.tsx" | head -1)
MV=$(sed -n "s/^const VER = '\([^']*\)'.*/\1/p" "$DIR/lib/three/headViewer.js" | head -1)
echo "温めます: $BASE (映像 v=$VV / モデル v=$MV)"
for s in order-wide order-tall review-wide review-tall; do
  curl -s -o /dev/null "$BASE/clips/products/$s.mp4?v=$VV"
done
for m in temma yosuke; do curl -s -o /dev/null "$BASE/models/$m.glb?v=$MV"; done
echo "完了"
