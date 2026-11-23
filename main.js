import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/* ============================== DATA ============================== */
// Visual radii/orbits are artistically compressed so the whole system
// reads clearly on screen; real-world numbers are shown in the info panel.
const PLANETS = [
  {
    key: "mercury", name: "Меркурий", tex: "2k_mercury.jpg",
    radius: 0.38, orbitRadius: 9, orbitSpeed: 4.15, rotSpeed: 0.004, tilt: 0.001,
    diameterKm: 4879, distanceAU: 0.39, distanceKm: "57.9 млн км",
    periodDays: 88, periodLabel: "88 суток", dayLength: "58.6 земных суток",
    moons: 0,
    fact: "Меркурий — самая маленькая планета и ближайшая к Солнцу. Перепады температуры на нём — одни из самых резких в системе: от +430°C днём до −180°C ночью."
  },
  {
    key: "venus", name: "Венера", tex: "2k_venus_surface.jpg", atmosphereTex: "2k_venus_atmosphere.jpg",
    radius: 0.95, orbitRadius: 12.5, orbitSpeed: 1.62, rotSpeed: -0.0009, tilt: 3.1,
    diameterKm: 12104, distanceAU: 0.72, distanceKm: "108.2 млн км",
    periodDays: 225, periodLabel: "225 суток", dayLength: "243 земных суток",
    moons: 0,
    fact: "Венера вращается в обратную сторону и медленнее, чем облетает Солнце — её сутки длиннее её года. Плотная атмосфера CO₂ создаёт парниковый эффект до +465°C."
  },
  {
    key: "earth", name: "Земля", tex: "2k_earth_daymap.jpg", nightTex: "2k_earth_nightmap.jpg",
    cloudsTex: "2k_earth_clouds.jpg", normalTex: "2k_earth_normal.jpg", specularTex: "2k_earth_specular.jpg",
    radius: 1.0, orbitRadius: 16, orbitSpeed: 1.0, rotSpeed: 0.02, tilt: 0.41,
    diameterKm: 12742, distanceAU: 1.0, distanceKm: "149.6 млн км",
    periodDays: 365.25, periodLabel: "365,25 суток", dayLength: "24 часа",
    moons: 1, hasMoon: true,
    fact: "Единственная известная планета с жизнью. 71% поверхности покрыто водой, а магнитное поле защищает атмосферу от солнечного ветра."
  },
  {
    key: "mars", name: "Марс", tex: "2k_mars.jpg",
    radius: 0.53, orbitRadius: 20, orbitSpeed: 0.53, rotSpeed: 0.0195, tilt: 0.44,
    diameterKm: 6779, distanceAU: 1.52, distanceKm: "227.9 млн км",
    periodDays: 687, periodLabel: "687 суток", dayLength: "24,6 часа",
    moons: 2,
    fact: "«Красная планета» обязана цветом оксиду железа в грунте. Здесь находится Olympus Mons — крупнейший вулкан в Солнечной системе высотой 21 км."
  },
  {
    key: "jupiter", name: "Юпитер", tex: "2k_jupiter.jpg",
    radius: 2.6, orbitRadius: 32, orbitSpeed: 0.084, rotSpeed: 0.09, tilt: 0.05,
    diameterKm: 139820, distanceAU: 5.2, distanceKm: "778,5 млн км",
    periodDays: 4333, periodLabel: "11,86 лет", dayLength: "9,9 часа",
    moons: 95,
    fact: "Крупнейшая планета системы — в неё поместилось бы более 1300 Земель. Большое красное пятно — гигантский шторм, бушующий не одну сотню лет."
  },
  {
    key: "saturn", name: "Сатурн", tex: "2k_saturn.jpg",
    radius: 2.25, orbitRadius: 40, orbitSpeed: 0.034, rotSpeed: 0.084, tilt: 0.47,
    diameterKm: 116460, distanceAU: 9.58, distanceKm: "1,43 млрд км",
    periodDays: 10759, periodLabel: "29,46 лет", dayLength: "10,7 часа",
    moons: 146, hasRings: true, ringTex: "2k_saturn_ring_alpha.png", ringColor: 0xcbb98f,
    fact: "Знаменитые кольца состоят из льда и камня и простираются на сотни тысяч километров, оставаясь толщиной всего около 10–20 метров."
  },
  {
    key: "uranus", name: "Уран", tex: "2k_uranus.jpg",
    radius: 1.55, orbitRadius: 47, orbitSpeed: 0.012, rotSpeed: -0.06, tilt: 1.71,
    diameterKm: 50724, distanceAU: 19.2, distanceKm: "2,87 млрд км",
    periodDays: 30687, periodLabel: "84 года", dayLength: "17,2 часа",
    moons: 28, hasRings: true, ringColor: 0x9fdce3, proceduralRing: true,
    fact: "Уран вращается «лёжа на боку» — ось наклонена почти на 98°. Вероятная причина — древнее столкновение с крупным телом."
  },
  {
    key: "neptune", name: "Нептун", tex: "2k_neptune.jpg",
    radius: 1.5, orbitRadius: 54, orbitSpeed: 0.006, rotSpeed: 0.064, tilt: 0.49,
    diameterKm: 49244, distanceAU: 30.05, distanceKm: "4,50 млрд км",
    periodDays: 60190, periodLabel: "164,8 года", dayLength: "16,1 часа",
    moons: 16,
    fact: "Самая дальняя планета системы и самая ветреная — скорость ветров достигает 2100 км/ч. Открыта в 1846 году математическими расчётами, а не наблюдением."
  },
];

