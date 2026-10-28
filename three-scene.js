import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function applyFallback() {
  document.body.classList.add('no-webgl');
  const titles = document.querySelector('.star-titles');
  if (titles) titles.classList.add('is-fallback');
}

function webglSupported() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

const isMobile = window.matchMedia('(pointer: coarse)').matches;

if (isMobile) {
  // Móvil: se omite WebGL; la navegación usa imágenes (HTML/CSS).
  document.body.classList.add('is-mobile');
} else if (!webglSupported()) {
  applyFallback();
} else {
  try {
    initScene();
  } catch (err) {
    console.error('Error inicializando la escena 3D', err);
    applyFallback();
  }
}

function initScene() {

const container = document.getElementById('three-container');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
container.appendChild(renderer.domElement);

// --- Escena principal ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// --- Entorno reflectivo (opcional: si falla, las estrellas se ven mate) ---
let envOk = true;

try {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  function setEnvironment(tex) {
    const envMap = pmrem.fromEquirectangular(tex).texture;
    scene.environment = envMap;
    scene.environmentIntensity = 1.0;
  }

  const gradient = document.createElement('canvas');
  gradient.width = 512;
  gradient.height = 256;
  const ctx = gradient.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#ff6ec7');
  grad.addColorStop(0.2, '#ffb56b');
  grad.addColorStop(0.4, '#fff3a0');
  grad.addColorStop(0.6, '#6be4ff');
  grad.addColorStop(0.8, '#8f9bff');
  grad.addColorStop(1, '#ff6ec7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);
  const fallbackTex = new THREE.CanvasTexture(gradient);
  fallbackTex.mapping = THREE.EquirectangularReflectionMapping;
  fallbackTex.colorSpace = THREE.SRGBColorSpace;
  setEnvironment(fallbackTex);
} catch (err) {
  console.warn('Entorno reflectivo no disponible, usando material mate', err);
  envOk = false;
}

// --- Luces (escenografía) ---
const ambient = new THREE.AmbientLight(0xffe6d6, 0.4);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xfff1e0, 2.2);
keyLight.position.set(5, 4, 7);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xbfc8ff, 1.6);
rimLight.position.set(-5, -1, 4);
scene.add(rimLight);

// Luz soñadora que orbita lento (color rosa/lila cambiante)
const dreamLight = new THREE.PointLight(0xff9ecf, 3, 30, 2);
dreamLight.position.set(0, 1, 3);
scene.add(dreamLight);

// --- Estrellas metálicas (3 instancias de star.glb) ---
const starColors = ['#e3b3bb', '#a9c3ce', '#b3c4a8', '#cbb8d6', '#f0c9a0'];
const starBaseRot = [0.18, -0.14, 0.22, 0.08, -0.22];
const starBaseRotY = [0.35, -0.5, 0.6, -0.2, 0.15];
const starScrollSpeed = [0.5, 1.0, 1.6, 1.3, 0.8];
const starBaseY = [0.28, -0.2, 0.12, 0.0, 0.2];
const starScale = [1.0, 0.84, 0.96, 0.88, 0.8];

const stars = [];
const labelEls = Array.from(document.querySelectorAll('.scene-star-label'));
let starMaxDim = 1;
let starCenter = new THREE.Vector3();

const gltfLoader = new GLTFLoader();
gltfLoader.load('star.glb', (gltf) => {
  const base = gltf.scene;
  const box = new THREE.Box3().setFromObject(base);
  starCenter = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  starMaxDim = Math.max(size.x, size.y, size.z) || 1;

  starColors.forEach((hex, i) => {
    const mesh = base.clone(true);

    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(hex),
      metalness: envOk ? 1 : 0.25,
      roughness: envOk ? 0.28 : 0.65,
      clearcoat: envOk ? 0.2 : 0,
      clearcoatRoughness: 0.4,
      envMapIntensity: 1.0,
    });

    mesh.traverse((o) => {
      if (o.isMesh) o.material = material;
    });
    mesh.position.sub(starCenter);

    const group = new THREE.Group();
    group.add(mesh);
    group.rotation.z = starBaseRot[i];
    group.rotation.y = starBaseRotY[i];
    scene.add(group);

    stars.push({
      group,
      baseX: 0,
      baseY: starBaseY[i],
      baseRot: starBaseRot[i],
      baseRotY: starBaseRotY[i],
      scrollSpeed: starScrollSpeed[i],
      labelOffset: 0,
      tiltX: 0,
      tiltY: 0,
      idlePhase: i * (Math.PI * 2 / 3),
      idleSpeed: 0.8 + i * 0.3,
    });
  });

  layoutStars();
}, undefined, (error) => {
  console.error('Error cargando star.glb', error);
  applyFallback();
});

setTimeout(() => {
  if (!stars.length) {
    console.warn('Timeout cargando star.glb');
    applyFallback();
  }
}, 6000);

