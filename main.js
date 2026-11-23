import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ============================== DATA ============================== */
// Visual radii/orbits are artistically compressed so the whole system
// reads clearly on screen; real-world numbers are shown in the info panel.
const PLANETS = [
  {
    key: "mercury", name: "Меркурий", color: 0x9c9388, emissive: 0x3a362f,
    radius: 0.38, orbitRadius: 9, orbitSpeed: 4.15, rotSpeed: 0.004, tilt: 0.001,
    diameterKm: 4879, distanceAU: 0.39, distanceKm: "57.9 млн км",
    periodDays: 88, periodLabel: "88 суток", dayLength: "58.6 земных суток",
    moons: 0,
    fact: "Меркурий — самая маленькая планета и ближайшая к Солнцу. Перепады температуры на нём — одни из самых резких в системе: от +430°C днём до −180°C ночью."
  },
  {
    key: "venus", name: "Венера", color: 0xe8c789, emissive: 0x4a3a1a,
    radius: 0.95, orbitRadius: 12.5, orbitSpeed: 1.62, rotSpeed: -0.0009, tilt: 3.1,
    diameterKm: 12104, distanceAU: 0.72, distanceKm: "108.2 млн км",
    periodDays: 225, periodLabel: "225 суток", dayLength: "243 земных суток",
    moons: 0,
    fact: "Венера вращается в обратную сторону и медленнее, чем облетает Солнце — её сутки длиннее её года. Плотная атмосфера CO₂ создаёт парниковый эффект до +465°C."
  },
  {
    key: "earth", name: "Земля", color: 0x3a7bd5, emissive: 0x0b2b4a,
    radius: 1.0, orbitRadius: 16, orbitSpeed: 1.0, rotSpeed: 0.02, tilt: 0.41,
    diameterKm: 12742, distanceAU: 1.0, distanceKm: "149.6 млн км",
    periodDays: 365.25, periodLabel: "365,25 суток", dayLength: "24 часа",
    moons: 1,
    fact: "Единственная известная планета с жизнью. 71% поверхности покрыто водой, а магнитное поле защищает атмосферу от солнечного ветра."
  },
  {
    key: "mars", name: "Марс", color: 0xc1440e, emissive: 0x3a1104,
    radius: 0.53, orbitRadius: 20, orbitSpeed: 0.53, rotSpeed: 0.0195, tilt: 0.44,
    diameterKm: 6779, distanceAU: 1.52, distanceKm: "227.9 млн км",
    periodDays: 687, periodLabel: "687 суток", dayLength: "24,6 часа",
    moons: 2,
    fact: "«Красная планета» обязана цветом оксиду железа в грунте. Здесь находится Olympus Mons — крупнейший вулкан в Солнечной системе высотой 21 км."
  },
  {
    key: "jupiter", name: "Юпитер", color: 0xd9b48f, emissive: 0x4a3a28,
    radius: 2.6, orbitRadius: 28, orbitSpeed: 0.084, rotSpeed: 0.045, tilt: 0.05,
    diameterKm: 139820, distanceAU: 5.2, distanceKm: "778,5 млн км",
    periodDays: 4333, periodLabel: "11,86 лет", dayLength: "9,9 часа",
    moons: 95,
    fact: "Крупнейшая планета системы — в неё поместилось бы более 1300 Земель. Большое красное пятно — гигантский шторм, бушующий не одну сотню лет."
  },
  {
    key: "saturn", name: "Сатурн", color: 0xe3cf9c, emissive: 0x4a3f28,
    radius: 2.25, orbitRadius: 36, orbitSpeed: 0.034, rotSpeed: 0.042, tilt: 0.47,
    diameterKm: 116460, distanceAU: 9.58, distanceKm: "1,43 млрд км",
    periodDays: 10759, periodLabel: "29,46 лет", dayLength: "10,7 часа",
    moons: 146, hasRings: true,
    fact: "Знаменитые кольца состоят из льда и камня и простираются на сотни тысяч километров, оставаясь толщиной всего около 10–20 метров."
  },
  {
    key: "uranus", name: "Уран", color: 0x9fdce3, emissive: 0x1f3a3d,
    radius: 1.55, orbitRadius: 44, orbitSpeed: 0.012, rotSpeed: -0.03, tilt: 1.71,
    diameterKm: 50724, distanceAU: 19.2, distanceKm: "2,87 млрд км",
    periodDays: 30687, periodLabel: "84 года", dayLength: "17,2 часа",
    moons: 28, hasRings: true,
    fact: "Уран вращается «лёжа на боку» — ось наклонена почти на 98°. Вероятная причина — древнее столкновение с крупным телом."
  },
  {
    key: "neptune", name: "Нептун", color: 0x4c6fe3, emissive: 0x16215e,
    radius: 1.5, orbitRadius: 52, orbitSpeed: 0.006, rotSpeed: 0.032, tilt: 0.49,
    diameterKm: 49244, distanceAU: 30.05, distanceKm: "4,50 млрд км",
    periodDays: 60190, periodLabel: "164,8 года", dayLength: "16,1 часа",
    moons: 16,
    fact: "Самая дальняя планета системы и самая ветреная — скорость ветров достигает 2100 км/ч. Открыта в 1846 году математическими расчётами, а не наблюдением."
  },
];

