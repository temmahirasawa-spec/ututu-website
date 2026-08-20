import bpy, sys, os
glb, out, maxpx = sys.argv[sys.argv.index("--")+1], sys.argv[sys.argv.index("--")+2], int(sys.argv[sys.argv.index("--")+3])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
tot_before=0
for img in bpy.data.images:
    if img.size[0]==0: continue
    w,h=img.size; tot_before+=w*h
    if max(w,h) > maxpx:
        sc = maxpx/max(w,h)
        img.scale(max(1,int(w*sc)), max(1,int(h*sc)))
        print("[R] %-22s %dx%d → %dx%d" % (img.name[:22], w,h, img.size[0], img.size[1]))
for o in bpy.context.view_layer.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True,
    export_animations=True, export_skins=True,
    export_image_format='AUTO', export_jpeg_quality=82,
    export_draco_mesh_compression_enable=False, export_yup=True)
print("[R] 書き出し %s (%.2f MB)" % (out, os.path.getsize(out)/1048576))