const SUN = {
  name: "Солнце", tex: "2k_sun.jpg",
  diameterKm: 1392700, periodLabel: "—", dayLength: "27 земных суток (экватор)",
  fact: "Солнце содержит 99,8% массы всей Солнечной системы. Это раскалённый шар плазмы, в ядре которого термоядерный синтез превращает водород в гелий при температуре 15 млн °C."
};

const MOON = {
  name: "Луна", tex: "2k_moon.jpg", hideMoons: true,
  diameterKm: 3474, distanceAU: null, distanceKm: "384 400 км от Земли",
  periodDays: 27.3, periodLabel: "27,3 суток", dayLength: "27,3 суток (синхронное вращение)",
  moons: 0,
  fact: "Луна — единственный естественный спутник Земли. Она всегда повёрнута к нам одной стороной из-за приливного захвата, а её гравитация вызывает земные приливы."
};

const TEX_BASE = "./textures/";

/* ============================== LOADING ============================== */
const loadingManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadingManager);
const loadingText = document.querySelector("#loading p");

loadingManager.onProgress = (url, loaded, total) => {
  if (loadingText) loadingText.textContent = `Загружаем текстуры… ${Math.round((loaded / total) * 100)}%`;
};
loadingManager.onLoad = () => {
  document.getElementById("loading").classList.add("hide");
};

function loadColorTex(name) {
  const t = loader.load(TEX_BASE + name);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function loadDataTex(name) {
  return loader.load(TEX_BASE + name);
}

/* ============================== SCENE ============================== */
const container = document.getElementById("app");
const labelLayer = document.getElementById("label-layer");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(0, 42, 82);

const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 4;
controls.maxDistance = 320;
controls.target.set(0, 0, 0);

// Ambient fill so night sides aren't pure black
scene.add(new THREE.AmbientLight(0x30324a, 0.22));

// Sunlight
const sunLight = new THREE.PointLight(0xfff2d9, 5.5, 0, 0);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

/* ---------- Milky way skybox ---------- */
{
  const skyGeo = new THREE.SphereGeometry(900, 48, 32);
  const skyTex = loadColorTex("2k_stars_milky_way.jpg");
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);
}

/* ---------- Extra sparkle starfield on top of the skybox ---------- */
function makeStarfield() {
  const starCount = 2500;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = THREE.MathUtils.randFloat(260, 850);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.1, color: 0xffffff, sizeAttenuation: true,
    transparent: true, opacity: 0.85, depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}
scene.add(makeStarfield());

/* ---------- Glow sprite helper (soft radial texture) ---------- */
function makeGlowTexture(innerColor, outerColor = "rgba(0,0,0,0)") {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.4, innerColor);
  grad.addColorStop(1, outerColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/* ============================== BLOOM LAYERS ============================== */
const BLOOM_LAYER = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_LAYER);
const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const materialCache = new Map();

function enableBloom(obj) { obj.layers.enable(BLOOM_LAYER); }

