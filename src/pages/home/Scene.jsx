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

    // Posición inicial más arriba y lejos
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
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader()
      .setPath("/hdri/")
      .load("studio_small_09_1k.hdr", (hdr) => {
        const envMap = pmremGenerator.fromEquirectangular(hdr).texture;
        scene.environment = envMap;
        scene.background = envMap;
      });

    //luces

    const dirLight = new THREE.DirectionalLight(0xff0000, 2);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // SpotLight que sigue el mouse
    const spotLight = new THREE.SpotLight(0xffffff, 20);
    spotLight.position.set(0, 10, 10);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.3;
    spotLight.decay = 2;
    spotLight.distance = 100;
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);

    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
      const mousePos = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
    
      // Suaviza con GSAP
      gsap.to(spotLight.position, {
        x: mousePos.x,
        y: mousePos.y,
        z: mousePos.z,
        duration: 0.5,
        ease: "power2.out"
      });
    
    };
    

window.addEventListener("mousemove", onMouseMove);



    const loader = new GLTFLoader();
    let model = null;

    loader.load(
      "/landing.glb",
      (gltf) => {
        model = gltf.scene;

        if (window.innerWidth < 768) {
          model.scale.set(5, 5, 5);
          model.position.set(0, -1, 0);
        } else {
          model.scale.set(10, 10, 10);
          model.position.set(0, -3, -1);
        }

        model.traverse((child) => {
          if (child.isMesh) {
            child.material = blackReflectiveMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);

        // Animar cámara al cargar modelo
        gsap.to(camera.position, {
          duration: 2,
          x: -0.5,
          y: -1,
          z: 8,
          ease: "power2.out"
        });
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF:", error);
      }
    );

    let rotationDirection = 0.5;
    const animate = () => {
      requestAnimationFrame(animate);
      if (model) {
        model.rotation.y += 0.0005 * rotationDirection;
        if (model.rotation.y > Math.PI / 2 || model.rotation.y < -Math.PI / 2) {
          rotationDirection *= -1;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default Scene;
