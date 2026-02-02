import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader.js";

export default function Canvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ---------------------------
    // Helpers: Iridescent BG
    // ---------------------------
    function makeIridescentBgTexture() {
      const c = document.createElement("canvas");
      c.width = 1024;
      c.height = 1024;
      const ctx = c.getContext("2d");

      const g = ctx.createLinearGradient(0, 0, 0, c.height);
      g.addColorStop(0.0, "#f0f2f4");
      g.addColorStop(0.45, "#e6eaee");
      g.addColorStop(1.0, "#dde3ea");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);

      const blobs = [
        { x: 0.18, y: 0.28, r: 0.62, col: "rgba(165, 205, 255, 0.18)" },
        { x: 0.78, y: 0.22, r: 0.72, col: "rgba(255, 205, 235, 0.12)" },
        { x: 0.58, y: 0.80, r: 0.78, col: "rgba(200, 255, 230, 0.10)" },
      ];

      for (const b of blobs) {
        const rg = ctx.createRadialGradient(
          c.width * b.x,
          c.height * b.y,
          0,
          c.width * b.x,
          c.height * b.y,
          c.width * b.r
        );
        rg.addColorStop(0, b.col);
        rg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, c.width, c.height);
      }

      const img = ctx.getImageData(0, 0, c.width, c.height);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 6;
        d[i] += n;
        d[i + 1] += n;
        d[i + 2] += n;
      }
      ctx.putImageData(img, 0, 0);

      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    // ---------------------------
    // Scene / Camera / Renderer
    // ---------------------------
    const scene = new THREE.Scene();
    const bgTex = makeIridescentBgTexture();
    scene.background = bgTex;

    const isMobile = window.matchMedia?.("(pointer: coarse)")?.matches || window.innerWidth < 768;

    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );

    const startCam = { y: 6, z: 2 };
    const finalCam = { y: isMobile ? 2.8 : 2.4, z: isMobile ? 12 : 8.8 };
    camera.position.set(0, startCam.y, startCam.z);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    else renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.78;

    // ---------------------------
    // Lights (key seguirá al mouse)
    // ---------------------------
    const ambient = new THREE.AmbientLight(0xffffff, 0.012);
    scene.add(ambient);

    // key: lo vamos a mover con el mouse
    const key = new THREE.DirectionalLight(0xfff0dc, 0.18);
    key.position.set(2.5, 4, 3.5);
    scene.add(key);

    // target del key (apunta al modelo)
    const keyTarget = new THREE.Object3D();
    keyTarget.position.set(0, -0.5, 0);
    scene.add(keyTarget);
    key.target = keyTarget;

    const fill = new THREE.DirectionalLight(0xdde8ff, 0.08);
    fill.position.set(-3, 1.2, 1.5);
    scene.add(fill);

    // Opcional: un point light súper suave para “cuerpo” (queda lindo con parallax)
    const rim = new THREE.PointLight(0xffffff, 0.06, 50);
    rim.position.set(-2, 2.5, 6);
    scene.add(rim);

    // ---------------------------
    // Post
    // ---------------------------
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.12,
      0.55,
      0.97
    );
    composer.addPass(bloom);

    const film = new FilmPass(0.18, 0.06, 720, false);
    composer.addPass(film);

    const vignette = new ShaderPass(VignetteShader);
    vignette.uniforms.offset.value = 1.03;
    vignette.uniforms.darkness.value = 1.04;
    composer.addPass(vignette);

    // ---------------------------
    // HDRI env + GLB
    // ---------------------------
    let envMap = null;
    let model = null;

    const applyEnvToModelMaterials = (root, texture) => {
      root.traverse((obj) => {
        if (!obj.isMesh) return;

        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat) => {
          if (!mat) return;

          mat.envMap = texture;
          if ("envMapIntensity" in mat) mat.envMapIntensity = 0.55;
          mat.needsUpdate = true;
        });
      });
    };

    new RGBELoader().load("/moon_lab_1k.hdr", (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      envMap = texture;
      if (model) applyEnvToModelMaterials(model, envMap);
    });

    // Guardamos transform base para parallax estable
    const base = {
      pos: new THREE.Vector3(0, 0, 0),
      rot: new THREE.Euler(0, 0, 0),
    };

    new GLTFLoader().load(
      "/caballo.glb",
      (gltf) => {
        model = gltf.scene;
        model.scale.set(5, 5, 5);

        if (isMobile) {
          model.position.set(2.5, -1.3, 3);
          model.rotation.z = Math.PI / 2;
        } else {
          model.position.set(0, 0, 0);
          model.rotation.set(0, 0, 0);
        }

        base.pos.copy(model.position);
        base.rot.copy(model.rotation);

        if (envMap) applyEnvToModelMaterials(model, envMap);
        scene.add(model);

        // apuntamos la luz al modelo (mejor que un punto fijo)
        keyTarget.position.set(model.position.x, model.position.y + 0.2, model.position.z);
      },
      undefined,
      (err) => console.error("Error loading GLB:", err)
    );

    // ---------------------------
    // Mouse tracking (normalized)
    // ---------------------------
    const pointer = { x: 0, y: 0 };       // target (-1..1)
    const pointerSm = { x: 0, y: 0 };     // smoothed (-1..1)

    const getNDCFromEvent = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width;
      const cy = (e.clientY - rect.top) / rect.height;
      return {
        x: (cx - 0.5) * 2,
        y: (cy - 0.5) * 2,
      };
    };

    const onMouseMove = (e) => {
      const n = getNDCFromEvent(e);
      pointer.x = THREE.MathUtils.clamp(n.x, -1, 1);
      pointer.y = THREE.MathUtils.clamp(n.y, -1, 1);
    };

    // Touch (suave y opcional)
    const onTouchMove = (e) => {
      if (!e.touches?.length) return;
      const t = e.touches[0];
      const n = getNDCFromEvent(t);
      pointer.x = THREE.MathUtils.clamp(n.x, -1, 1);
      pointer.y = THREE.MathUtils.clamp(n.y, -1, 1);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // ---------------------------
    // Render loop + intro + parallax
    // ---------------------------
    const clock = new THREE.Clock();
    let rafId = 0;
    let tIntro = 0;

    const easeOutQuad = (x) => 1 - (1 - x) * (1 - x);

    // targets para luz
    const keyBasePos = key.position.clone();
    const keyPos = key.position.clone();
    const tmpVec = new THREE.Vector3();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      // intro cámara
      if (tIntro < 1) {
        tIntro = Math.min(1, tIntro + dt * 0.5);
        const e = easeOutQuad(tIntro);
        camera.position.y = THREE.MathUtils.lerp(startCam.y, finalCam.y, e);
        camera.position.z = THREE.MathUtils.lerp(startCam.z, finalCam.z, e);
      }

      // suavizado pointer (evita “terremoto”)
      const smooth = 1 - Math.pow(0.0001, dt); // frame-rate independent
      pointerSm.x = THREE.MathUtils.lerp(pointerSm.x, pointer.x, smooth);
      pointerSm.y = THREE.MathUtils.lerp(pointerSm.y, pointer.y, smooth);

      // ---------------------------
      // Luz sigue mouse
      // ---------------------------
      // amplitud del movimiento de luz (en world units)
      const lightAmpX = isMobile ? 0.7 : 1.6;
      const lightAmpY = isMobile ? 0.5 : 1.2;
      const lightAmpZ = isMobile ? 0.4 : 0.8;

      const targetLightPos = tmpVec.set(
        keyBasePos.x + pointerSm.x * lightAmpX,
        keyBasePos.y + (-pointerSm.y) * lightAmpY,
        keyBasePos.z + (Math.abs(pointerSm.x) + Math.abs(pointerSm.y)) * lightAmpZ
      );

      // lerp suave de la luz
      keyPos.lerp(targetLightPos, smooth * 0.65);
      key.position.copy(keyPos);

      // target de la luz siempre al modelo (o al centro)
      if (model) {
        keyTarget.position.set(model.position.x, model.position.y + 0.2, model.position.z);
      } else {
        keyTarget.position.set(0, -0.5, 0);
      }

      // ---------------------------
      // Parallax del modelo
      // ---------------------------
      if (model) {
        // rotación desde el centro (tilt)
        const rotAmp = isMobile ? 0.08 : 0.18; // rad
        const rollAmp = isMobile ? 0.03 : 0.07;

        const targetRx = base.rot.x + (-pointerSm.y) * rotAmp;
        const targetRy = base.rot.y + (pointerSm.x) * rotAmp;
        const targetRz = base.rot.z + (pointerSm.x) * rollAmp;

        model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, targetRx, smooth * 0.7);
        model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, targetRy, smooth * 0.7);
        model.rotation.z = THREE.MathUtils.lerp(model.rotation.z, targetRz, smooth * 0.7);

        // micro desplazamiento (parallax position)
        const posAmpX = isMobile ? 0.10 : 0.25;
        const posAmpY = isMobile ? 0.06 : 0.18;

        const targetPx = base.pos.x + pointerSm.x * posAmpX;
        const targetPy = base.pos.y + (-pointerSm.y) * posAmpY;

        model.position.x = THREE.MathUtils.lerp(model.position.x, targetPx, smooth * 0.55);
        model.position.y = THREE.MathUtils.lerp(model.position.y, targetPy, smooth * 0.55);

        // acompañamos un poquito el rim light para “depth”
        rim.position.x = THREE.MathUtils.lerp(rim.position.x, -2 + pointerSm.x * 0.8, smooth * 0.35);
        rim.position.y = THREE.MathUtils.lerp(rim.position.y, 2.5 + (-pointerSm.y) * 0.6, smooth * 0.35);
      }

      camera.lookAt(0, -0.5, 0);
      composer.render();
    };

    animate();

    // ---------------------------
    // Resize
    // ---------------------------
    const onResize = () => {
      const mob = window.matchMedia?.("(pointer: coarse)")?.matches || window.innerWidth < 768;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      bloom.setSize(window.innerWidth, window.innerHeight);

      camera.position.y = mob ? 2.8 : 2.4;
      camera.position.z = mob ? 12 : 8.8;
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);

      composer.dispose();
      renderer.dispose();

      bgTex.dispose?.();
      envMap?.dispose?.();
    };
  }, []);

  return <canvas ref={canvasRef} className="canvas" style={{ display: "block" }} />;
}