/* ---------- Sun ---------- */
const sunGroup = new THREE.Group();
const sunGeo = new THREE.SphereGeometry(4.2, 48, 48);
const sunMat = new THREE.MeshBasicMaterial({ map: loadColorTex(SUN.tex) });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.userData.isSun = true;
enableBloom(sunMesh);
sunGroup.add(sunMesh);

const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: makeGlowTexture("rgba(255,214,140,0.95)"),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
}));
sunGlow.scale.set(11, 11, 1);
enableBloom(sunGlow);
sunGroup.add(sunGlow);
scene.add(sunGroup);

/* ---------- Orbit rings ---------- */
function makeOrbitRing(radius) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2);
  const points = curve.getPoints(180);
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color: 0x4a5080, transparent: true, opacity: 0.3 });
  const ring = new THREE.LineLoop(geo, mat);
  ring.rotation.x = Math.PI / 2;
  return ring;
}

/* ---------- Planetary rings (Saturn: real alpha texture · Uranus: procedural) ---------- */
function makeTexturedRing(innerR, outerR, alphaTexName, tintColor) {
  const geo = new THREE.RingGeometry(innerR, outerR, 128, 1);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const v3 = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i);
    uv.setXY(i, (v3.length() - innerR) / (outerR - innerR), 1);
  }
  const alphaMap = loadDataTex(alphaTexName);
  const mat = new THREE.MeshStandardMaterial({
    color: tintColor, alphaMap, transparent: true, side: THREE.DoubleSide,
    roughness: 1, metalness: 0, emissive: tintColor, emissiveIntensity: 0.08,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function makeProceduralRing(innerR, outerR, color) {
  const geo = new THREE.RingGeometry(innerR, outerR, 64);
  const pos = geo.attributes.position;
  const v3 = new THREE.Vector3();
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i);
    uv.setXY(i, (v3.length() - innerR) / (outerR - innerR), 1);
  }
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = 1;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, "rgba(255,255,255,0.05)");
  grad.addColorStop(0.3, "rgba(255,255,255,0.5)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.18)");
  grad.addColorStop(0.75, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, 1);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: tex, color, transparent: true, side: THREE.DoubleSide, opacity: 0.8,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

/* ---------- Translucent atmosphere shell (Venus haze / planet glow rim) ---------- */
function makeAtmosphere(radius, texName, opacity = 0.75) {
  const geo = new THREE.SphereGeometry(radius, 40, 40);
  const mat = new THREE.MeshStandardMaterial({
    map: loadColorTex(texName), transparent: true, opacity, depthWrite: false,
    roughness: 1,
  });
  return new THREE.Mesh(geo, mat);
}

function makeGlowRim(radius, colorHex, scale = 1.35) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeGlowTexture(colorHex), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0.55,
  }));
  sprite.scale.set(radius * scale * 2.4, radius * scale * 2.4, 1);
  return sprite;
}

/* ---------- Build planets ---------- */
const planetObjects = []; // { data, pivot, mesh, label, cloudMesh?, moon? }