const SUN = {
  name: "Солнце", color: 0xffd36b,
  diameterKm: 1392700, periodLabel: "—", dayLength: "27 земных суток (экватор)",
  fact: "Солнце содержит 99,8% массы всей Солнечной системы. Это раскалённый шар плазмы, в ядре которого термоядерный синтез превращает водород в гелий при температуре 15 млн °C."
};

/* ============================== SCENE ============================== */
const container = document.getElementById("app");
const labelLayer = document.getElementById("label-layer");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 38, 72);

const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 4;
controls.maxDistance = 220;
controls.target.set(0, 0, 0);

// Ambient fill so night sides aren't pure black
scene.add(new THREE.AmbientLight(0x30324a, 0.55));

// Sunlight
const sunLight = new THREE.PointLight(0xffffff, 3.2, 0, 0);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

/* ---------- Starfield ---------- */
function makeStarfield() {
  const starCount = 6000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const palette = [
    [1, 1, 1], [0.75, 0.85, 1], [1, 0.92, 0.78],
  ];
  for (let i = 0; i < starCount; i++) {
    const r = THREE.MathUtils.randFloat(260, 900);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    const c = palette[Math.floor(Math.random() * palette.length)];
    const brightness = THREE.MathUtils.randFloat(0.4, 1);
    colors[i * 3] = c[0] * brightness;
    colors[i * 3 + 1] = c[1] * brightness;
    colors[i * 3 + 2] = c[2] * brightness;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.3, vertexColors: true, sizeAttenuation: true,
    transparent: true, opacity: 0.9, depthWrite: false,
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
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/* ---------- Sun ---------- */
const sunGroup = new THREE.Group();
const sunGeo = new THREE.SphereGeometry(4.2, 48, 48);
const sunMat = new THREE.MeshBasicMaterial({ color: SUN.color });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.userData.isSun = true;
sunGroup.add(sunMesh);

const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: makeGlowTexture("rgba(255,210,120,0.9)"),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
}));
sunGlow.scale.set(22, 22, 1);
sunGroup.add(sunGlow);
scene.add(sunGroup);

/* ---------- Orbit rings ---------- */
function makeOrbitRing(radius) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2);
  const points = curve.getPoints(180);
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color: 0x4a5080, transparent: true, opacity: 0.35 });
  const ring = new THREE.LineLoop(geo, mat);
  ring.rotation.x = Math.PI / 2;
  return ring;
}

