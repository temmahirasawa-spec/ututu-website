"""GLB のテクスチャだけを縮める。

scripts/shrink_textures.py（Blender 版）と目的は同じだが、**Blender を通さない**。
インポート→エクスポートを挟むと、リグ・スキン・アニメーションが書き換わる
可能性がある。ここでは画像のバイト列だけを差し替え、それ以外は元のまま運ぶ。

    python3 scripts/shrink_glb_images.py 入力.glb 出力.glb [最大px]

確認は scripts/diff_glb.py で。ノード名・アニメのチャンネル数・スキンが
入出力で一致することを必ず見ること。
"""
import io, json, struct, sys
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
maxpx = int(sys.argv[3]) if len(sys.argv) > 3 else 512

raw = open(src, 'rb').read()
_, _, total = struct.unpack('<III', raw[:12])
off, chunks = 12, []
while off < total:
    clen, ctype = struct.unpack('<II', raw[off:off + 8])
    chunks.append([ctype, raw[off + 8: off + 8 + clen]])
    off += 8 + clen
gltf = json.loads(chunks[0][1].decode('utf-8'))
bin_ = chunks[1][1]

views = gltf['bufferViews']
img_of_view = {}
for i, im in enumerate(gltf.get('images', [])):
    if 'bufferView' in im:
        img_of_view[im['bufferView']] = i

# ---- 画像を縮める ----
new_bytes = {}
for vi, ii in img_of_view.items():
    v = views[vi]
    o = v.get('byteOffset', 0)
    data = bin_[o: o + v['byteLength']]
    im = Image.open(io.BytesIO(data))
    w, h = im.size
    mime = gltf['images'][ii].get('mimeType', 'image/png')
    if max(w, h) <= maxpx:
        print('  そのまま %4dx%-4d %s' % (w, h, mime))
        continue
    sc = maxpx / max(w, h)
    im2 = im.resize((max(1, round(w * sc)), max(1, round(h * sc))), Image.LANCZOS)
    buf = io.BytesIO()
    if mime == 'image/jpeg':
        im2.convert('RGB').save(buf, 'JPEG', quality=82, optimize=True)
    else:
        im2.save(buf, 'PNG', optimize=True)   # 形式は変えない（アルファを落とさない）
    new_bytes[vi] = buf.getvalue()
    print('  %4dx%-4d → %4dx%-4d  %6dKB → %5dKB  %s'
          % (w, h, im2.size[0], im2.size[1], len(data) // 1024, len(new_bytes[vi]) // 1024, mime))

# ---- BIN を組み直す。bufferView の索引は変えないので accessor は無傷 ----
out = bytearray()
for vi, v in enumerate(views):
    if vi in new_bytes:
        data = new_bytes[vi]
    else:
        o = v.get('byteOffset', 0)
        data = bin_[o: o + v['byteLength']]
    while len(out) % 4:            # 4バイト境界に揃える
        out += b'\x00'
    v['byteOffset'] = len(out)
    v['byteLength'] = len(data)
    out += data
while len(out) % 4:
    out += b'\x00'
gltf['buffers'][0]['byteLength'] = len(out)

js = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
while len(js) % 4:
    js += b' '
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(out))
glb += struct.pack('<II', len(js), 0x4E4F534A) + js
glb += struct.pack('<II', len(out), 0x004E4942) + bytes(out)
open(dst, 'wb').write(glb)
print('書き出し %s  %.2fMB → %.2fMB' % (dst, len(raw) / 1048576, len(glb) / 1048576))
