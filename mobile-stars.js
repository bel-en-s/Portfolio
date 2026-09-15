import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const nav = document.querySelector('.mobile-stars');
const isTouch = window.matchMedia('(pointer: coarse)').matches;

function webglSupported() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

if (nav && isTouch && webglSupported()) {
  init();
}

function makeGradientEnv(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#ff6ec7');
  grad.addColorStop(0.2, '#ffb56b');
  grad.addColorStop(0.4, '#fff3a0');
  grad.addColorStop(0.6, '#6be4ff');
  grad.addColorStop(0.8, '#8f9bff');
  grad.addColorStop(1, '#ff6ec7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  scene.environment = pmrem.fromEquirectangular(tex).texture;
  scene.environmentIntensity = 1.0;
  pmrem.dispose();
}

function init() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const starLinks = Array.from(nav.querySelectorAll('.mobile-star'));
  const colors = ['#e3b3bb', '#a9c3ce', '#b3c4a8'];
  const baseRot = [0.18, -0.14, 0.22];
  const baseRotY = [0.35, -0.5, 0.6];
  const fitScale = 2.35;

  const viewports = starLinks.map((link, i) => {
    const view = link.querySelector('.mobile-star-view');
    if (!view) return null;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    const canvas = renderer.domElement;
    canvas.style.touchAction = 'none';
    view.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffe6d6, 0.4));

    const key = new THREE.DirectionalLight(0xfff1e0, 2.2);
    key.position.set(5, 4, 7);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xbfc8ff, 1.6);
    rim.position.set(-5, -1, 4);
    scene.add(rim);

    const dream = new THREE.PointLight(0xff9ecf, 3, 30, 2);
    dream.position.set(0, 1, 3);
    scene.add(dream);

    let envOk = true;
    try {
      makeGradientEnv(renderer, scene);
    } catch (err) {
      console.warn('Entorno reflectivo no disponible en móvil', err);
      envOk = false;
    }

    return {
      link,
      view,
      renderer,
      scene,
      camera,
      color: colors[i],
      envOk,
      group: null,
      dragging: false,
      moved: 0,
      lastX: 0,
      lastY: 0,
      velX: 0,
      velY: 0,
      lastMoveTime: 0,
      baseRotY: baseRotY[i],
      baseRotZ: baseRot[i],
      idleSpeed: 0.8 + i * 0.3,
    };
  }).filter(Boolean);

  function resize() {
    for (const vp of viewports) {
      const w = vp.view.clientWidth || 128;
      const h = vp.view.clientHeight || 128;
      vp.renderer.setSize(w, h, false);
      vp.camera.aspect = w / h;
      vp.camera.updateProjectionMatrix();
    }
  }

  const loader = new GLTFLoader();
  loader.load('star.glb', (gltf) => {
    const base = gltf.scene;
    const box = new THREE.Box3().setFromObject(base);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    for (const vp of viewports) {
      const mesh = base.clone(true);

      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(vp.color),
        metalness: vp.envOk ? 1 : 0.25,
        roughness: vp.envOk ? 0.28 : 0.65,
        clearcoat: vp.envOk ? 0.2 : 0,
        clearcoatRoughness: 0.4,
        envMapIntensity: 1.0,
      });

      mesh.traverse((o) => {
        if (o.isMesh) o.material = material;
      });

      mesh.position.sub(center);

      const group = new THREE.Group();
      group.add(mesh);
      group.scale.setScalar(fitScale / maxDim);
      group.rotation.z = vp.baseRotZ;
      group.rotation.y = vp.baseRotY;

      vp.scene.add(group);
      vp.group = group;
      vp.view.classList.add('is-3d');
    }

    resize();
  }, undefined, (error) => {
    console.error('Error cargando star.glb (mobile)', error);
  });

  for (const vp of viewports) {
    const canvas = vp.renderer.domElement;

    canvas.addEventListener('pointerdown', (e) => {
      vp.dragging = true;
      vp.moved = 0;
      vp.velX = 0;
      vp.velY = 0;
      vp.lastX = e.clientX;
      vp.lastY = e.clientY;
      vp.lastMoveTime = performance.now();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!vp.dragging || !vp.group) return;
      const now = performance.now();
      const dx = e.clientX - vp.lastX;
      const dy = e.clientY - vp.lastY;
      vp.moved += Math.abs(dx) + Math.abs(dy);

      const dtSec = Math.max(now - vp.lastMoveTime, 1) / 1000;
      const instVelX = (dy * 0.012) / dtSec;
      const instVelY = (dx * 0.012) / dtSec;
      vp.velX = vp.velX * 0.6 + instVelX * 0.4;
      vp.velY = vp.velY * 0.6 + instVelY * 0.4;

      vp.group.rotation.y += dx * 0.012;
      vp.group.rotation.x += dy * 0.012;
      vp.lastX = e.clientX;
      vp.lastY = e.clientY;
      vp.lastMoveTime = now;
    });

    const endDrag = () => { vp.dragging = false; };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    vp.link.addEventListener('click', (e) => {
      if (vp.moved > 8) e.preventDefault();
    });
  }

  const clock = new THREE.Clock();
  const FRICTION = 3;
  const VELOCITY_EPS = 0.05;
  let lastFrame = performance.now();

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    const t = clock.getElapsedTime();

    for (const vp of viewports) {
      if (!vp.group) continue;
      if (vp.dragging) {
        // la rotación se aplica en pointermove
      } else if (Math.abs(vp.velX) > VELOCITY_EPS || Math.abs(vp.velY) > VELOCITY_EPS) {
        vp.group.rotation.x += vp.velX * dt;
        vp.group.rotation.y += vp.velY * dt;
        const decay = Math.exp(-FRICTION * dt);
        vp.velX *= decay;
        vp.velY *= decay;
      } else if (!prefersReducedMotion) {
        vp.group.rotation.y += dt * vp.idleSpeed;
        const targetZ = vp.baseRotZ + Math.sin(t * 0.5 + vp.baseRotZ) * 0.08;
        vp.group.rotation.z += (targetZ - vp.group.rotation.z) * 0.04;
      }
      vp.renderer.render(vp.scene, vp.camera);
    }
  }

  animate();

  window.addEventListener('resize', resize);
}
