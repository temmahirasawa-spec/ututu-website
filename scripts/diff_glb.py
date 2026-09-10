"""2つのGLBで、絵以外が同じかを確かめる。
テクスチャを縮めたあと、リグ・スキン・アニメが変わっていないことの確認用。"""
import json, struct, sys

def load(p):
    d = open(p, 'rb').read()
    _, _, total = struct.unpack('<III', d[:12])
    off, ch = 12, []
    while off < total:
        cl, ct = struct.unpack('<II', d[off:off + 8]); ch.append((ct, cl, off + 8)); off += 8 + cl
    return json.loads(d[ch[0][2]:ch[0][2] + ch[0][1]].decode('utf-8')), d, ch

def digest(j, d, ch):
    bin_ = d[ch[1][2]:ch[1][2] + ch[1][1]]
    imgviews = {im['bufferView'] for im in j.get('images', []) if 'bufferView' in im}
    # 画像以外の bufferView の中身を並べたもの
    blob = b''.join(
        bin_[v.get('byteOffset', 0): v.get('byteOffset', 0) + v['byteLength']]
        for i, v in enumerate(j['bufferViews']) if i not in imgviews)
    return {
        'ノード名': [n.get('name') for n in j.get('nodes', [])],
        'ノードの親子': [sorted(n.get('children', [])) for n in j.get('nodes', [])],
        'ノードのTRS': [(n.get('translation'), n.get('rotation'), n.get('scale')) for n in j.get('nodes', [])],
        'メッシュ名': [m.get('name') for m in j.get('meshes', [])],
        'スキンの関節': [s.get('joints') for s in j.get('skins', [])],
        'アニメ': [(a.get('name'), len(a['channels']),
                   [(c['target']['node'], c['target']['path']) for c in a['channels']])
                  for a in j.get('animations', [])],
        'アクセサ数': len(j.get('accessors', [])),
        '絵以外のバイト列': blob,
    }

a = digest(*load(sys.argv[1]))
b = digest(*load(sys.argv[2]))
ng = 0
for k in a:
    same = a[k] == b[k]
    if k == '絵以外のバイト列':
        print(f"  {'○' if same else '×'} {k}  {len(a[k])}B / {len(b[k])}B")
    else:
        print(f"  {'○' if same else '×'} {k}")
    if not same:
        ng += 1
        if k != '絵以外のバイト列':
            print('      前:', str(a[k])[:160]); print('      後:', str(b[k])[:160])
print('一致' if ng == 0 else f'{ng}件ちがう')
sys.exit(1 if ng else 0)
