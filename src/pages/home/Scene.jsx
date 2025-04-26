import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import gsap from "gsap";

const Scene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, -20);

    const blackReflectiveMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 1,
      roughness: 0.05,
      envMapIntensity: 2,
      clearcoat: 1,
      clearcoatRoughness: 0,
    });

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputEncoding = THREE.sRGBEncoding;
    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader()
      .setPath("/hdri/")
      .load("studio_small_09_1k.hdr", (hdr) => {
        const envMap = pmremGenerator.fromEquirectangular(hdr).texture;
        scene.environment = envMap;
        scene.background = null;
      });

    // Iluminación mejorada
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    scene.add(directionalLight);

    const spotLight = new THREE.SpotLight(0xffffff, 3);
    spotLight.position.set(0, 10, 10);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.5;
    spotLight.decay = 2;
    spotLight.distance = 100;
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);

    const mouse = new THREE.Vector2(0, 0);

    let model = null;
    let targetRotation = { x: 0, y: 0 };

    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      spotLight.target.position.set(mouse.x * 5, mouse.y * 2.5, 0);
    };

    const onTouchMove = (event) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        spotLight.target.position.set(mouse.x * 5, mouse.y * 2.5, 0);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);

    const loader = new GLTFLoader();

    const setupModel = (gltf) => {
      model = gltf.scene;

      model.scale.set(10, 10, 10);
      model.position.set(0, -3, -1);

      model.traverse((child) => {
        if (child.isMesh) {
          child.material = blackReflectiveMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(model);

      adjustCamera();
    };

    const adjustCamera = () => {
      if (window.innerWidth < 768) {
        gsap.to(camera.position, {
          duration: 2,
          x: 0,
          y: -1,
          z: 8,
          ease: "power2.out",
        });
      } else {
        gsap.to(camera.position, {
          duration: 2,
          x: -0.5,
          y: -1,
          z: 8,
          ease: "power2.out",
        });
      }
    };

    loader.load(
      "/landing.glb",
      setupModel,
      undefined,
      (error) => {
        console.error("Error loading GLTF:", error);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);

      if (model) {
        // Parallax effect en el modelo
        targetRotation.y = mouse.x * 0.3;
        targetRotation.x = mouse.y * 0.15;

        model.rotation.y += (targetRotation.y - model.rotation.y) * 0.05;
        model.rotation.x += (targetRotation.x - model.rotation.x) * 0.05;

        model.rotation.x = THREE.MathUtils.clamp(model.rotation.x, -0.2, 0.2);
        model.rotation.y = THREE.MathUtils.clamp(model.rotation.y, -0.3, 0.3);
      }

      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener("resize", () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      adjustCamera();
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", adjustCamera);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default Scene;