/* ---------- Saturn / Uranus rings ---------- */
function makeRings(innerR, outerR, color) {
  const geo = new THREE.RingGeometry(innerR, outerR, 64);
  // UV fix so the gradient texture maps radially, not per-triangle
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
  grad.addColorStop(0.3, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.2)");
  grad.addColorStop(0.75, "rgba(255,255,255,0.6)");
  grad.addColorStop(1, "rgba(255,255,255,0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, 1);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: tex, color, transparent: true, side: THREE.DoubleSide, opacity: 0.85,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

/* ---------- Build planets ---------- */
const planetObjects = []; // { data, pivot, mesh, label, angle }

PLANETS.forEach((p) => {
  const pivot = new THREE.Group();
  pivot.rotation.y = Math.random() * Math.PI * 2; // random start angle
  scene.add(pivot);
  scene.add(makeOrbitRing(p.orbitRadius));

  const geo = new THREE.SphereGeometry(p.radius, 40, 40);
  const mat = new THREE.MeshStandardMaterial({
    color: p.color, emissive: p.emissive, emissiveIntensity: 0.25,
    roughness: 0.85, metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(p.orbitRadius, 0, 0);
  mesh.rotation.z = p.tilt;
  mesh.userData.planetKey = p.key;
  pivot.add(mesh);

  if (p.hasRings) {
    const ring = makeRings(p.radius * 1.4, p.radius * 2.3, p.color);
    ring.rotation.z = p.tilt;
    mesh.add(ring);
  }

  // Label (HTML overlay, positioned each frame)
  const label = document.createElement("div");
  label.className = "planet-label";
  label.textContent = p.name;
  labelLayer.appendChild(label);

  planetObjects.push({ data: p, pivot, mesh, label });
});

/* Sun label */
const sunLabel = document.createElement("div");
sunLabel.className = "planet-label";
sunLabel.textContent = SUN.name;
sunLabel.style.fontWeight = "700";
labelLayer.appendChild(sunLabel);

/* ============================== UI STATE ============================== */
let playing = true;
let speedFactor = 1; // multiplier applied to each planet's base orbitSpeed
let labelsVisible = true;
let selectedKey = null;

const speedSlider = document.getElementById("speed");
const speedVal = document.getElementById("speed-val");
const playBtn = document.getElementById("play-btn");
const iconPlay = document.getElementById("icon-play");
const iconPause = document.getElementById("icon-pause");
const labelsToggle = document.getElementById("labels-toggle");
const resetViewBtn = document.getElementById("reset-view");

function sliderToSpeed(v) {
  // 0..200 -> 0x..8x, non-linear for finer control near 1x
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
  camera.position.set(0, 38, 72);
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

function fmtNum(n) {
  return n.toLocaleString("ru-RU");
}

function openInfoFor(obj) {
  const isSun = obj === SUN;
  selectedKey = isSun ? "sun" : obj.key;
  const colorHex = "#" + (isSun ? SUN.color : obj.color).toString(16).padStart(6, "0");

  elSwatch.style.background = isSun
    ? `radial-gradient(circle at 35% 30%, #fff6d8, ${colorHex})`
    : `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), ${colorHex})`;
  elSwatch.style.setProperty("--swatch-glow", colorHex + "88");

  elName.textContent = obj.name;
  elSubtitle.textContent = isSun ? "Звезда · центр системы" : `Планета №${PLANETS.indexOf(obj) + 1} от Солнца`;

  elDiameter.innerHTML = `${fmtNum(obj.diameterKm)} км`;
  if (isSun) {
    elDistance.parentElement.style.display = "none";
    elPeriod.parentElement.style.display = "none";
  } else {
    elDistance.parentElement.style.display = "flex";
    elPeriod.parentElement.style.display = "flex";
    elDistance.innerHTML = `${obj.distanceKm}<small>${obj.distanceAU} а.е.</small>`;
    elPeriod.textContent = obj.periodLabel;
  }
  elDay.textContent = obj.dayLength;
  elMoons.parentElement.style.display = isSun ? "none" : "flex";
  elMoons.textContent = isSun ? "" : obj.moons;
  elFact.textContent = obj.fact;

  infoPanel.classList.add("open");
}

function closeInfoPanel() {
  infoPanel.classList.remove("open");
  selectedKey = null;
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

  const clickable = [sunMesh, ...planetObjects.map((o) => o.mesh)];
  const hits = raycaster.intersectObjects(clickable, false);
  if (hits.length > 0) {
    const hit = hits[0].object;
    if (hit.userData.isSun) {
      openInfoFor(SUN);
    } else {
      const found = planetObjects.find((o) => o.mesh === hit);
      if (found) openInfoFor(found.data);
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
  planetObjects.forEach((o) => project(o.mesh, o.label, o.data.radius * 30 + 10));
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
    });
    sunMesh.rotation.y += 0.0008 * dt * 60;
  }

  controls.update();
  updateLabels();
  renderer.render(scene, camera);
}

/* ---------- Resize ---------- */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------- Kick off ---------- */
requestAnimationFrame(() => {
  document.getElementById("loading").classList.add("hide");
});
animate();
