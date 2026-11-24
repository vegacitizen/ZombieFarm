// CC0 모형(Kenney · Quaternius)을 게임에 맞게 줄여 한 파일로 묶는다.
//   npm install && npm run build
// 하는 일: 쓰지 않는 동작 지우기 · 텍스처와 재질 색을 꼭짓점 색으로 굽기(텍스처 없음, 재질 하나) ·
//          조각 합치기 · 양자화 · meshopt 압축 풀기(게임에서 디코더 없이 읽도록) · base64로 pack_models.js에 쓰기
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, join, flatten, resample, weld, quantize, simplify } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import { PNG } from 'pngjs';
import { createRequire } from 'node:module';
import { dirname, join as pjoin } from 'node:path';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const SRC = pjoin(dirname(require.resolve('@netforge/asset-library-files/package.json')), 'library', 'lowpoly');
const OUT = pjoin(dirname(fileURLToPath(import.meta.url)), '..', '..', 'app', 'src', 'main', 'assets', 'pack_models.js');
const HERE = dirname(fileURLToPath(import.meta.url));
const ANIMAL = ['Idle', 'Walk', 'Gallop', 'Eating'], PERSON = ['idle', 'walk', 'emote-yes'], OLD = ['Armature|Idle', 'Armature|Jump'];
const DINO = n => ['Armature|' + n + '_Idle', 'Armature|' + n + '_Walk', 'Armature|' + n + '_Run'], WHO = ['Idle', 'Walk', 'Run', 'Walk_Carry', 'Run_Carry', 'PickUp', 'Punch', 'SwordSlash', 'SitDown', 'Shoot_OneHanded', 'RecieveHit', 'Victory'], HALF = { simplify: .5, lift: 1.4, pal: { Skin: '#eebf98', Face: '#f6d2b0' } };
// Quaternius 자연물: 재질 이름 → 게임의 색
const NAT = { Wood: '#8a5a3a', Green: '#4f9d5d', DarkGreen: '#3a8048', Rock: '#8f949c', Berry: '#d94f3a', White: '#e8e0d0', Black: '#4a4038', Orange: '#d98a3a', LightWood: '#d9b98a', Cyan: '#6fc3e8', Yellow: '#ffd54a', Pink: '#f29ac0', Mushroom_Top: '#c8402f', Mushroom_Bottom: '#f3e6cf' };
const tree = (f, k) => ['src/' + f + '.glb', null, { pal: NAT, simplify: k || .35 }], nat = (f, pal) => ['src/' + f + '.glb', null, { pal: Object.assign({}, NAT, pal) }];
// 건물과 소품: 재질 이름 → 게임의 색
const FARM = { DarkRed: '#8a2f27', LightRed: '#b5463a', White: '#fff3e0', RoofBlack: '#5a4a44', Brown: '#8a5a34', Grey: '#9aa0a8', DarkGrey: '#5a6068' };
const TOWN = { Plaster: '#eadfc0', Beige: '#eadfc0', Wood: '#8a5a34', Wood_Light: '#a9744f', Wood_Side: '#c79a63', DarkWood: '#6b4a2a', Stone: '#7b8088', Stone_Light: '#a7acb3', Stone_Dark: '#8f949c', Windows: '#3a4a5a', RoofTiles: '#3f7f8f', RoofTiles_Red: '#b5463a', Green: '#5fae4a', Metal: '#6b6f78', Red: '#c2523f', Bag: '#d9b98a', Hay: '#e9cf8c' };
const farm = (f, k) => ['src/Farm_' + f + '.glb', null, { pal: FARM, simplify: k || .5 }], town = (f, k) => ['src/Village_' + f + '.glb', null, { pal: TOWN, simplify: k || .5 }], rts = (f, pal) => ['src/RTS_' + f + '.glb', null, { pal: pal || {}, simplify: .6 }];
const GUNC = { LightMetal: '#8a8f98', Metal: '#5a6068', DarkMetal: '#3a3a40', Black: '#2a2a2e', Wood: '#8a5a34', DarkWood: '#6b4a2a', LightWood: '#c79a63', Barrels: '#4a5058', Barrel: '#4a5058', Trigger: '#2a2a2e', Green: '#4a6a3a', Magazine: '#3a3a40', BulletYellow: '#e8c04a', BulletOrange: '#d98a3a' };
const ZPA = (k, anim) => ['src/polyart/Zombie_' + k + '.glb', anim ? ['Walk'] : [], { simplify: .7 }];
const MODELS = {   // 게임에서 쓰는 이름: [원본, 남길 동작, 옵션]. 'src/'로 시작하면 이 폴더의 파일, 아니면 npm 꾸러미의 모형
  // 옵션 — pal: 재질 이름별 색 바꾸기, lift: 어둡게 저장된 색 밝히기(클수록 더 밝게), simplify: 삼각형을 이 비율로 줄이기(error: 허용 오차, coarse: 색을 굵게 묶어 더 잘 줄게)
  tree_oak: tree('CommonTree_1', .28), tree_fat: tree('CommonTree_3'), tree_autumn: tree('CommonTree_Autumn_1', .28), tree_pine: tree('PineTree_1'), tree_pine_tall: tree('PineTree_2'), tree_dark: tree('PineTree_3', .3),
  birch: tree('BirchTree_1'), willow: tree('Willow_1'),
  bush: nat('Bush_1', { Green: '#7fb24a' }), bush_large: nat('BushBerries_1', { Green: '#6fa844' }), rock_small: nat('Rock_2'), rock_large: nat('Rock_3'), rock_tall: nat('Rock_1'),
  stump: nat('TreeStump_Moss', { Green: '#6fa844' }), log: nat('WoodLog_Moss', { Green: '#6fa844', DarkGreen: '#5a9a3a' }), flower_red: nat('Flowers', { Green: '#5fae4a' }), mushroom_red: nat('Plant_1', { Green: '#5fae4a' }), lilypad: nat('Lilypad', { Green: '#4fae5a' }),
  barn1: farm('SmallBarn'), barn2: farm('BigBarn'), silo: farm('Silo'), watertower: farm('WaterTower'), well: farm('Well'), windmill: farm('Windmill', .7), fence_wood: farm('Fence', 1),
  house1: town('House_1'), house3: town('House_3'), house4: town('House_4'), blacksmith: town('Blacksmith'), inn: town('Inn'), mill: town('Mill'), sawmill: town('Sawmill'),
  stand1: town('MarketStand_1'), stand2: town('MarketStand_2'), gazebo: town('Gazebo'), bench: town('Bench_1', 1), hay: town('Hay', 1), barrel: town('Barrel', .5), crate: town('Crate', .6), bags: town('Bags', .6),
  watchtower: rts('WatchTower_FirstAge_Level3'), gate: rts('WallTowers_Door_FirstAge'), market: rts('Market_FirstAge_Level1'), mountain1: rts('Mountain_Single', { Stone: '#8f949c', Dirt: '#7d828a' }), mountain2: rts('MountainLarge_Single', { Stone: '#8f949c', Dirt: '#7d828a', Snow: '#f4f6f8' }),
  food_carrot: ['src/Food_Carrot.glb', null, { simplify: .5, pal: { Orange: '#f08a2c', DarkGreen: '#4fae4a' } }], food_pumpkin: ['src/Food_Pumpkin.glb', null, { simplify: .5, pal: { Orange: '#f08a1c', Brown: '#5a8f3a' } }],
  food_apple: ['src/Food_Apple.glb', null, { simplify: .4, pal: { DarkRed: '#d8402f', DarkBrown: '#6b4a2a', DarkGreen: '#4fae4a' } }], food_pear: ['src/Food_Apple_Green.glb', null, { simplify: .4, pal: { PaleGreen: '#c8d85a', DarkBrown: '#6b4a2a', DarkGreen: '#4fae4a' } }], food_orange: ['src/Food_Orange.glb', null, { simplify: .6, pal: { Orange: '#ff9a1f' } }],
  food_donut: ['src/Food_Donut1.glb', null, { simplify: .5, pal: { LightYellow: '#e8c08a', PalePink: '#f29ac0', Red: '#e2493f', Blue: '#4f8fd9', Green: '#6cc85a' } }],
  fish1: ['src/Fish2018_Fish1.glb', null, { simplify: .5, pal: { Bottom: '#e8f4ea', Top: '#f0704a', Fins: '#f0c880' } }], fish3: ['src/Fish2018_Fish3.glb', null, { simplify: .5, pal: { Body: '#f04a2a', Stripes: '#fff3e0', Outline: '#2a2a2e' } }],
  gun1: ['src/Survival_Shotgun_1.glb', null, { simplify: .5, pal: GUNC }], gun2: ['src/Survival_Shotgun_2.glb', null, { simplify: .5, pal: GUNC }],
  gun3: ['src/Gun_SniperRifle.glb', null, { simplify: .4, pal: GUNC }], gun4: ['src/Gun_P90.glb', null, { simplify: .5, pal: { 'Material.001': '#3a3a40', 'Material.002': '#5a6068', 'Material.003': '#2a2a2e', 'Material.004': '#8a8f98' } }],
  torch: ['src/Survival_WoodenTorch.glb', null, { pal: { DarkWood: '#8a5a34', LightGrey: '#9aa0a8', Yellow: '#e8c04a' } }], shovel: ['src/Survival_Shovel.glb', null, { pal: { DarkWood: '#8a5a34', Grey: '#9aa0a8', Red: '#c2523f' } }],
  bonfire: ['src/Survival_Bonfire_Fire.glb', null, { simplify: .6, pal: { Wood: '#8a5a34', LightWood: '#a9744f', Fire: '#ff8a1f' } }], tent: ['src/Survival_Tent.glb', null, { simplify: .6, pal: { DarkWood: '#8a5a34', Black: '#3a3a40', LightGreen: '#8fae6a', Green: '#5f8f4a' } }],
  // Sketchfab의 CC-BY 4.0 모형(뼈대 없음). prebake.mjs로 꼭짓점 색 GLB로 바꿔 둔 것. 출처는 src/README.md
  giraffe: ['src/Extra_Giraffe.glb', null, { simplify: .8 }], goat: ['src/Extra_Goat.glb', null, { simplify: .8 }], hippo: ['src/Extra_Hippo.glb', null, { simplify: .8 }], llama: ['src/Extra_Llama.glb', null, { simplify: .1, error: .4, coarse: 1 }],
  // 낙타는 CC0 알파카 모형을 낙타 색으로 칠한 것. 혹은 게임에서 뼈에 붙인다
  camel: ['src/Alpaca.glb', ANIMAL, { pal: { Main: '#c9a26a', Main_Light: '#e0c08c', Main_Dark: '#8a6a44', Hooves: '#5a4a3a', Muzzle: '#6b5038' } }],
  tractor: ['tractor'],
  // 양(Extra_Sheep)은 동작이 풀을 뜯는 것 하나뿐이다
  cow: ['src/Cow.glb', ANIMAL], horse: ['src/Horse.glb', ANIMAL], sheep: ['src/Extra_Sheep.glb', ['Take 001'], { rename: { 'Take 001': 'Idle' } }], pig: ['src/Pig.glb', OLD, { pal: { 'Material.003': '#f2a6b4', Material: '#8a4a52' } }],
  bull: ['src/Bull.glb', ANIMAL], horse_white: ['src/Horse_White.glb', ANIMAL], alpaca: ['src/Alpaca.glb', ANIMAL], donkey: ['src/Donkey.glb', ANIMAL],
  stag: ['stag', ANIMAL], deer: ['deer', ANIMAL], fox: ['fox', ANIMAL], wolf: ['wolf', ANIMAL],
  dino_trex: ['src/Dino_Trex.glb', DINO('TRex'), { simplify: .6, pal: { Green: '#5f7f4a', Black: '#2a2a2a', LightGreen: '#d8cf9a', Red: '#b8323a', LightYellow: '#e8c070' } }], dino_trike: ['src/Dino_Triceratops.glb', DINO('Triceratops'), { simplify: .6, pal: { Purple: '#7fa66a', LightBrown: '#cfe0b0', Brown: '#5a7a4a' } }], dino_raptor: ['src/Dino_Velociraptor.glb', DINO('Velociraptor'), { simplify: .6, pal: { Brown: '#c8743a', Black: '#2a2a2a', LightBrown: '#f0d6a8' } }], dino_apato: ['src/Dino_Apatosaurus.glb', DINO('Apatosaurus'), { simplify: .6, pal: { Brown: '#6f9fb8', Black: '#2a2a2a', Material: '#c4dde8', LightBrown: '#8fb8cc' } }],
  // 사람은 뼈대가 모두 같아서 동작은 person_a 하나에만 두고 나머지는 그 동작을 빌려 쓴다
  person_a: ['src/Casual_Male.glb', WHO, HALF], person_b: ['src/Casual_Female.glb', [], HALF], person_c: ['src/Casual2_Male.glb', [], HALF], person_d: ['src/Casual2_Female.glb', [], HALF], person_e: ['src/OldClassy_Female.glb', [], HALF],
  worker_a: ['src/Worker_Male.glb', [], HALF], worker_b: ['src/Worker_Female.glb', [], HALF], cowboy_a: ['src/Cowboy_Male.glb', [], HALF], cowboy_b: ['src/Cowboy_Female.glb', [], HALF],
  koi: ['src/Koi.glb', null, { simplify: .4, pal: { Koi_Main: '#f0602a', Koi_Fins: '#f8d8a0', Koi_Light: '#ffffff', Koi_Dark: '#3a3a3a', Eyes: '#101010' } }], dock_long: ['src/Dock_Long.glb', null, { simplify: .5, pal: { Wood: '#a9744f', LightWood: '#c79a63', String: '#d9c08a', DarkWood: '#7a4f2c' } }], dock_wide: ['src/Dock_Wide.glb', null, { simplify: .5, pal: { Wood: '#a9744f', LightWood: '#c79a63', String: '#d9c08a', DarkWood: '#7a4f2c' } }],
  // 좀비: Quaternius 좀비(CC0)는 동작이 다섯 가지. Polyart 좀비 열 명(split_zombies.mjs로 나눈 것)은 걷는 동작뿐이고 뼈대가 같아 네 명의 동작을 나머지가 빌려 쓴다
  zombie: ['src/Zombie.glb', ['Run', 'Bite', 'Crawl', 'Walk', 'Idle'], { simplify: .5 }],
  zfat: ['src/polyart/FatZombie.glb', null, { simplify: .4 }],   // 뼈대 없는 뚱보 좀비(ol234, Sketchfab Standard). 게임에서 뒤뚱거리게 움직인다
  zpa_f_a: ZPA('f_a', 1), zpa_f_b: ZPA('f_b'), zpa_f_c: ZPA('f_c', 1), zpa_f_d: ZPA('f_d'), zpa_f_e: ZPA('f_e'), zpa_m_a: ZPA('m_a', 1), zpa_m_b: ZPA('m_b'), zpa_m_c: ZPA('m_c'), zpa_m_d: ZPA('m_d', 1), zpa_m_e: ZPA('m_e'),
  boat_small: ['src/Boat_Small.glb', null, { pal: { DarkWood: '#7a4f2c', Wood: '#a9744f' } }], boat1: ['src/Ship_Boat.glb', null, { pal: { DarkWood: '#7a4f2c', Wood: '#a9744f' } }], boat2: ['src/Ship_Lifeboat.glb'], boat3: ['src/Ship_BoatWSail.glb', null, { pal: { DarkWood: '#7a4f2c', LightWood: '#c79a63', Sail: '#f4ecd8', Steel: '#8a8f98' } }], boat4: ['src/Ship_CruiseShip.glb']
};
const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
const hex = h => [1, 3, 5].map(i => lin(parseInt(h.slice(i, i + 2), 16)));