function layoutStars() {
  if (!stars.length) return;

  const aspect = window.innerWidth / window.innerHeight;
  const halfAngle = THREE.MathUtils.degToRad(camera.fov / 2);
  const visHeight = 2 * camera.position.z * Math.tan(halfAngle);
  const visWidth = visHeight * aspect;

  const narrow = window.innerWidth < 640;
  const targetSize = narrow ? 0.48 : 0.85;
  const scale = targetSize / starMaxDim;

  // Distribución orgánica, centrada (constelación suelta)
  const positions = narrow
    ? [
        { x: -visWidth * 0.22, y: 0.55 },
        { x: 0, y: 0.85 },
        { x: visWidth * 0.22, y: 0.5 },
        { x: -visWidth * 0.15, y: -0.55 },
        { x: visWidth * 0.18, y: -0.6 },
      ]
    : [
        { x: -1.4, y: 0.35 },
        { x: 0, y: 0.85 },
        { x: 1.35, y: 0.45 },
        { x: -0.75, y: -0.65 },
        { x: 0.85, y: -0.75 },
      ];

  stars.forEach((s, i) => {
    const p = positions[i] || { x: 0, y: 0 };
    const sScale = starScale[i] ?? 1;
    s.baseX = p.x;
    s.baseY = p.y;
    s.group.scale.setScalar(scale * sScale);
    s.group.position.set(s.baseX, s.baseY, 0);
    s.labelOffset = targetSize * sScale * 0.58;
  });
}

// --- Loop ---
const clock = new THREE.Clock();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const cursorPoint = new THREE.Vector3();
const spherePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const projectV = new THREE.Vector3();

window.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

let scrollRot = 0;
let targetScrollRot = 0;

window.addEventListener('wheel', (e) => {
  targetScrollRot += e.deltaY * 0.002;
}, { passive: true });

let hoveredIndex = -1;

function animate() {
  requestAnimationFrame(animate);

  if (prefersReducedMotion) {
    const elapsed = clock.getElapsedTime();
    stars.forEach((s) => {
      const idleRot = Math.sin(elapsed * s.idleSpeed + s.idlePhase) * 0.12;
      const idleBob = Math.sin(elapsed * s.idleSpeed * 0.8 + s.idlePhase) * 0.05;
      s.group.rotation.z = s.baseRot + idleRot;
      s.group.rotation.y = s.baseRotY + elapsed * s.idleSpeed;
      s.group.position.y = s.baseY + idleBob;
    });
    renderer.render(scene, camera);
    return;
  }

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Rotación por scroll: cada estrella gira a su propia velocidad
  scrollRot += (targetScrollRot - scrollRot) * 0.1;
  stars.forEach((s) => {
    const idleRot = Math.sin(elapsed * s.idleSpeed + s.idlePhase) * 0.12;
    const idleBob = Math.sin(elapsed * s.idleSpeed * 0.8 + s.idlePhase) * 0.05;
    s.group.rotation.z = s.baseRot + idleRot + scrollRot * s.scrollSpeed;
    s.group.position.y = s.baseY + idleBob;
  });

  // Luz soñadora orbitando con color cambiante
  dreamLight.position.set(
    Math.cos(elapsed * 0.5) * 3.2,
    Math.sin(elapsed * 0.4) * 2.2,
    Math.sin(elapsed * 0.5) * 2.5
  );
  dreamLight.color.setHSL(0.82 + Math.sin(elapsed * 0.25) * 0.08, 0.7, 0.7);
  dreamLight.intensity = 3 + Math.sin(elapsed * 0.8) * 0.8;

  // Entorno "respira" (más envolvente)
  scene.environmentIntensity = 1.0 + Math.sin(elapsed * 0.5) * 0.25;

  // Punto del cursor sobre el plano de la escena (para inclinar las estrellas)
  raycaster.setFromCamera(pointer, camera);
  raycaster.ray.intersectPlane(spherePlane, cursorPoint);

  // Las estrellas se inclinan suavemente hacia el cursor (sin moverse de sitio)
  stars.forEach((s) => {
    const dx = cursorPoint.x - s.group.position.x;
    const dy = cursorPoint.y - s.group.position.y;
    const targetTiltX = THREE.MathUtils.clamp(-dy * 0.3, -0.55, 0.55);
    const targetTiltY = THREE.MathUtils.clamp(dx * 0.3, -0.55, 0.55);
    s.tiltX += (targetTiltX - s.tiltX) * Math.min(delta * 6, 1);
    s.tiltY += (targetTiltY - s.tiltY) * Math.min(delta * 6, 1);
    const idleSpin = elapsed * s.idleSpeed;
    s.group.rotation.x = s.tiltX;
    s.group.rotation.y = s.baseRotY + s.tiltY + idleSpin;
  });

  // Hover: subraya la etiqueta de la estrella bajo el cursor (solo desktop)
  let hoverIdx = -1;
  for (let i = 0; i < stars.length; i++) {
    if (raycaster.intersectObject(stars[i].group, true).length) {
      hoverIdx = i;
      break;
    }
  }
  if (hoverIdx !== hoveredIndex) {
    hoveredIndex = hoverIdx;
    labelEls.forEach((el, i) => el.classList.toggle('is-hovered', i === hoverIdx));
  }

  // Etiquetas debajo de cada estrella (siguen su posición en pantalla)
  stars.forEach((s, i) => {
    if (!labelEls[i]) return;
    projectV.set(s.group.position.x, s.group.position.y - s.labelOffset, 0);
    projectV.project(camera);
    const x = (projectV.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projectV.y * 0.5 + 0.5) * window.innerHeight;
    labelEls[i].style.left = `${x}px`;
    labelEls[i].style.top = `${y}px`;
  });

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  layoutStars();
});

}