PLANETS.forEach((p) => {
  const pivot = new THREE.Group();
  pivot.rotation.y = Math.random() * Math.PI * 2; // random start angle
  scene.add(pivot);
  scene.add(makeOrbitRing(p.orbitRadius));

  const planetAnchor = new THREE.Group();
  planetAnchor.position.set(p.orbitRadius, 0, 0);
  pivot.add(planetAnchor);

  const geo = new THREE.SphereGeometry(p.radius, 48, 48);
  const matOpts = {
    map: loadColorTex(p.tex),
    roughness: 0.92, metalness: 0.04,
  };
  if (p.normalTex) matOpts.normalMap = loadDataTex(p.normalTex);
  if (p.specularTex) {
    matOpts.roughnessMap = loadDataTex(p.specularTex);
    matOpts.roughness = 1;
  }
  const mat = new THREE.MeshStandardMaterial(matOpts);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.z = p.tilt;
  mesh.userData.planetKey = p.key;
  planetAnchor.add(mesh);

  // Earth-only: night city lights (always-on additive layer, subtle on the lit side)
  let nightMesh = null;
  if (p.nightTex) {
    const nightGeo = new THREE.SphereGeometry(p.radius * 1.002, 48, 48);
    const nightMat = new THREE.MeshBasicMaterial({
      map: loadColorTex(p.nightTex), blending: THREE.AdditiveBlending,
      transparent: true, opacity: 0.85, depthWrite: false,
    });
    nightMesh = new THREE.Mesh(nightGeo, nightMat);
    nightMesh.rotation.z = p.tilt;
    planetAnchor.add(nightMesh);
  }

  // Earth-only: cloud layer, rotates independently
  let cloudMesh = null;
  if (p.cloudsTex) {
    const cloudGeo = new THREE.SphereGeometry(p.radius * 1.012, 48, 48);
    const cloudMat = new THREE.MeshStandardMaterial({
      alphaMap: loadDataTex(p.cloudsTex), color: 0xffffff,
      transparent: true, depthWrite: false, roughness: 1,
    });
    cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    cloudMesh.rotation.z = p.tilt;
    planetAnchor.add(cloudMesh);
  }

  // Earth-only: soft blue atmospheric rim glow
  if (p.key === "earth") {
    const rim = makeGlowRim(p.radius, "rgba(120,170,255,0.55)", 1.6);
    planetAnchor.add(rim);
  }

  // Venus-only: thick cloud atmosphere shell (hides the surface, like in reality)
  if (p.atmosphereTex) {
    const atmo = makeAtmosphere(p.radius * 1.02, p.atmosphereTex, 0.9);
    planetAnchor.add(atmo);
  }

  // Rings (Saturn: textured · Uranus: procedural, tilted with the planet)
  if (p.hasRings) {
    let ring;
    if (p.proceduralRing) {
      ring = makeProceduralRing(p.radius * 1.5, p.radius * 2.1, p.ringColor);
    } else {
      ring = makeTexturedRing(p.radius * 1.3, p.radius * 2.6, p.ringTex, p.ringColor);
    }
    ring.rotation.z = p.tilt;
    mesh.add(ring);
  }

  // Earth-only: the Moon, orbiting within the planet's local frame
  let moonMesh = null, moonPivot = null;
  if (p.hasMoon) {
    moonPivot = new THREE.Group();
    moonPivot.rotation.y = Math.random() * Math.PI * 2;
    planetAnchor.add(moonPivot);
    const moonGeo = new THREE.SphereGeometry(0.27, 24, 24);
    const moonMat = new THREE.MeshStandardMaterial({ map: loadColorTex(MOON.tex), roughness: 1 });
    moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(2.1, 0, 0);
    moonMesh.userData.isMoon = true;
    moonPivot.add(moonMesh);
  }

  // Label (HTML overlay, positioned each frame)
  const label = document.createElement("div");
  label.className = "planet-label";
  label.textContent = p.name;
  labelLayer.appendChild(label);

  let moonLabel = null;
  if (moonMesh) {
    moonLabel = document.createElement("div");
    moonLabel.className = "planet-label";
    moonLabel.style.opacity = "0.7";
    moonLabel.style.fontSize = "11px";
    moonLabel.textContent = MOON.name;
    labelLayer.appendChild(moonLabel);
  }

  planetObjects.push({ data: p, pivot, planetAnchor, mesh, cloudMesh, nightMesh, label, moonMesh, moonPivot, moonLabel });
});

/* Sun label */
const sunLabel = document.createElement("div");
sunLabel.className = "planet-label";
sunLabel.textContent = SUN.name;
sunLabel.style.fontWeight = "700";
labelLayer.appendChild(sunLabel);

/* ---------- Asteroid belt (between Mars and Jupiter) ---------- */
const asteroidBelt = new THREE.Group();
{
  const count = 900;
  const rockGeo = new THREE.IcosahedronGeometry(0.06, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x8c8678, roughness: 1, metalness: 0.1 });
  const inst = new THREE.InstancedMesh(rockGeo, rockMat, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const r = THREE.MathUtils.randFloat(24, 28.5);
    const theta = Math.random() * Math.PI * 2;
    const y = THREE.MathUtils.randFloatSpread(0.8);
    dummy.position.set(Math.cos(theta) * r, y, Math.sin(theta) * r);
    const s = THREE.MathUtils.randFloat(0.4, 2.2);
    dummy.scale.setScalar(s);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
  }
  asteroidBelt.add(inst);
}
scene.add(asteroidBelt);

/* ============================== UI STATE ============================== */
let playing = true;
let speedFactor = 1;
let labelsVisible = true;

