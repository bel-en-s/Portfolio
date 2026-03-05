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
    // Scroll lock (como tu primer código)
    // ---------------------------
    const preventScroll = (e) => e.preventDefault();
    document.body.style.overflow = "hidden";

    // ---------------------------
    // Background iridiscente (del segundo)
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

      // grano sutil
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
    // Scene / Camera
    // ---------------------------
    const scene = new THREE.Scene();
    const bgTex = makeIridescentBgTexture();
    scene.background = bgTex;

    const isMobile =
      window.matchMedia?.("(pointer: coarse)")?.matches || window.innerWidth < 768;

    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      1,
      100
    );

    const startCamY = isMobile ? 6 : 6;
    const startCamZ = isMobile ? 2 : 2;
    const finalCamY = isMobile ? 2.8 : 2.4;
    const finalCamZ = isMobile ? 12 : 8.8;

    camera.position.set(0, startCamY, startCamZ);
    scene.add(camera);

    // ---------------------------
    // Renderer (tone mapping del segundo)
    // ---------------------------
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    else renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.78;

    // ---------------------------
    // Post FX (bloom + film + vignette del segundo)
    // ---------------------------
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.12, // strength (suave)
      0.55, // radius
      0.97  // threshold
    );
    composer.addPass(bloomPass);

    const filmPass = new FilmPass(0.18, 0.06, 720, false);
    composer.addPass(filmPass);

    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms.offset.value = 1.03;
    vignettePass.uniforms.darkness.value = 1.04;
    composer.addPass(vignettePass);

    // ---------------------------
    // Lights (conservar tu vibe pero más soft como el segundo)
    // ---------------------------
    const lights = [
      new THREE.AmbientLight(0xffffff, 0.012),
      new THREE.DirectionalLight(0xfff0dc, 0.18), // key
      new THREE.DirectionalLight(0xdde8ff, 0.08), // fill
      new THREE.PointLight(0xffffff, 0.06, 50),   // rim suave
      // si querés mantener tus point lights “neón”, dejalos muy bajitos:
      new THREE.PointLight(0x90ee90, 0.25, 20, 5),
      new THREE.PointLight(0x7a00e6, 0.22, 20, 5),
      new THREE.PointLight(0xffccaa, 0.28, 40, 10),
    ];

    // posiciones base
    lights[1].position.set(2.5, 4, 3.5);
    lights[2].position.set(-3, 1.2, 1.5);
    lights[3].position.set(-2, 2.5, 6);

    lights[4].position.set(-2, 2, 3);
    lights[5].position.set(2, -2, -3);
    lights[6].position.set(0, 0, 6);

    lights.forEach((l) => scene.add(l));

    // target para key light
    const key = lights[1];
    const keyTarget = new THREE.Object3D();
    keyTarget.position.set(0, -0.5, 0);
    scene.add(keyTarget);
    key.target = keyTarget;

    const rim = lights[3];

    // ---------------------------
    // Dummy cube (como tu primero, pero lo sacamos al cargar model)
    // ---------------------------
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 500 })
    );
    scene.add(cube);

    // ---------------------------
    // HDRI env (igual que tu primero)
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
          if ("envMapIntensity" in mat) mat.envMapIntensity = 2.5; // tu look “reflexivo”
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

    // ---------------------------
    // GLB (tu material físico como antes)
    // ---------------------------
    const loader = new GLTFLoader();

    // base transform para parallax estable
    const base = {
      pos: new THREE.Vector3(0, 0, 0),
      rot: new THREE.Euler(0, 0, 0),
    };

    loader.load(
      "/landing.glb",
      (gltf) => {
        model = gltf.scene;

        // mantené tus escalas / posiciones originales
        const scale = isMobile ? [14, 12, 6] : [10, 10, 10];
        model.scale.set(...scale);
        model.position.set(0, isMobile ? -5 : -3.5, 0);

        base.pos.copy(model.position);
        base.rot.copy(model.rotation);

        model.traverse((obj) => {
          if (!obj.isMesh) return;

          obj.material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 1,
            roughness: 0.1,
            reflectivity: 1,
            envMap: envMap,
            envMapIntensity: 2.5,
            clearcoat: 1,
            clearcoatRoughness: 0.05,
          });
        });

        scene.add(model);
        scene.remove(cube);

        // key light apunta al modelo
        keyTarget.position.set(model.position.x, model.position.y + 0.2, model.position.z);
      },
      undefined,
      (error) => console.error("Error loading GLB:", error)
    );

    // ---------------------------
    // Cursor (tu lógica, pero arreglada + 1 solo touchmove)
    // ---------------------------
    const cursor = { x: 0, y: 0 };

    const updateCursorFromClient = (clientX, clientY) => {
      cursor.x = clientX / window.innerWidth - 0.5;
      cursor.y = clientY / window.innerHeight - 0.5;
    };

    const onMouseMove = (e) => {
      updateCursorFromClient(e.clientX, e.clientY);
    };

    const onTouchMove = (e) => {
      // bloquea scroll + actualiza cursor
      if (e.touches && e.touches.length > 0) {
        const t = e.touches[0];
        updateCursorFromClient(t.clientX, t.clientY);
      }
      e.preventDefault();
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false }); // redundante pero consistente con tu primer approach

    // ---------------------------
    // Animación (tu loop original, con un toque de suavizado de luz del 2do)
    // ---------------------------
    const clock = new THREE.Clock();
    let animationProgress = 0;
    let isPageVisible = true;

    const onVis = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) clock.start();
      else clock.stop();
    };
    document.addEventListener("visibilitychange", onVis);

    // para suavizar la luz key como en el segundo
    const keyBasePos = key.position.clone();
    const keyPos = key.position.clone();
    const tmpVec = new THREE.Vector3();

    let rafId = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (animationProgress < 1) {
        animationProgress += delta * 0.5;
        const ease = animationProgress * (2 - animationProgress);
        camera.position.y = THREE.MathUtils.lerp(startCamY, finalCamY, ease);
        camera.position.z = THREE.MathUtils.lerp(startCamZ, finalCamZ, ease);
      } else if (isPageVisible) {
        const camTargetX = cursor.x * 0.3;
        const camTargetY = finalCamY + cursor.y * 0.3;
        const camTargetZ = finalCamZ + cursor.y * 0.2;

        camera.position.x += (camTargetX - camera.position.x) * 1 * delta;
        camera.position.y += (camTargetY - camera.position.y) * 1 * delta;
        camera.position.z += (camTargetZ - camera.position.z) * 1 * delta;

        // key light sigue el cursor (suave)
        const lightAmpX = isMobile ? 0.7 : 1.6;
        const lightAmpY = isMobile ? 0.5 : 1.2;
        const lightAmpZ = isMobile ? 0.4 : 0.8;

        const targetLightPos = tmpVec.set(
          keyBasePos.x + cursor.x * 2 * lightAmpX,
          keyBasePos.y + (-cursor.y) * 2 * lightAmpY,
          keyBasePos.z + (Math.abs(cursor.x) + Math.abs(cursor.y)) * lightAmpZ
        );

        // lerp dependiente de delta (estable)
        const smooth = 1 - Math.pow(0.0001, delta);
        keyPos.lerp(targetLightPos, smooth * 0.65);
        key.position.copy(keyPos);

        // tus point lights “neón” (si querés conservar el movimiento)
        lights.forEach((light) => {
          if (light instanceof THREE.PointLight && light !== rim) {
            light.position.x += (cursor.x * 6 - light.position.x) * 2 * delta;
            light.position.y += (-cursor.y * 6 - light.position.y + 2) * 2 * delta;
          }
        });

        if (model) {
          const rotX = cursor.y * 0.15;
          const rotY = -cursor.x * 0.15;
          model.rotation.x += (rotX - model.rotation.x) * 1.5 * delta;
          model.rotation.y += (rotY - model.rotation.y) * 1.5 * delta;

          // rim acompaña un poquito (depth)
          rim.position.x += (-2 + cursor.x * 0.8 - rim.position.x) * 0.35 * delta * 60;
          rim.position.y += (2.5 + (-cursor.y) * 0.6 - rim.position.y) * 0.35 * delta * 60;

          // target del key siempre al modelo
          keyTarget.position.set(model.position.x, model.position.y + 0.2, model.position.z);
        } else {
          keyTarget.position.set(0, -0.5, 0);
        }
      }

      camera.lookAt(0, -0.5, 0);
      composer.render();
    };

    animate();

    // ---------------------------
    // Resize (tu handleResize + tamaños de post)
    // ---------------------------
    const handleResize = () => {
      const mob =
        window.matchMedia?.("(pointer: coarse)")?.matches || window.innerWidth < 768;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      bloomPass.setSize(window.innerWidth, window.innerHeight);

      camera.position.set(0, mob ? 2.8 : 2.4, mob ? 12 : 8.8);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);

      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchmove", preventScroll);

      document.removeEventListener("visibilitychange", onVis);
      document.body.style.overflow = "auto";

      bgTex.dispose?.();
      envMap?.dispose?.();

      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="canvas" style={{ display: "block" }} />;
}