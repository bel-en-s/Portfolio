import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('three-container');

const isMobile = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
container.appendChild(renderer.domElement);

// --- Fondo: gradiente animado (shader full-screen) ---
const bgScene = new THREE.Scene();
const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// --- Escena principal ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const uniforms = {
  uTime: { value: 0 },
  uOpacity: { value: 0 },
  uCeleste: { value: 0 },
};

const bgAudio = document.getElementById('bg-audio');
let targetCeleste = 0;

function syncCeleste() {
  targetCeleste = bgAudio && !bgAudio.paused ? 1 : 0;
}

if (bgAudio) {
  bgAudio.addEventListener('play', syncCeleste);
  bgAudio.addEventListener('pause', syncCeleste);
  syncCeleste();
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uCeleste;

  void main() {
    float t = uTime;
    vec2 p = vUv;

    vec2 c = vec2(0.5, 0.42) + vec2(sin(t * 0.45) * 0.06, cos(t * 0.35) * 0.05);

    vec2 q = p - c;
    float d = length(q);
    float a = atan(q.y, q.x);

    float swirl = sin(a * 4.0 - t * 0.6);

    float nd = d / 0.85;

    float core = pow(smoothstep(1.0, 0.0, nd), 1.5);

    float flow = sin(d * 22.0 - t * 1.2 + swirl * 0.6);

    vec3 warm = mix(vec3(1.0, 0.85, 0.66), vec3(0.68, 0.84, 0.92), uCeleste);
    vec3 lila = vec3(0.78, 0.70, 0.90);
    vec3 celeste = vec3(0.68, 0.84, 0.92);

    vec3 color = warm;

    float lilaAmt = smoothstep(1.1, 0.3, nd) * 0.5;
    color = mix(color, lila, lilaAmt * (0.5 + 0.5 * flow));

    float celAmt = smoothstep(1.0, 0.55, nd) * smoothstep(0.15, 0.7, nd) * 0.7;
    color = mix(color, celeste, celAmt * (0.5 - 0.5 * flow));

    color = mix(color, celeste, uCeleste * 0.22);

    float ripple = sin(d * 14.0 - t * 0.9) * 0.5 + 0.5;
    float breathe = 0.9 + 0.1 * sin(t * 0.5);
    float intensity = (core + ripple * 0.25 * smoothstep(1.2, 0.0, nd)) * breathe;

    float alpha = intensity * uOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`;

const bgMaterial = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  depthWrite: false,
  depthTest: false,
  vertexShader,
  fragmentShader,
});

const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial);
quad.frustumCulled = false;
bgScene.add(quad);

// --- Entorno reflectivo ---
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

// Luz que sigue el mouse: suave y difuminada
const cursorLight = new THREE.PointLight(0xffffff, 5, 16, 1.8);
cursorLight.position.set(0, 0, 2);
scene.add(cursorLight);

// Glow suave (bloom) que acompaña la luz del cursor
function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const rad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  rad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  rad.addColorStop(0.35, 'rgba(255, 250, 244, 0.18)');
  rad.addColorStop(1, 'rgba(255, 252, 248, 0)');
  g.fillStyle = rad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
  map: makeGlowTexture(),
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  depthTest: false,
  transparent: true,
  opacity: 0.25,
}));
glowSprite.scale.setScalar(3.2);
scene.add(glowSprite);

// --- Estrellas metálicas (4 instancias de star.glb) ---
const starColors = ['#e3b3bb', '#a9c3ce', '#b3c4a8', '#d4bf9a'];
const starBaseRot = [0.18, -0.14, 0.22, -0.2];
const starBaseRotY = [0.35, -0.5, 0.6, -0.25];
const starScrollSpeed = [0.5, 1.0, 1.6, 2.2];
const starBaseY = [0.28, -0.2, 0.12, -0.28];
const starParallaxX = [0.08, -0.16, 0.24, -0.12];
const starParallaxY = [0.12, -0.07, 0.18, -0.14];

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
      metalness: 1,
      roughness: 0.28,
      clearcoat: 0.2,
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
      px: starParallaxX[i],
      py: starParallaxY[i],
      labelOffset: 0,
    });
  });

  layoutStars();
}, undefined, (error) => {
  console.error('Error cargando star.glb', error);
});

function layoutStars() {
  if (!stars.length) return;

  const aspect = window.innerWidth / window.innerHeight;
  const halfAngle = THREE.MathUtils.degToRad(camera.fov / 2);
  const visHeight = 2 * camera.position.z * Math.tan(halfAngle);
  const visWidth = visHeight * aspect;

  const narrow = window.innerWidth < 640;
  const targetSize = narrow ? 0.48 : 0.85;
  const scale = targetSize / starMaxDim;

  stars.forEach((s, i) => {
    if (narrow) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = (col - 0.5) * (visWidth * 0.44);
      const y = row === 0 ? 0.62 : -0.62;
      s.baseX = x;
      s.baseY = y;
    } else {
      const gap = 1.35;
      const x = (i - (stars.length - 1) / 2) * gap;
      s.baseX = x;
      s.baseY = starBaseY[i];
    }
    s.group.scale.setScalar(scale);
    s.group.position.set(s.baseX, s.baseY, 0);
    s.labelOffset = targetSize * 0.58;
  });
}

// --- Loop ---
const clock = new THREE.Clock();
const startTime = performance.now();
const introDuration = 2000;

const baseSpeed = 1;
const maxSpeed = 4;
let targetSpeed = baseSpeed;
let speed = baseSpeed;

let lastX = 0;
let lastY = 0;
let lastMoveTime = 0;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const cursorPoint = new THREE.Vector3();
const spherePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const projectV = new THREE.Vector3();

window.addEventListener('pointermove', (e) => {
  const now = performance.now();
  const dt = Math.max(now - lastMoveTime, 16);
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  lastMoveTime = now;

  const velocity = Math.hypot(dx, dy) / dt;
  targetSpeed = Math.min(baseSpeed + velocity * 1.6, maxSpeed);

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

let scrollRot = 0;
let targetScrollRot = 0;

window.addEventListener('wheel', (e) => {
  targetScrollRot += e.deltaY * 0.002;
}, { passive: true });

// Click en una estrella → navegar a su página
const starPages = ['bio.html', 'musica.html', 'visual-art.html', 'https://divinodivino.com.ar/work.html'];
const clickNDC = new THREE.Vector2();

window.addEventListener('click', (e) => {
  if (!stars.length) return;
  clickNDC.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(clickNDC, camera);
  for (let i = 0; i < stars.length; i++) {
    const hits = raycaster.intersectObject(stars[i].group, true);
    if (hits.length) {
      const url = starPages[i];
      if (url.startsWith('http')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = url;
      }
      return;
    }
  }
});

// Solo desktop: al pasar el mouse sobre un h3 se reactiva la animación
let hoverBoost = 0;

if (!isMobile) {
  document.querySelectorAll('.header h3').forEach((h3) => {
    h3.addEventListener('mouseenter', () => { hoverBoost = 1; });
    h3.addEventListener('mouseleave', () => { hoverBoost = 0; });
  });
}

renderer.autoClear = false;

function animate() {
  if (!prefersReducedMotion) requestAnimationFrame(animate);

  if (prefersReducedMotion) {
    uniforms.uOpacity.value = 1;
    renderer.clear();
    renderer.render(bgScene, bgCamera);
    renderer.render(scene, camera);
    return;
  }

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  if (hoverBoost) {
    targetSpeed = maxSpeed;
  } else {
    targetSpeed += (baseSpeed - targetSpeed) * Math.min(delta * 1.5, 1);
  }
  speed += (targetSpeed - speed) * Math.min(delta * 8, 1);

  uniforms.uTime.value += delta * speed;
  uniforms.uCeleste.value += (targetCeleste - uniforms.uCeleste.value) * Math.min(delta * 2, 1);

  const introT = Math.min((performance.now() - startTime) / introDuration, 1);
  const eased = 1 - Math.pow(1 - introT, 4);
  uniforms.uOpacity.value = eased;

  // Rotación por scroll: cada estrella gira a su propia velocidad
  scrollRot += (targetScrollRot - scrollRot) * 0.1;
  stars.forEach((s) => {
    s.group.rotation.z = s.baseRot + scrollRot * s.scrollSpeed;
  });

  // Parallax por estrella: cada una se mueve desde un pivot distinto (suave)
  stars.forEach((s) => {
    const tx = s.baseX + pointer.x * s.px;
    const ty = s.baseY + pointer.y * s.py;
    s.group.position.x += (tx - s.group.position.x) * 0.06;
    s.group.position.y += (ty - s.group.position.y) * 0.06;
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

  // Parallax de cámara con el mouse (cinemático, sutil)
  camera.position.x += (pointer.x * 0.1 - camera.position.x) * 0.05;
  camera.position.y += (-pointer.y * 0.08 - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();

  // La luz del cursor sigue el mouse sobre la escena
  raycaster.setFromCamera(pointer, camera);
  if (raycaster.ray.intersectPlane(spherePlane, cursorPoint)) {
    cursorLight.position.x += (cursorPoint.x - cursorLight.position.x) * 0.12;
    cursorLight.position.y += (cursorPoint.y - cursorLight.position.y) * 0.12;
  }
  cursorLight.position.z = 2;
  glowSprite.position.set(cursorLight.position.x, cursorLight.position.y, 1.4);

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

  renderer.clear();
  renderer.render(bgScene, bgCamera);
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  layoutStars();
  if (prefersReducedMotion) animate();
});