const speedSlider = document.getElementById("speed");
const speedVal = document.getElementById("speed-val");
const playBtn = document.getElementById("play-btn");
const iconPlay = document.getElementById("icon-play");
const iconPause = document.getElementById("icon-pause");
const labelsToggle = document.getElementById("labels-toggle");
const resetViewBtn = document.getElementById("reset-view");

function sliderToSpeed(v) {
  const t = v / 200;
  return Math.pow(t * 8, 1.4) || 0.0001;
}
function updateSpeedLabel() {
  const display = speedFactor < 0.05 ? "0×" : (Math.round(speedFactor * 10) / 10) + "×";
  speedVal.textContent = display;
}
speedSlider.addEventListener("input", (e) => {
  speedFactor = sliderToSpeed(Number(e.target.value));
  updateSpeedLabel();
});
speedFactor = sliderToSpeed(Number(speedSlider.value));
updateSpeedLabel();

playBtn.addEventListener("click", () => {
  playing = !playing;
  iconPlay.style.display = playing ? "none" : "block";
  iconPause.style.display = playing ? "block" : "none";
});

labelsToggle.addEventListener("click", () => {
  labelsVisible = !labelsVisible;
  labelsToggle.classList.toggle("active", labelsVisible);
});

resetViewBtn.addEventListener("click", () => {
  camera.position.set(0, 42, 82);
  controls.target.set(0, 0, 0);
  closeInfoPanel();
});

/* ============================== INFO PANEL ============================== */
const infoPanel = document.getElementById("info-panel");
const closeInfoBtn = document.getElementById("close-info");
const elSwatch = document.getElementById("planet-swatch");
const elName = document.getElementById("p-name");
const elSubtitle = document.getElementById("p-subtitle");
const elDiameter = document.getElementById("p-diameter");
const elDistance = document.getElementById("p-distance");
const elPeriod = document.getElementById("p-period");
const elDay = document.getElementById("p-day");
const elMoons = document.getElementById("p-moons");
const elFact = document.getElementById("p-fact");

function fmtNum(n) { return n.toLocaleString("ru-RU"); }

function openInfoFor(obj, swatchTexUrl) {
  const isSun = obj === SUN;
  const isMoon = obj === MOON;

  elSwatch.style.background = `center / cover url(${swatchTexUrl})`;
  elSwatch.style.setProperty("--swatch-glow", isSun ? "rgba(255,210,120,0.6)" : "rgba(140,170,255,0.4)");

  elName.textContent = obj.name;
  elSubtitle.textContent = isSun
    ? "Звезда · центр системы"
    : isMoon
      ? "Естественный спутник Земли"
      : `Планета №${PLANETS.indexOf(obj) + 1} от Солнца`;

  elDiameter.innerHTML = `${fmtNum(obj.diameterKm)} км`;

  if (isSun) {
    elDistance.parentElement.style.display = "none";
    elPeriod.parentElement.style.display = "none";
  } else {
    elDistance.parentElement.style.display = "flex";
    elPeriod.parentElement.style.display = "flex";
    elDistance.innerHTML = obj.distanceAU
      ? `${obj.distanceKm}<small>${obj.distanceAU} а.е.</small>`
      : `${obj.distanceKm}`;
    elPeriod.textContent = obj.periodLabel;
  }
  elDay.textContent = obj.dayLength;
  elMoons.parentElement.style.display = (isSun || obj.hideMoons) ? "none" : "flex";
  elMoons.textContent = (isSun || obj.hideMoons) ? "" : obj.moons;
  elFact.textContent = obj.fact;

  infoPanel.classList.add("open");
}

function closeInfoPanel() {
  infoPanel.classList.remove("open");
}

closeInfoBtn.addEventListener("click", closeInfoPanel);

