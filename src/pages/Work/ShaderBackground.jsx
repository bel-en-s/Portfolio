import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./ShaderBackground.css";

const ShaderBackground = ({
  brushSize = 25.0,
  brushStrength = 0.3,
  distortionAmount = 1.5,
  fluidDecay = 0.98,
  trailLength = 0.8,
  stopDecay = 0.85,
  color1 = "#1a1a1a",
  color2 = "#4a4a4a",
  color3 = "#7a7a7a",
  color4 = "#a8a8a8",
  colorIntensity = 0.8,
  softness = 1.0,
}) => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  const sceneDataRef = useRef(null);

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    while (canvasRef.current.firstChild) {
      canvasRef.current.removeChild(canvasRef.current.firstChild);
    }

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    rendererRef.current = renderer;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasRef.current.appendChild(renderer.domElement);

    const fluidTarget1 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
      }
    );

    const fluidTarget2 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
      }
    );

    let currentFluidTarget = fluidTarget1;
    let previousFluidTarget = fluidTarget2;
    let frameCount = 0;

    const fluidMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
        iFrame: { value: 0 },
        iPreviousFrame: { value: null },
        uBrushSize: { value: brushSize },
        uBrushStrength: { value: brushStrength },
        uFluidDecay: { value: fluidDecay },
        uTrailLength: { value: trailLength },
        uStopDecay: { value: stopDecay },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec4 iMouse;
        uniform int iFrame;
        uniform sampler2D iPreviousFrame;
        uniform float uBrushSize;
        uniform float uBrushStrength;
        uniform float uFluidDecay;
        uniform float uTrailLength;
        uniform float uStopDecay;
        varying vec2 vUv;
        
        vec2 ur, U;
        
        float ln(vec2 p, vec2 a, vec2 b) {
            return length(p-a-(b-a)*clamp(dot(p-a,b-a)/dot(b-a,b-a),0.,1.));
        }
        
        vec4 t(vec2 v, int a, int b) {
            return texture2D(iPreviousFrame, fract((v+vec2(float(a),float(b)))/ur));
        }
        
        vec4 t(vec2 v) {
            return texture2D(iPreviousFrame, fract(v/ur));
        }
        
        float area(vec2 a, vec2 b, vec2 c) {
            float A = length(b-c), B = length(c-a), C = length(a-b), s = 0.5*(A+B+C);
            return sqrt(s*(s-A)*(s-B)*(s-C));
        }
        
        void main() {
            U = vUv * iResolution;
            ur = iResolution.xy;
            
            if (iFrame < 1) {
                float w = 0.5+sin(0.2*U.x)*0.5;
                float q = length(U-0.5*ur);
                gl_FragColor = vec4(0.1*exp(-0.001*q*q),0,0,w);
            } else {
                vec2 v = U,
                     A = v + vec2( 1, 1),
                     B = v + vec2( 1,-1),
                     C = v + vec2(-1, 1),
                     D = v + vec2(-1,-1);
                
                for (int i = 0; i < 8; i++) {
                    v -= t(v).xy;
                    A -= t(A).xy;
                    B -= t(B).xy;
                    C -= t(C).xy;
                    D -= t(D).xy;
                }
                
                vec4 me = t(v);
                vec4 n = t(v, 0, 1),
                    e = t(v, 1, 0),
                    s = t(v, 0, -1),
                    w = t(v, -1, 0);
                vec4 ne = .25*(n+e+s+w);
                me = mix(t(v), ne, vec4(0.15,0.15,0.95,0.));
                me.z = me.z - 0.01*((area(A,B,C)+area(B,C,D))-4.);
                
                vec4 pr = vec4(e.z,w.z,n.z,s.z);
                me.xy = me.xy + 100.*vec2(pr.x-pr.y, pr.z-pr.w)/ur;
                
                me.xy *= uFluidDecay;
                me.z *= uTrailLength;
                
                if (iMouse.z > 0.0) {
                    vec2 mousePos = iMouse.xy;
                    vec2 mousePrev = iMouse.zw;
                    vec2 mouseVel = mousePos - mousePrev;
                    float velMagnitude = length(mouseVel);
                    float q = ln(U, mousePos, mousePrev);
                    vec2 m = mousePos - mousePrev;
                    float l = length(m);
                    if (l > 0.0) m = min(l, 10.0) * m / l;
                    
                    float brushSizeFactor = 1e-4 / uBrushSize;
                    float strengthFactor = 0.03 * uBrushStrength;
                    
                    float falloff = exp(-brushSizeFactor*q*q*q);
                    falloff = pow(falloff, 0.5);
                    
                    me.xyw += strengthFactor * falloff * vec3(m, 10.);
                    
                    if (velMagnitude < 2.0) {
                        float distToCursor = length(U - mousePos);
                        float influence = exp(-distToCursor * 0.01);
                        float cursorDecay = mix(1.0, uStopDecay, influence);
                        me.xy *= cursorDecay;
                        me.z *= cursorDecay;
                    }
                }
                
                gl_FragColor = clamp(me, -0.4, 0.4);
            }
        }
      `,
    });

    const displayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        iFluid: { value: null },
        uDistortionAmount: { value: distortionAmount },
        uColor1: { value: new THREE.Vector3(...hexToRgb(color1)) },
        uColor2: { value: new THREE.Vector3(...hexToRgb(color2)) },
        uColor3: { value: new THREE.Vector3(...hexToRgb(color3)) },
        uColor4: { value: new THREE.Vector3(...hexToRgb(color4)) },
        uColorIntensity: { value: colorIntensity },
        uSoftness: { value: softness },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        uniform sampler2D iFluid;
        uniform float uDistortionAmount;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        uniform float uColorIntensity;
        uniform float uSoftness;
        varying vec2 vUv;

        // Función de ruido simple
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        void main() {
          vec2 fragCoord = vUv * iResolution;
          
          vec4 fluid = texture2D(iFluid, vUv);
          vec2 fluidVel = fluid.xy;
          
          float mr = min(iResolution.x, iResolution.y);
          vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;
          
          uv += fluidVel * (0.5 * uDistortionAmount);
          
          float d = -iTime * 0.5;
          float a = 0.0;
          for (float i = 0.0; i < 8.0; ++i) {
            a += cos(i - d - a * uv.x);
            d += sin(uv.y * i + a);
          }
          d += iTime * 0.5;
          
          float mixer1 = cos(uv.x * d) * 0.5 + 0.5;
          float mixer2 = cos(uv.y * a) * 0.5 + 0.5;
          float mixer3 = sin(d + a) * 0.5 + 0.5;
          
          float smoothAmount = clamp(uSoftness * 0.1, 0.0, 0.9);
          mixer1 = mix(mixer1, 0.5, smoothAmount);
          mixer2 = mix(mixer2, 0.5, smoothAmount);
          mixer3 = mix(mixer3, 0.5, smoothAmount);
          
          vec3 col = mix(uColor1, uColor2, mixer1);
          col = mix(col, uColor3, mixer2);
          col = mix(col, uColor4, mixer3 * 0.4);
          
          col *= uColorIntensity;

          // Añadir granulado
          float grain = noise(fragCoord * 0.5 + iTime * 10.0) * 0.1 - 0.05;
          col += grain;
          
          gl_FragColor = vec4(col, 0.9);
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const fluidPlane = new THREE.Mesh(geometry, fluidMaterial);
    const displayPlane = new THREE.Mesh(geometry, displayMaterial);

    let mouseX = 0, mouseY = 0;
    let prevMouseX = 0, prevMouseY = 0;
    let lastMoveTime = 0;

    const handleMouseMove = (e) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = e.clientX - rect.left;
      mouseY = rect.height - (e.clientY - rect.top);
      lastMoveTime = performance.now();
      fluidMaterial.uniforms.iMouse.value.set(
        mouseX,
        mouseY,
        prevMouseX,
        prevMouseY
      );
    };

    const handleMouseLeave = () => {
      fluidMaterial.uniforms.iMouse.value.set(0, 0, 0, 0);
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setSize(width, height);
      fluidMaterial.uniforms.iResolution.value.set(width, height);
      displayMaterial.uniforms.iResolution.value.set(width, height);

      fluidTarget1.setSize(width, height);
      fluidTarget2.setSize(width, height);
      frameCount = 0;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      const time = performance.now() * 0.001;
      fluidMaterial.uniforms.iTime.value = time;
      displayMaterial.uniforms.iTime.value = time;
      fluidMaterial.uniforms.iFrame.value = frameCount;

      if (performance.now() - lastMoveTime > 100) {
        fluidMaterial.uniforms.iMouse.value.set(0, 0, 0, 0);
      }

      fluidMaterial.uniforms.uBrushSize.value = brushSize;
      fluidMaterial.uniforms.uBrushStrength.value = brushStrength;
      fluidMaterial.uniforms.uFluidDecay.value = fluidDecay;
      fluidMaterial.uniforms.uTrailLength.value = trailLength;
      fluidMaterial.uniforms.uStopDecay.value = stopDecay;

      displayMaterial.uniforms.uDistortionAmount.value = distortionAmount;
      displayMaterial.uniforms.uColorIntensity.value = colorIntensity;
      displayMaterial.uniforms.uSoftness.value = softness;
      displayMaterial.uniforms.uColor1.value.set(...hexToRgb(color1));
      displayMaterial.uniforms.uColor2.value.set(...hexToRgb(color2));
      displayMaterial.uniforms.uColor3.value.set(...hexToRgb(color3));
      displayMaterial.uniforms.uColor4.value.set(...hexToRgb(color4));

      fluidMaterial.uniforms.iPreviousFrame.value = previousFluidTarget.texture;
      renderer.setRenderTarget(currentFluidTarget);
      renderer.render(fluidPlane, camera);

      displayMaterial.uniforms.iFluid.value = currentFluidTarget.texture;
      renderer.setRenderTarget(null);
      renderer.render(displayPlane, camera);

      const temp = currentFluidTarget;
      currentFluidTarget = previousFluidTarget;
      previousFluidTarget = temp;

      frameCount++;
      animationRef.current = requestAnimationFrame(animate);
    };

    sceneDataRef.current = {
      fluidTarget1,
      fluidTarget2,
      fluidMaterial,
      displayMaterial,
      geometry,
      handleMouseMove,
      handleMouseLeave,
      handleResize,
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);

      if (renderer.domElement && canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }

      fluidTarget1.dispose();
      fluidTarget2.dispose();
      fluidMaterial.dispose();
      displayMaterial.dispose();
      geometry.dispose();
      renderer.dispose();
    };
  }, [
    brushSize,
    brushStrength,
    distortionAmount,
    fluidDecay,
    trailLength,
    stopDecay,
    color1,
    color2,
    color3,
    color4,
    colorIntensity,
    softness,
  ]);

  return <div ref={canvasRef} className="shader-background" />;
};

export default ShaderBackground;