# 모형 원본

## Quaternius (CC0 1.0)

각 팩의 License.txt에 "CC0 1.0 Universal (CC0 1.0) Public Domain Dedication"으로 적혀 있다. 만든이: Quaternius (https://quaternius.com).

| 파일 | 팩 | 가져온 방법 |
| --- | --- | --- |
| `Cow.glb`, `Horse.glb`, `Bull.glb`, `Horse_White.glb`, `Alpaca.glb`, `Donkey.glb` | Ultimate Animated Animals (2021-07) | glTF에서 쓰는 동작만 남김(`trim.mjs`) |
| `Casual*.glb`, `OldClassy_Female.glb`, `Worker_*.glb`, `Cowboy_*.glb` | Ultimate Animated Character Pack (2019-11) | glTF에서 동작을 덜어 냄(`trim.mjs`). 동작은 `Casual_Male.glb`에만 남기고 나머지는 뼈대가 같아 빌려 씀 |
| `Sheep.glb`, `Pig.glb` | Farm Animals Pack (2018) | FBX → GLB |
| `Dino_*.glb` | Dinosaur Animated Pack (2018-12) | FBX → GLB |
| `CommonTree_*`, `PineTree_*`, `BirchTree_1`, `Willow_1`, `Bush_1`, `BushBerries_1`, `Rock_*`, `TreeStump_Moss`, `WoodLog_Moss`, `Flowers`, `Plant_1`, `Lilypad` | Ultimate Nature Pack (2019-06) | FBX → GLB |
| `Koi.glb`, `Dock_Long.glb`, `Dock_Wide.glb`, `Boat_Small.glb` | Cute Fish Pack (2020-02) | FBX → GLB |
| `Ship_*.glb` | Ships (2018) | FBX → GLB |
| `Farm_*.glb` | Farm Buildings (2018-09) | FBX → GLB |
| `Village_*.glb` | Medieval Village Pack (2020-12) | FBX → GLB |
| `RTS_*.glb` | Ultimate Fantasy RTS (2022-08) | glTF → GLB(`trim.mjs`) |
| `Food_*.glb` | Ultimate Food Pack (2019-10) | FBX → GLB |
| `Fish2018_*.glb` | Animated Fish Pack (2018) | FBX → GLB |
| `Survival_*.glb` | Survival Pack (2020-09) | FBX → GLB |
| `Zombie.glb` | Zombie (2017-12, 작가가 공개한 드라이브 폴더 "Zombie by @Quaternius") | FBX → GLB. 32×32 팔레트 텍스처(ZombieTexture.png)를 꼭짓점 색으로 구워 넣음. 동작: Run · Bite · Crawl · Walk · Idle |
| `Gun_*.glb` | Animated FPS Guns (2018-06) | FBX → GLB. **이 폴더에는 License.txt가 없었다.** 같은 작가의 다른 팩은 모두 CC0이지만 이 팩의 라이선스는 폴더 안에서 확인하지 못했다 |

FBX → GLB는 three.js(0.160)의 FBXLoader로 읽어 GLTFExporter로 내보냈다. 색과 삼각형 수는 `build.mjs`의 옵션(pal · lift · simplify)으로 맞춘다.

## Sketchfab (CC-BY 4.0 — 출처를 밝혀야 함)

`prebake.mjs`로 텍스처와 재질 색을 꼭짓점 색으로 바꿔 넣었다(모양은 그대로, 묶을 때 삼각형 수를 줄임).

| 파일 | 원본 |
| --- | --- |
| `Extra_Giraffe.glb` | "Giraffe Low Poly" (https://sketchfab.com/3d-models/giraffe-low-poly-cc56a519d6654580b5939154e4719531) by millermeln (https://sketchfab.com/millermeln), CC-BY-4.0 |
| `Extra_Goat.glb` | "Low-poly Goat" (https://sketchfab.com/3d-models/low-poly-goat-e08bb2e734004870b1ed4c21f111a854) by Zafflex (https://sketchfab.com/Zafflex), CC-BY-4.0 |
| `Extra_Hippo.glb` | "Low poly angry looking hippo" (https://sketchfab.com/3d-models/low-poly-angry-looking-hippo-451daef26695425ab1b751f503f182e6) by Tiberiu Uncu (https://sketchfab.com/pangolinbc), CC-BY-4.0 |
| `Extra_Sheep.glb` | "animated low poly sheep game ready model" (https://sketchfab.com/3d-models/animated-low-poly-sheep-game-ready-model-66f3851d8827411c91d208d172305666) by creosine (https://sketchfab.com/creosine), CC-BY-4.0. 뼈대와 풀 뜯는 동작이 있음 |
| `Extra_Llama.glb` | "Low Poly Llama 3d Model Free" (https://sketchfab.com/3d-models/low-poly-llama-3d-model-free-fe23d7daf59940ffb7f982701d7de7f4) by iRahulRajput (https://sketchfab.com/rt699448), CC-BY-4.0 |

"Giraffe" by Nevermoredmb는 CC-BY-NC(비상업)라서 넣지 않았다.

## npm `@netforge/asset-library-files` 0.2.0 (트랙터 · 사슴 2종 · 여우 · 늑대)

묶음의 `NOTICE`에 따르면 `library/`의 파일은 모두 CC0 1.0 원본을 줄인 사본이다. 동물은 Quaternius가 Poly Pizza에 올린 모형(각 모형 페이지에 Public Domain(CC0) 표기)이고, 탈것은 Kenney의 Car Kit 등(각 압축 파일의 License.txt에 CC0)이다. 같은 NOTICE에 "Quaternius's pack pages state License CC0"라고 적혀 있어, License.txt가 없던 `Gun_*.glb`(Animated FPS Guns)도 같은 조건으로 본다. 원본 페이지를 직접 열어 확인한 것은 아니다.

## Sketchfab Standard License — 원본을 저장소에 두지 않음

| 묶음 안의 이름 | 원본 |
| --- | --- |
| `zfat` | "zombie" (https://sketchfab.com/3d-models/zombie-91c0ae13c3554475a67eec09847d1a67) by ol234 (https://sketchfab.com/ol234). 뼈대가 없는 모형. `node prebake.mjs <받은 폴더>/scene.gltf src/polyart/FatZombie.glb` |
| `zpa_f_a` ~ `zpa_f_e`, `zpa_m_a` ~ `zpa_m_e` | "Polyart Zombies with Animations Free Pack" (https://sketchfab.com/3d-models/polyart-zombies-with-animations-free-pack-d9bcfdd88f5348549bc947226af7c314) by Denys Almaral (https://sketchfab.com/denysalmaral) |

이 라이선스는 게임 같은 결과물에 넣어 쓰는 것은 허용하지만 원본 파일을 다시 나눠 주는 것은 허용하지 않는다. 그래서 `src/polyart/`는 `.gitignore`에 넣었다.
원본(scene.gltf · scene.bin · textures/)을 내려받아 `node split_zombies.mjs <받은 폴더>/scene.gltf src/polyart`로 한 명씩 나누면(텍스처를 꼭짓점 색으로 굽고, 뼈 이름을 맞추고, 뼈의 이동 트랙을 버린다) `build.mjs`가 그것을 쓴다.
`src/polyart/`가 없으면 `build.mjs`는 지금 `pack_models.js`에 들어 있는 `zpa_*`를 그대로 옮겨 쓴다.
