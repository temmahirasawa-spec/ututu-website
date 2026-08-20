import bpy, bmesh, sys, math, os
from mathutils import Vector
glb, outdir, outglb = (sys.argv[sys.argv.index("--")+1], sys.argv[sys.argv.index("--")+2],
                       sys.argv[sys.argv.index("--")+3])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)

# 首の高さは Head ボーンから取る
arm = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE'][0]
headb = arm.data.bones.get("Head") or arm.data.bones.get("head")
z_neck = (arm.matrix_world @ headb.head_local).z
print("[AV] Head ボーンの根元 z=%.3f" % z_neck)

body = bpy.data.objects.get("avaturn_body")
hair = bpy.data.objects.get("avaturn_hair_0")
for o in list(bpy.context.scene.objects):
    if o.type == 'MESH' and o not in (body, hair):
        bpy.data.objects.remove(o, do_unlink=True)

# アーマチュア変形は使わない（バインドポーズのまま）。モディファイアを外す
for o in (body, hair):
    o.modifiers.clear()
    o.parent = None

# 体は首下で切る
bm = bmesh.new(); bm.from_mesh(body.data)
mw = body.matrix_world
geom = list(bm.verts)+list(bm.edges)+list(bm.faces)
co = mw.inverted() @ Vector((0,0,z_neck - 0.01))
no = (mw.inverted().to_3x3() @ Vector((0,0,1))).normalized()
bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=no,
                       clear_inner=True, clear_outer=False)
bnd = [e for e in bm.edges if len(e.link_faces) == 1]
if bnd:
    r = bmesh.ops.holes_fill(bm, edges=bnd, sides=0)
    nf = [f for f in r.get("faces", []) if f.is_valid]
    if nf: bmesh.ops.poke(bm, faces=nf)
bm.to_mesh(body.data); bm.free()
print("[AV] 体を切断して蓋: 残り頂点 %d" % len(body.data.vertices))

# 2) 髪を頭皮に沈める。Avaturnの髪は頭皮から少し浮いた殻で、
#    白ジオメトリだと生え際に亀裂の影が出る。法線の逆方向に2.5mm押し込む
hm = hair.data
try: hm.calc_normals_split()
except AttributeError: pass
for v in hm.vertices:
    v.co -= v.normal * 0.0025

# 結合（削除直後の view_layer は無効参照を返すことがあるので、名前で引き直す）
body = bpy.data.objects["avaturn_body"]; hair = bpy.data.objects["avaturn_hair_0"]
for o in bpy.data.objects:
    if o and o.name in bpy.context.view_layer.objects: o.select_set(False)
body.select_set(True); hair.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
head = bpy.context.view_layer.objects.active
head.name = "head"
me = head.data
# 白マネキンにする：材質・UV・色を捨てる
me.materials.clear()
while me.uv_layers: me.uv_layers.remove(me.uv_layers[0])
while me.color_attributes: me.color_attributes.remove(me.color_attributes[0])
tri0 = sum(len(p.vertices)-2 for p in me.polygons)
print("[AV] 結合後: 頂点 %d / 三角面 %d" % (len(me.vertices), tri0))

# 減面
TARGET = 2500
mod = head.modifiers.new("dec",'DECIMATE'); mod.decimate_type='COLLAPSE'
ratio = TARGET/tri0
for _ in range(6):
    mod.ratio = ratio
    dg = bpy.context.evaluated_depsgraph_get()
    ev = head.evaluated_get(dg); tm = ev.to_mesh()
    got = sum(len(p.vertices)-2 for p in tm.polygons)
    ev.to_mesh_clear()
    if abs(got-TARGET) <= TARGET*0.06: break
    ratio = max(0.005, min(1.0, ratio*TARGET/max(got,1)))
dg = bpy.context.evaluated_depsgraph_get()
newme = bpy.data.meshes.new_from_object(head.evaluated_get(dg))
old = head.data; head.data = newme; head.modifiers.clear()
if old.users == 0: bpy.data.meshes.remove(old)
me = head.data
print("[AV] 減面後: 頂点 %d / 三角面 %d" % (len(me.vertices), sum(len(p.vertices)-2 for p in me.polygons)))

# 仕上げ：蓋を平らに戻し、向きの狂った面を直す。
# 減面が蓋の頂点を動かして凹凸を作り、下から見るとくさび状の影が出るため
bm = bmesh.new(); bm.from_mesh(me)
z_cut_local = (head.matrix_world.inverted() @ Vector((0, 0, z_neck - 0.01))).z
for v in bm.verts:
    if v.co.z < z_cut_local + 0.004:
        v.co.z = z_cut_local
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
left = len([e for e in bm.edges if len(e.link_faces)==1])
bm.to_mesh(me); me.update(); bm.free()
print("[AV] 蓋を平面化・法線を再計算（開いた縁 %d は髪の裏で見えない）" % left)

try: me.shade_smooth()
except AttributeError:
    for p in me.polygons: p.use_smooth = True
me.name = "ututu_head"

for o in bpy.data.objects:
    if o and o.name in bpy.context.view_layer.objects: o.select_set(False)
head.select_set(True); bpy.context.view_layer.objects.active = head
bpy.ops.export_scene.gltf(filepath=outglb, export_format='GLB', use_selection=True,
    export_morph=False, export_apply=False, export_animations=False, export_skins=False,
    export_draco_mesh_compression_enable=False, export_yup=True)
print("[AV] 書き出し: %s (%.0f KB)" % (outglb, os.path.getsize(outglb)/1024))

# レンダリング（フラット表示で確認）
try: me.shade_flat()
except AttributeError:
    for p in me.polygons: p.use_smooth = False
bb=[head.matrix_world @ Vector(c) for c in head.bound_box]
mn=Vector((min(v.x for v in bb),min(v.y for v in bb),min(v.z for v in bb)))
mx=Vector((max(v.x for v in bb),max(v.y for v in bb),max(v.z for v in bb)))
ctr=(mn+mx)/2; rad=max((v-ctr).length for v in bb)
sc=bpy.context.scene; sc.render.engine='BLENDER_WORKBENCH'
sc.render.resolution_x=sc.render.resolution_y=430
sh=sc.display.shading; sh.light='STUDIO'; sh.color_type='SINGLE'
sh.single_color=(0.86,0.84,0.79); sh.show_cavity=True
sc.world=bpy.data.worlds.new("w"); sc.world.color=(0.12,0.13,0.14)
tgt=bpy.data.objects.new("t",None); sc.collection.objects.link(tgt); tgt.location=ctr
cd=bpy.data.cameras.new("c"); cd.lens=62
cam=bpy.data.objects.new("cam",cd); sc.collection.objects.link(cam)
cn=cam.constraints.new('TRACK_TO'); cn.target=tgt; cn.track_axis='TRACK_NEGATIVE_Z'; cn.up_axis='UP_Y'
sc.camera=cam
for tag,az,el in [("1_front",0,0),("2_three",34,8),("3_side",90,0),("4_back",180,0),("5_below",0,-35)]:
    a,e=math.radians(az),math.radians(el)
    cam.location=ctr+Vector((math.sin(a)*math.cos(e),-math.cos(a)*math.cos(e),math.sin(e)))*rad*2.7
    sc.render.filepath=os.path.join(outdir,tag+".png"); bpy.ops.render.render(write_still=True)
print("[AV] レンダリング完了")
