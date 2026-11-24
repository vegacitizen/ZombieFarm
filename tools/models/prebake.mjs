// 텍스처나 재질 색을 쓰는 모형을 꼭짓점 색 GLB로 바꿔 src/에 넣는다(텍스처를 저장소에 넣지 않으려고).
//   node prebake.mjs in/scene.gltf src/Name.glb
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup } from '@gltf-transform/functions';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';
const [src, out] = process.argv.slice(2), io = new NodeIO().registerExtensions(ALL_EXTENSIONS), doc = await io.read(src), root = doc.getRoot();
const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
const one = doc.createMaterial('v').setRoughnessFactor(1).setMetallicFactor(0), imgs = new Map(), buf = root.listBuffers()[0], seen = {};
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
  const mat = prim.getMaterial(), sg = mat && mat.getExtension('KHR_materials_pbrSpecularGlossiness'), f = sg ? sg.getDiffuseFactor() : mat ? mat.getBaseColorFactor() : [1, 1, 1, 1], tex = sg ? sg.getDiffuseTexture() : mat && mat.getBaseColorTexture(),   // 옛 방식(specular-glossiness) 재질도 읽는다
    uv = prim.getAttribute('TEXCOORD_0'), old = prim.getAttribute('COLOR_0'), n = prim.getAttribute('POSITION').getCount(), col = new Float32Array(n * 3);
  let img = null; if (tex && uv) { img = imgs.get(tex); if (!img) { const b = Buffer.from(tex.getImage()); img = tex.getMimeType() === 'image/png' ? PNG.sync.read(b) : jpeg.decode(b, { useTArray: true, maxMemoryUsageInMB: 2048 }); imgs.set(tex, img); } }
  if (mat) seen[mat.getName() + (tex ? '[tex]' : '') + (old ? '[vc]' : '') + ':' + f.slice(0, 3).map(v => v.toFixed(2)).join('/')] = 1;
  for (let i = 0; i < n; i++) { let c = [f[0], f[1], f[2]];
    if (img) { const q = uv.getElement(i, []), u = q[0] - Math.floor(q[0]), v = q[1] - Math.floor(q[1]), x = Math.min(img.width - 1, Math.floor(u * img.width)), y = Math.min(img.height - 1, Math.floor(v * img.height)), p = (y * img.width + x) * 4; c = [c[0] * lin(img.data[p]), c[1] * lin(img.data[p + 1]), c[2] * lin(img.data[p + 2])]; }
    if (old) { const q = old.getElement(i, []); c = [c[0] * q[0], c[1] * q[1], c[2] * q[2]]; }
    col.set(c, i * 3); }
  prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(col).setBuffer(buf)).setAttribute('TEXCOORD_0', null).setMaterial(one);
  for (const s of prim.listSemantics()) if (s.startsWith('TEXCOORD') || s === 'TANGENT') prim.setAttribute(s, null);
}
for (const e of root.listExtensionsUsed()) e.dispose();
await doc.transform(dedup(), prune()); await io.write(out, doc);
let tris = 0; for (const m of root.listMeshes()) for (const p of m.listPrimitives()) tris += (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3;
console.log(out, 'tris', tris, Object.keys(seen).join(' '));
