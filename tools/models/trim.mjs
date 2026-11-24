// 원본 glTF에서 남길 동작만 추려 GLB로 저장한다(저장소에 넣는 원본을 작게 하려고).  node trim.mjs in.gltf out.glb Idle Walk ...
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
const [src, out, ...keep] = process.argv.slice(2), io = new NodeIO().registerExtensions(ALL_EXTENSIONS), doc = await io.read(src);
for (const a of doc.getRoot().listAnimations()) if (!keep.includes(a.getName())) { for (const c of a.listChannels()) c.dispose(); for (const s of a.listSamplers()) s.dispose(); a.dispose(); }
await doc.transform(prune()); await io.write(out, doc);
