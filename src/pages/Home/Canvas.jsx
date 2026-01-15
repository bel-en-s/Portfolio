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
    // Helpers: Iridescent BG (claro pero no blanco puro)
    // ---------------------------
    function makeIridescentBgTexture() {
      const c = document.createElement("canvas");
      c.width = 1024;
      c.height = 1024;
      const ctx = c.getContext("2d");

      // base perla MÁS gris (para evitar “blanco quemado”)
      const g = ctx.createLinearGradient(0, 0, 0, c.height);
      g.addColorStop(0.0, "#f0f2f4");
      g.addColorStop(0.45, "#e6eaee");
      g.addColorStop(1.0, "#dde3ea");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);

      // tornasol sutil
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

      // micro grain MUY leve (si está demasiado, bajá el *6 a *4)
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

    const isMobile = window.innerWidth < 768;

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
    renderer.toneMappingExposure = 0.78; // ✅ baja exposición = no quema

    // ---------------------------
    // Lights: más “gloom”, menos potencia
    // ---------------------------
    const ambient = new THREE.AmbientLight(0xffffff, 0.12);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xfff0dc, 0.28);
    key.position.set(2.5, 4, 3.5);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xdde8ff, 0.08);
    fill.position.set(-3, 1.2, 1.5);
    scene.add(fill);

    // ---------------------------
    // Post: bloom MUY controlado + grain + vignette leve
    // ---------------------------
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.12, // ✅ menos glow (antes 0.22)
      0.55,
      0.97  // ✅ threshold alto = casi solo brillos del modelo
    );
    composer.addPass(bloom);

    const film = new FilmPass(
      0.18, // noise
      0.06, // scanlines
      720,
      false
    );
    composer.addPass(film);

    const vignette = new ShaderPass(VignetteShader);
    vignette.uniforms.offset.value = 1.03;
    vignette.uniforms.darkness.value = 1.04; // ✅ muy leve (antes oscurecía/ensuciaba)
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

          // ✅ clave anti-quemado: baja intensidad del HDRI
          if ("envMapIntensity" in mat) mat.envMapIntensity = 0.55;

          // ❌ NO tocar roughness (eso te estaba “espejando” y quemando)
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

    new GLTFLoader().load(
      "/caballo.glb",
      (gltf) => {
        model = gltf.scene;
        model.scale.set(1, 1, 1);

        if (isMobile) {
          model.position.set(2.5, -1.3, 3);
          model.rotation.z = Math.PI / 2;
        } else {
          model.position.set(0, -2.5, 3);
          model.rotation.set(0, 0, 0);
        }

        if (envMap) applyEnvToModelMaterials(model, envMap);
        scene.add(model);
      },
      undefined,
      (err) => console.error("Error loading GLB:", err)
    );

    // ---------------------------
    // Render loop + intro
    // ---------------------------
    const clock = new THREE.Clock();
    let rafId = 0;
    let t = 0;

    const easeOutQuad = (x) => 1 - (1 - x) * (1 - x);

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      const dt = clock.getDelta();

      if (t < 1) {
        t = Math.min(1, t + dt * 0.5);
        const e = easeOutQuad(t);
        camera.position.y = THREE.MathUtils.lerp(startCam.y, finalCam.y, e);
        camera.position.z = THREE.MathUtils.lerp(startCam.z, finalCam.z, e);
      }

      camera.lookAt(0, -0.5, 0);
      composer.render();
    };

    animate();

    // ---------------------------
    // Resize
    // ---------------------------
    const onResize = () => {
      const mob = window.innerWidth < 768;

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

      composer.dispose();
      renderer.dispose();

      bgTex.dispose?.();
      envMap?.dispose?.();
    };
  }, []);

  return <canvas ref={canvasRef} className="canvas" style={{ display: "block" }} />;
}
