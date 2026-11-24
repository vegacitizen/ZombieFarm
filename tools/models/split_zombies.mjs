// Polyart 좀비 묶음(scene.gltf 하나에 10명이 함께 들어 있다)을 한 명씩 나눠 꼭짓점 색 GLB로 저장한다.
//   node split_zombies.mjs in/scene.gltf src/polyart
// 뼈 이름을 모두 같은 이름으로 맞추고(동작을 서로 빌려 쓰도록) 뼈의 이동·크기 트랙은 버린다(골반만 남김).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup } from '@gltf-transform/functions';
import { PNG } from 'pngjs';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [src, outDir] = process.argv.slice(2), io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
const NAMES = ['f_a', 'f_b', 'f_c', 'f_d', 'f_e', 'm_a', 'm_b', 'm_c', 'm_d', 'm_e'];
mkdirSync(outDir, { recursive: true });
const probe = await io.read(src), nSkin = probe.getRoot().listSkins().length;
const canon = probe.getRoot().listSkins()[0].listJoints().map(j => j.getName().replace(/_\d+$/, '').replace(/\s+/g, '_'));
for (let k = 0; k < nSkin; k++) {
  const doc = await io.read(src), root = doc.getRoot(), skin = root.listSkins()[k], joints = skin.listJoints(), keep = new Set(joints);
  let ci = 0; for (const j of joints) j.setName(/_\d+_\d+$/.test(j.getName()) ? 'extra_' + ci : canon[ci++]);   // 장신구용으로 겹쳐 든 뼈는 따로 이름 붙인다
  for (const n of root.listNodes()) if (n.getMesh() && n.getSkin() !== skin) n.setMesh(null).setSkin(null);
  const used = new Set(), up = n => { while (n && n.propertyType === 'Node' && !used.has(n)) { used.add(n); n = n.getParentNode(); } };   // 다른 좀비의 뼈대는 지운다
  for (const n of root.listNodes()) if (n.getMesh() || keep.has(n)) up(n);
  for (const a of root.listAnimations()) for (const c of a.listChannels()) if (!keep.has(c.getTargetNode())) { const s = c.getSampler(); c.dispose(); if (s) s.dispose(); }
  for (const n of root.listNodes()) if (!used.has(n)) n.dispose();
  for (const a of root.listAnimations()) { a.setName('Walk'); for (const c of a.listChannels()) { const t = c.getTargetNode(), p = c.getTargetPath(); if (!keep.has(t) || p === 'scale' || (p === 'translation' && t.getName() !== 'bip' && t.getName() !== 'bip_Pelvis')) { const s = c.getSampler(); c.dispose(); if (s && !s.listParents().some(q => q.propertyType === 'AnimationChannel')) s.dispose(); } } }
  const one = doc.createMaterial('v').setRoughnessFactor(1).setMetallicFactor(0), buf = root.listBuffers()[0]; let img = null;
  for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
    const mat = prim.getMaterial(), tex = mat && mat.getBaseColorTexture(), uv = prim.getAttribute('TEXCOORD_0'), n = prim.getAttribute('POSITION').getCount(), col = new Float32Array(n * 3);
    if (tex && uv && !img) img = PNG.sync.read(Buffer.from(tex.getImage()));
    for (let i = 0; i < n; i++) { let c = [1, 1, 1]; if (img && uv) { const q = uv.getElement(i, []), u = q[0] - Math.floor(q[0]), v = q[1] - Math.floor(q[1]), x = Math.min(img.width - 1, Math.floor(u * img.width)), y = Math.min(img.height - 1, Math.floor(v * img.height)), p = (y * img.width + x) * 4; c = [lin(img.data[p]), lin(img.data[p + 1]), lin(img.data[p + 2])]; } col.set(c, i * 3); }
    prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(col).setBuffer(buf)).setAttribute('TEXCOORD_0', null).setMaterial(one);
  }
  for (const e of root.listExtensionsUsed()) e.dispose();
  await doc.transform(dedup(), prune());
  const out = join(outDir, 'Zombie_' + NAMES[k] + '.glb'); await io.write(out, doc);
  console.log(out, root.listMeshes().length, 'meshes', root.listNodes().length, 'nodes', root.listAnimations().map(a => a.getName() + ':' + a.listChannels().length).join(' '));
}
