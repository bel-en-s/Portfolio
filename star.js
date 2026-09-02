import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('star-3d');
const isMobile = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!container) {
  console.warn('No se encontró #star-3d');
} else {
  initStar(container);
}

// Fragmento GLSL que reemplaza la transmisión estándar de three.js para añadir
// aberración cromática (efecto "3D glass" tipo drei MeshTransmissionMaterial).
const GLASS_TRANSMISSION = /* glsl */`
#ifdef USE_TRANSMISSION

	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;

	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif

	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif

	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );

	vec4 refractionSample = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );

	vec3 transmitted;
	float ca = chromaticAberration;

	if ( ca > 0.0 ) {
		transmitted.r = refractionSample.r;
		transmitted.g = getIBLVolumeRefraction(
			n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
			pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * ( 1.0 + ca ), material.thickness,
			material.attenuationColor, material.attenuationDistance ).g;
		transmitted.b = getIBLVolumeRefraction(
			n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
			pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * ( 1.0 + 2.0 * ca ), material.thickness,
			material.attenuationColor, material.attenuationDistance ).b;
	} else {
		transmitted = refractionSample.rgb;
	}

	material.transmissionAlpha = mix( material.transmissionAlpha, refractionSample.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted, material.transmission );

#endif
`;

function createGlassMaterial() {
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.05,
    transmission: 0.4,
    thickness: 0.3,
    ior: 1.3,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    specularIntensity: 1,
    transparent: true,
    depthWrite: false,
    envMapIntensity: 2.0,
    side: THREE.DoubleSide,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.chromaticAberration = { value: 0.02 };

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <transmission_pars_fragment>',
      '#include <transmission_pars_fragment>\n\tuniform float chromaticAberration;'
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <transmission_fragment>',
      GLASS_TRANSMISSION
    );
  };

  return material;
}

function initStar(container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  function setEnvironmentFromTexture(tex) {
    const envMap = pmrem.fromEquirectangular(tex).texture;
    scene.environment = envMap;
    scene.environmentIntensity = 1.0;
  }

  // Entorno por defecto (gradiente colorido) por si no hay red o falla el HDRI
  const gradient = document.createElement('canvas');
  gradient.width = 512;
  gradient.height = 256;
  const ctx = gradient.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#ff6ec7');
  grad.addColorStop(0.15, '#ffb56b');
  grad.addColorStop(0.3, '#fff3a0');
  grad.addColorStop(0.45, '#a0ffb0');
  grad.addColorStop(0.6, '#6be4ff');
  grad.addColorStop(0.75, '#8f9bff');
  grad.addColorStop(0.9, '#d98fff');
  grad.addColorStop(1, '#ff6ec7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);
  const fallbackTex = new THREE.CanvasTexture(gradient);
  fallbackTex.mapping = THREE.EquirectangularReflectionMapping;
  fallbackTex.colorSpace = THREE.SRGBColorSpace;
  setEnvironmentFromTexture(fallbackTex);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(4, 4, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 1);
  fillLight.position.set(-4, -2, 4);
  scene.add(fillLight);

  const sparkleLight = new THREE.DirectionalLight(0xfff3d6, 3.5);
  scene.add(sparkleLight);
  scene.add(sparkleLight.target);

  // Luz que sigue el cursor e ilumina la estrella
  const cursorLight = new THREE.PointLight(0xffffff, 30, 0, 2);
  cursorLight.position.set(0, 0, 0.7);
  scene.add(cursorLight);

  let star = null;
  let baseY = 0;
  let baseScale = 1;
  const materials = [];

  const raycaster = new THREE.Raycaster();
  const cursorNDC = new THREE.Vector2();
  const cursorPoint = new THREE.Vector3();
  const starPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let scrollRot = 0;
  let targetScrollRot = 0;

  const loader = new GLTFLoader();
  loader.load('assets/star.glb?v=' + Date.now(), (gltf) => {
    star = gltf.scene;

    const glass = createGlassMaterial();
    star.traverse((o) => {
      if (o.isMesh) {
        o.material = glass;
      }
    });
    materials.push(glass);

    const box = new THREE.Box3().setFromObject(star);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 3 / maxDim;
    star.scale.setScalar(scale);
    star.position.sub(center.multiplyScalar(scale));

    baseY = star.position.y;
    baseScale = scale;

    scene.add(star);

    if (prefersReducedMotion) renderStatic();
  }, undefined, (error) => {
    console.error('Error cargando star.glb', error);
  });

  function resize() {
    const size = container.clientWidth || 230;
    renderer.setSize(size, size);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    if (prefersReducedMotion) renderStatic();
  }

  resize();
  window.addEventListener('resize', resize);

  // La luz sigue el cursor (mapeado al área de la estrella, con tope suave)
  window.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let nx = (e.clientX - cx) / (rect.width / 2);
    let ny = -(e.clientY - cy) / (rect.height / 2);
    nx = Math.max(-1.2, Math.min(1.2, nx));
    ny = Math.max(-1.2, Math.min(1.2, ny));
    cursorNDC.set(nx, ny);
  });

  // El scroll hace girar la estrella sobre sí misma
  window.addEventListener('wheel', (e) => {
    targetScrollRot += e.deltaY * 0.0025;
  }, { passive: true });

  const clock = new THREE.Clock();
  const introDuration = 1800;
  let introStart = null;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  let lastTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const t = clock.getElapsedTime();

    sparkleLight.position.set(
      Math.cos(t * 0.9) * 3,
      Math.sin(t * 0.72) * 1.5,
      Math.sin(t * 0.9) * 3
    );
    sparkleLight.intensity = 3 + Math.sin(t * 2.0) * 1.2;

    if (star) {
      if (introStart === null) introStart = performance.now();
      const p = Math.min((performance.now() - introStart) / introDuration, 1);
      const intro = easeOutQuart(p);

      star.scale.setScalar(baseScale * (0.7 + 0.3 * intro));
      star.position.y = baseY - (1 - intro) * 0.18;

      // Gira sobre sí misma según el scroll (suavizado con lerp)
      scrollRot += (targetScrollRot - scrollRot) * 0.1;
      star.rotation.z = scrollRot;

      if (materials.length) {
        materials.forEach((m) => { m.opacity = intro; });
      }
    }

    // Mueve la luz del cursor (lerp) al punto sobre la estrella
    raycaster.setFromCamera(cursorNDC, camera);
    if (raycaster.ray.intersectPlane(starPlane, cursorPoint)) {
      cursorLight.position.x += (cursorPoint.x - cursorLight.position.x) * 0.15;
      cursorLight.position.y += (cursorPoint.y - cursorLight.position.y) * 0.15;
    }
    cursorLight.position.z = 0.7;

    renderer.render(scene, camera);
  }

  function renderStatic() {
    if (star) {
      star.scale.setScalar(baseScale);
      star.rotation.set(0, 0, 0);
      if (materials.length) {
        materials.forEach((m) => { m.opacity = 1; });
      }
    }
    renderer.render(scene, camera);
  }

  if (prefersReducedMotion) {
    renderStatic();
  } else {
    animate();
  }
}
