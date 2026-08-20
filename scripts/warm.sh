#!/bin/sh
# デプロイ直後にエッジのキャッシュを温める。
#
# Vercelのエッジは初回アクセスで初めて素材を取りに行く。連番は1,180件あるので、
# 何もしないと「デプロイ後の最初の1人」だけが12秒ほど待たされる。
# 一度なめておけば以降は数百ミリ秒で返る。
#
#   sh scripts/warm.sh                         … 本番
#   sh scripts/warm.sh https://xxx.vercel.app  … プレビュー
set -e
BASE=${1:-https://ututu-website.vercel.app}
VER=$(sed -n "s/.*ver: '\([^']*\)'.*/\1/p" "$(dirname "$0")/../index.html" | head -1)
FILES=$(sed -n 's/.*files: \([0-9]*\).*/\1/p' "$(dirname "$0")/../index.html" | head -1)
echo "温めます: $BASE (v=$VER / ${FILES}枚)"
seq 1 "$FILES" | awk -v b="$BASE" -v v="$VER" '{
  printf "%s/frames/f_%04d.webp?v=%s\n",      b, $1, v
  printf "%s/frames_p/f_%04d.webp?v=%s\n",    b, $1, v
  printf "%s/frames_lo/f_%04d.webp?v=%s\n",   b, $1, v
  printf "%s/frames_lo_p/f_%04d.webp?v=%s\n", b, $1, v
}' | xargs -P 12 -I{} curl -s -o /dev/null {}
curl -s -o /dev/null "$BASE/clips/good-order-clip.mp4?v=$VER"
curl -s -o /dev/null "$BASE/clips/good-review-clip.mp4?v=$VER"
echo "完了"
