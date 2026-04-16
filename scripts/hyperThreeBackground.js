import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

const STAR_COUNT = 2600;
const DEPTH = 2200;
const SPREAD = 980;

function respawnStar(positions, i) {
  const idx = i * 3;
  positions[idx] = (Math.random() - 0.5) * SPREAD;
  positions[idx + 1] = (Math.random() - 0.5) * SPREAD;
  positions[idx + 2] = -Math.random() * DEPTH - 40;
}

export function createHyperThreeBackground({ canvas }) {
  if (!canvas) throw new Error('createHyperThreeBackground requires a canvas');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03050f, 0.0016);

  const camera = new THREE.PerspectiveCamera(72, 1, 0.1, DEPTH + 400);
  camera.position.z = 7;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i += 1) {
    respawnStar(positions, i);
    sizes[i] = 0.8 + Math.random() * 1.2;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uSpeed: { value: 1 },
      uColorA: { value: new THREE.Color('#9ed5ff') },
      uColorB: { value: new THREE.Color('#ffd2ec') }
    },
    vertexShader: `
      attribute float size;
      uniform float uSpeed;
      varying float vMix;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float depth = clamp((-mvPosition.z) / 2200.0, 0.0, 1.0);
        vMix = depth;
        float stretch = 1.0 + uSpeed * 0.05;
        gl_PointSize = size * (250.0 / -mvPosition.z) * stretch;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vMix;

      void main() {
        vec2 p = gl_PointCoord - vec2(0.5);
        float d = length(p);
        if (d > 0.5) discard;
        float glow = smoothstep(0.5, 0.0, d);
        vec3 col = mix(uColorA, uColorB, vMix);
        gl_FragColor = vec4(col, glow * (0.45 + vMix * 0.8));
      }
    `
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);

  const speedState = { value: 1 };
  let speedTween;
  let active = false;
  let raf = null;
  let lastTs = 0;

  function render(ts) {
    if (!active) return;

    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016);
    lastTs = ts;

    const velocity = 60 + speedState.value * 240;
    const depthRatio = Math.min(1, speedState.value / 8);

    for (let i = 0; i < STAR_COUNT; i += 1) {
      const idx = i * 3;
      positions[idx + 2] += velocity * dt;

      if (positions[idx + 2] > camera.position.z + 8) {
        respawnStar(positions, i);
        continue;
      }

      const drift = (1 + depthRatio * 2.2) * dt;
      positions[idx] += positions[idx] * 0.00065 * drift;
      positions[idx + 1] += positions[idx + 1] * 0.00065 * drift;
    }

    geometry.attributes.position.needsUpdate = true;
    material.uniforms.uSpeed.value = speedState.value;

    stars.rotation.z += dt * 0.02;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function setSpeed(nextSpeed, immediate = false) {
    const target = Math.max(0.2, nextSpeed);
    speedTween?.kill();

    if (immediate) {
      speedState.value = target;
      return;
    }

    speedTween = gsap.to(speedState, {
      value: target,
      duration: 1.05,
      ease: 'power3.out'
    });
  }

  function prepare() {
    resize();
    renderer.setClearColor(0x000000, 0);
  }

  function start() {
    if (active) return;
    active = true;
    lastTs = 0;
    setSpeed(1, true);
    raf = requestAnimationFrame(render);
  }

  function stop() {
    active = false;
    cancelAnimationFrame(raf);
    speedTween?.kill();
  }

  return {
    prepare,
    start,
    stop,
    resize,
    setSpeed
  };
}