await MeshoptDecoder.ready; await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const out = {}; let total = 0;
// 저장소에 원본을 두지 않는 모형(src/polyart: 다시 나눠 주지 못하는 라이선스)은 원본이 없으면 지금 묶음에 든 것을 그대로 쓴다
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8').replace(/^[\s\S]*?window\.PACK_GLB = /, '').replace(/;\s*$/, '')) : {};
for (const [id, [src, keep, opt = {}]] of Object.entries(MODELS)) {
  if (src.startsWith('src/') && !existsSync(pjoin(HERE, src))) { if (!prev[id]) throw new Error('원본이 없어요: ' + src); out[id] = prev[id]; console.log(id.padEnd(16), '(원본 없음: 지금 묶음의 것을 그대로 씀)'); continue; }
  const seenS = new Set(), doc = await io.read(src.startsWith('src/') ? pjoin(HERE, src) : pjoin(SRC, src + '.glb')), root = doc.getRoot(), seen = {};
  for (const a of root.listAnimations()) { const n = a.getName(); if (!keep || !keep.includes(n) || seen[n]) { for (const c of a.listChannels()) c.dispose(); for (const q of a.listSamplers()) q.dispose(); a.dispose(); } else seen[n] = 1; }
  for (const a of root.listAnimations()) {   // 동작 줄이기: 크기 변화 트랙은 버리고, 키프레임은 초당 12개쯤만 남긴다
    for (const ch of a.listChannels()) { if (ch.getTargetPath() === 'scale') { const s0 = ch.getSampler(); ch.dispose(); if (s0) s0.dispose(); continue; } const sm = ch.getSampler(); if (!sm || sm.getInterpolation() === 'CUBICSPLINE' || seenS.has(sm)) continue; seenS.add(sm);
      const ti = sm.getInput(), to = sm.getOutput(), t = ti.getArray(), o = to.getArray(), n = ti.getCount(), w = to.getElementSize(), keepI = []; let last = -1;
      for (let i = 0; i < n; i++) if (i === 0 || i === n - 1 || t[i] - last >= 1 / 12 - 1e-4) { keepI.push(i); last = t[i]; }
      if (keepI.length === n) continue; const t2 = new Float32Array(keepI.length), o2 = new Float32Array(keepI.length * w); keepI.forEach((k, j) => { t2[j] = t[k]; for (let c = 0; c < w; c++) o2[j * w + c] = o[k * w + c]; });
      sm.setInput(doc.createAccessor().setType('SCALAR').setArray(t2).setBuffer(ti.getBuffer())).setOutput(doc.createAccessor().setType(to.getType()).setArray(o2).setBuffer(to.getBuffer())); } }
  if (opt.rename) for (const a of root.listAnimations()) if (opt.rename[a.getName()]) a.setName(opt.rename[a.getName()]);   // 동작 이름을 게임에서 쓰는 이름으로
  const one = doc.createMaterial('v').setRoughnessFactor(1).setMetallicFactor(0), pngs = new Map(), buf = root.listBuffers()[0];
  for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
    const mat = prim.getMaterial(), pc = mat && opt.pal && opt.pal[mat.getName()], f0 = mat ? mat.getBaseColorFactor() : [1, 1, 1, 1], f = pc ? hex(pc) : opt.lift ? f0.map((v, i) => i < 3 ? Math.pow(v, 1 / (2.2 * opt.lift)) : v) : f0, tex = mat && mat.getBaseColorTexture(), uv = prim.getAttribute('TEXCOORD_0'), old = prim.getAttribute('COLOR_0'), n = prim.getAttribute('POSITION').getCount(), col = new Uint16Array(n * 3);
    let img = null, off = [0, 0], sc = [1, 1];
    if (tex && uv) { img = pngs.get(tex) || PNG.sync.read(Buffer.from(tex.getImage())); pngs.set(tex, img); const tt = mat.getBaseColorTextureInfo().getExtension('KHR_texture_transform'); if (tt) { off = tt.getOffset(); sc = tt.getScale(); } }
    for (let i = 0; i < n; i++) { let c = [f[0], f[1], f[2]];
      if (img) { const q = uv.getElement(i, []), u = q[0] * sc[0] + off[0], v = q[1] * sc[1] + off[1], x = Math.min(img.width - 1, Math.max(0, Math.floor((u - Math.floor(u)) * img.width))), y = Math.min(img.height - 1, Math.max(0, Math.floor((v - Math.floor(v)) * img.height))), p = (y * img.width + x) * 4; c = [c[0] * lin(img.data[p]), c[1] * lin(img.data[p + 1]), c[2] * lin(img.data[p + 2])]; }
      if (old) { const q = old.getElement(i, []); c = [c[0] * q[0], c[1] * q[1], c[2] * q[2]]; }
      for (let k = 0; k < 3; k++) { let v = Math.min(1, Math.max(0, c[k])); if (opt.coarse) v = Math.round(Math.sqrt(v) * 10) / 10, v *= v; col[i * 3 + k] = Math.round(v * 65535); } }
    prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(col).setNormalized(true).setBuffer(buf)).setAttribute('TEXCOORD_0', null).setMaterial(one); if (opt.simplify) prim.setAttribute('NORMAL', null);   // 줄일 모형은 법선을 버린다(게임에서 다시 계산). 그래야 꼭짓점이 합쳐져 줄어든다
  }
  for (const mesh of root.listMeshes()) {   // 한 모형의 조각을 하나로 합친다(그리는 횟수 줄이기)
    const ps = mesh.listPrimitives(), sem = ps[0].listSemantics(); if (ps.length < 2 || !ps.every(p => p.getIndices() && p.getMode() === ps[0].getMode() && p.listSemantics().join() === sem.join() && sem.every(k => p.getAttribute(k).getArray().constructor === ps[0].getAttribute(k).getArray().constructor))) continue;
    const tot = ps.reduce((n, p) => n + p.getAttribute('POSITION').getCount(), 0), np = doc.createPrimitive().setMaterial(one), idx = []; let base = 0;
    for (const k of sem) { const a0 = ps[0].getAttribute(k), arr = new (a0.getArray().constructor)(tot * a0.getElementSize()); let o = 0; for (const p of ps) { const a = p.getAttribute(k).getArray(); arr.set(a, o); o += a.length; } np.setAttribute(k, doc.createAccessor().setType(a0.getType()).setArray(arr).setNormalized(a0.getNormalized()).setBuffer(buf)); }
    for (const p of ps) { for (const v of p.getIndices().getArray()) idx.push(v + base); base += p.getAttribute('POSITION').getCount(); }
    np.setIndices(doc.createAccessor().setType('SCALAR').setArray(tot > 65535 ? new Uint32Array(idx) : new Uint16Array(idx)).setBuffer(buf)); for (const p of ps) { mesh.removePrimitive(p); p.dispose(); } mesh.addPrimitive(np);
  }
  for (const e of root.listExtensionsUsed()) if (['EXT_meshopt_compression', 'KHR_materials_unlit', 'KHR_texture_transform'].includes(e.extensionName)) e.dispose();
  await doc.transform(dedup(), ...(keep ? [resample()] : [flatten()]), join(), weld(), ...(opt.simplify ? [simplify({ simplifier: MeshoptSimplifier, ratio: opt.simplify, error: opt.error || .05 })] : []), prune(), quantize({ quantizePosition: 14, quantizeNormal: 8, quantizeColor: 8, quantizeWeight: 8 }));
  const tris = root.listMeshes().reduce((n, m) => n + m.listPrimitives().reduce((k, p) => k + (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3, 0), 0);
  const glb = await io.writeBinary(doc); out[id] = Buffer.from(glb).toString('base64'); total += glb.byteLength;
  console.log(id.padEnd(16), String(glb.byteLength).padStart(8), 'bytes', String(Math.round(tris)).padStart(6), 'tris', root.listAnimations().map(a => a.getName()).join(' '));
}
writeFileSync(OUT, '/* 모형 묶음. CC0 1.0 — Quaternius (quaternius.com): 자연물 · 가축과 야생 동물 · 공룡 · 사람 · 물고기와 선착장 · 배 · 좀비(zombie) / Kenney (kenney.nl): 트랙터(Car Kit).\n   Sketchfab Standard — Denys Almaral: Polyart Zombies with Animations Free Pack(zpa_*) / ol234: zombie(zfat).\n   tools/models/build.mjs로 만든다. 직접 고치지 않는다. */\nwindow.PACK_GLB = ' + JSON.stringify(out) + ';\n');
console.log('total', total, 'bytes ->', OUT);