/* ---------- Raycasting for clicks ---------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDownPos = null;

function onPointerDown(e) {
  const p = e.touches ? e.touches[0] : e;
  pointerDownPos = { x: p.clientX, y: p.clientY };
}
function onPointerUp(e) {
  const p = e.changedTouches ? e.changedTouches[0] : e;
  if (!pointerDownPos) return;
  const dx = p.clientX - pointerDownPos.x;
  const dy = p.clientY - pointerDownPos.y;
  if (Math.sqrt(dx * dx + dy * dy) > 6) return; // was a drag, not a click

  pointer.x = (p.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(p.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const clickable = [sunMesh, ...planetObjects.map((o) => o.mesh), ...planetObjects.filter(o => o.moonMesh).map(o => o.moonMesh)];
  const hits = raycaster.intersectObjects(clickable, false);
  if (hits.length > 0) {
    const hit = hits[0].object;
    if (hit.userData.isSun) {
      openInfoFor(SUN, TEX_BASE + SUN.tex);
    } else if (hit.userData.isMoon) {
      openInfoFor(MOON, TEX_BASE + MOON.tex);
    } else {
      const found = planetObjects.find((o) => o.mesh === hit);
      if (found) openInfoFor(found.data, TEX_BASE + found.data.tex);
    }
  }
}
renderer.domElement.addEventListener("mousedown", onPointerDown);
renderer.domElement.addEventListener("mouseup", onPointerUp);
renderer.domElement.addEventListener("touchstart", onPointerDown, { passive: true });
renderer.domElement.addEventListener("touchend", onPointerUp);

/* ============================== LABEL PROJECTION ============================== */
const tmpV = new THREE.Vector3();
function updateLabels() {
  const halfW = window.innerWidth / 2;
  const halfH = window.innerHeight / 2;

  function project(obj3d, labelEl, radius) {
    obj3d.getWorldPosition(tmpV);
    tmpV.project(camera);
    const behind = tmpV.z > 1;
    const x = tmpV.x * halfW + halfW;
    const y = -tmpV.y * halfH + halfH;
    if (behind || !labelsVisible) {
      labelEl.style.display = "none";
    } else {
      labelEl.style.display = "block";
      labelEl.style.left = x + "px";
      labelEl.style.top = (y - radius * 4) + "px";
    }
  }

  project(sunMesh, sunLabel, 10);
  planetObjects.forEach((o) => {
    project(o.mesh, o.label, o.data.radius * 30 + 10);
    if (o.moonMesh) project(o.moonMesh, o.moonLabel, 14);
  });
}

/* ============================== POSTPROCESSING (selective bloom) ============================== */
const renderPass = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.85, // strength
  0.35, // radius
  0.15  // threshold
);

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderPass);
bloomComposer.addPass(bloomPass);

const mixPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D baseTexture;
      uniform sampler2D bloomTexture;
      varying vec2 vUv;
      void main() {
        vec4 base = texture2D(baseTexture, vUv);
        vec4 bloom = texture2D(bloomTexture, vUv);
        gl_FragColor = base + bloom;
      }
    `,
  }),
  "baseTexture"
);
mixPass.needsSwap = true;

const outputPass = new OutputPass();

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderPass);
finalComposer.addPass(mixPass);
finalComposer.addPass(outputPass);

function darkenNonBloomed(obj) {
  if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
    materialCache.set(obj.uuid, obj.material);
    obj.material = darkMaterial;
  } else if (obj.isSprite && bloomLayer.test(obj.layers) === false) {
    materialCache.set(obj.uuid, obj.material);
    obj.visible = false;
  }
}
function restoreMaterial(obj) {
  if (materialCache.has(obj.uuid)) {
    obj.material = materialCache.get(obj.uuid);
    materialCache.delete(obj.uuid);
    obj.visible = true;
  }
}

/* ============================== ANIMATE ============================== */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (playing) {
    const t = dt * speedFactor;
    planetObjects.forEach((o) => {
      o.pivot.rotation.y += o.data.orbitSpeed * t * 0.25;
      o.mesh.rotation.y += o.data.rotSpeed * t * 10;
      if (o.cloudMesh) o.cloudMesh.rotation.y += o.data.rotSpeed * t * 7;
      if (o.nightMesh) o.nightMesh.rotation.y = o.mesh.rotation.y;
      if (o.moonPivot) o.moonPivot.rotation.y += t * 1.4;
    });
    sunMesh.rotation.y += 0.0008 * dt * 60;
    asteroidBelt.rotation.y += 0.0015 * t;
  }

  controls.update();
  updateLabels();

  scene.traverse(darkenNonBloomed);
  bloomComposer.render();
  scene.traverse(restoreMaterial);
  finalComposer.render();
}

/* ---------- Resize ---------- */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
  finalComposer.setSize(window.innerWidth, window.innerHeight);
  bloomPass.setSize(window.innerWidth, window.innerHeight);
});

/* ---------- Kick off ---------- */
animate();
