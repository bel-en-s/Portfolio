import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const Canvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Evita que la página se scrollee en mobile
    const preventScroll = (e) => {
      e.preventDefault();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("touchmove", preventScroll, { passive: false });

    const scene = new THREE.Scene();
    const gradientTexture = new THREE.CanvasTexture(generateGradientCanvas());
    scene.background = gradientTexture;

    const isMobile = window.innerWidth < 768;

    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100);
    const startCamY = isMobile ? 6 : 6;
    const startCamZ = isMobile ? 2 : 2;
    const finalCamY = isMobile ? 2.8 : 2.4;
    const finalCamZ = isMobile ? 12 : 8.8;
    camera.position.set(0, startCamY, startCamZ);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.outputEncoding = THREE.sRGBEncoding;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8,
      0.6,
      0.85
    );
    bloomPass.threshold = 0.2;
    bloomPass.strength = 0.9;
    bloomPass.radius = 0.55;
    composer.addPass(bloomPass);

    const lights = [
      new THREE.AmbientLight(0xffffff, 0.8),
      new THREE.DirectionalLight(0xfefefe, 0.3),
      new THREE.PointLight(0x90ee90, 1.5, 20, 5),
      new THREE.PointLight(0x7a00e6, 1.5, 20, 5),
      new THREE.PointLight(0xffccaa, 2, 40, 10),
    ];
    lights[1].position.set(2, 4, 4);
    lights[2].position.set(-2, 2, 3);
    lights[3].position.set(2, -2, -3);
    lights[4].position.set(0, 0, 6);
    lights.forEach((light) => scene.add(light));

    // const cube = new THREE.Mesh(
    //   new THREE.BoxGeometry(1, 1, 1),
    //   new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 500 })
    // );
    // scene.add(cube);

    let envMap = null;
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load("/moon_lab_1k.hdr", (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      envMap = texture;

      if (model) {
        model.traverse((obj) => {
          if (obj.isMesh) {
            obj.material.envMap = envMap;
            obj.material.envMapIntensity = 2.5;
            obj.material.needsUpdate = true;
          }
        });
      }
    });

    const loader = new GLTFLoader();
    let model;
    loader.load(
      "/landing.glb",
      (gltf) => {
        model = gltf.scene;
        const scale = isMobile ? [8, 11, 8] : [10, 10, 10];
        model.scale.set(...scale);
        if (isMobile) {
            model.position.set(2.5, -1.3, 3);  // más a la derecha en mobile
          } else {
            model.position.set(0, -2.5, 3);  // posición normal en desktop
          }

        // model.rotate.set( isMobile ? 0 : 0, 0);

        
        if (isMobile) {
            model.rotation.z = Math.PI / 2;  // ✅ lo para vertical sin perder el frente
          } else {
            model.rotation.set(0, 0, 0);     // orientación normal en desktop
}
        
        model.traverse((obj) => {
          if (obj.isMesh) {
            obj.material = new THREE.MeshPhysicalMaterial({
              color: 0xc0c0c0,
              metalness: 1,
              roughness: 0.1,
              reflectivity: 10,
              envMap: envMap,
              envMapIntensity: 0.01,
              clearcoat: 10,
              clearcoatRoughness: 0.05,
            });
          }
        });

        scene.add(model);
        scene.remove(cube);

        lights.forEach((light) => {
          if (light instanceof THREE.PointLight || light instanceof THREE.DirectionalLight) {
            light.lookAt(model.position);
          }
        });
      },
      undefined,
      (error) => console.error("Error loading GLB:", error)
    );

    // Cursor (mouse o touch)
const cursor = { x: 0, y: 0 };

const updateCursor = (x, y) => {
  cursor.x = (x / window.innerWidth - 0.5);
  cursor.y = (y / window.innerHeight - 0.5);
};

window.addEventListener("mousemove", (e) => {
  updateCursor(e.clientX, e.clientY);
});

window.addEventListener("touchmove", (e) => {
  if (e.touches.length > 0) {
    updateCursor(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: false });


    const clock = new THREE.Clock();
    let animationProgress = 0;
    let isPageVisible = true;

    document.addEventListener("visibilitychange", () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        clock.start();
      } else {
        clock.stop();
      }
    });

    function animate() {
      requestAnimationFrame(animate);
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

        lights.forEach((light) => {
          if (light instanceof THREE.PointLight) {
            light.position.x += (cursor.x * 6 - light.position.x) * 2 * delta;
            light.position.y += (-cursor.y * 6 - light.position.y + 2) * 2 * delta;
          }
        });

        if (model) {
          // movimiento base
          const baseRotX = 0;
          const baseRotY = 0;
          const baseRotZ = isMobile ? Math.PI / 2 : 0;  // ✅ rotación vertical en mobile

          const rotX = baseRotX + (cursor.y * 0.15);
          const rotY = baseRotY + (-cursor.x * 0.15);

          // mantenemos la base Z (vertical en mobile)
          model.rotation.x += (rotX - model.rotation.x) * 1.5 * delta;
          model.rotation.y += (rotY - model.rotation.y) * 1.5 * delta;
          model.rotation.z = baseRotZ; // fijo en mobile, sin interpolar
        }

      }

      camera.lookAt(0, -0.5, 0);
      composer.render();
    }
    animate();

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      camera.position.set(0, isMobile ? 2.8 : 2.4, isMobile ? 12 : 8.8);
    };
    window.addEventListener("resize", handleResize);

    function generateGradientCanvas() {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#2a2a2a");
      gradient.addColorStop(1, "#4a4a4a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return canvas;
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", () => {});
      window.removeEventListener("touchmove", preventScroll);
      document.body.style.overflow = "auto";
      gradientTexture.dispose();
      renderer.dispose();
      composer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="canvas" style={{ display: "block" }} />;
};

export default Canvas;
