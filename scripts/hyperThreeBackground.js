import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import { advanceStarfield } from './hyper/motion.js';
import {
  DEPTH,
  MAX_SPEED,
  MIN_SPEED,
  STAR_COUNT
} from './hyper/constants.js';
import { starFragmentShader, starVertexShader } from './hyper/shaders.js';
import { createStarBuffers } from './hyper/starfield.js';
import { createConstellationLayer } from './hyper/constellations.js';

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
  scene.fog = new THREE.FogExp2(0x02040c, 0.0012);

  const camera = new THREE.PerspectiveCamera(72, 1, 0.1, DEPTH + 500);
  camera.position.z = 7;

  const geometry = new THREE.BufferGeometry();
  const { positions, sizes, seeds } = createStarBuffers(STAR_COUNT);

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uSpeed: { value: 1 }
    },
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader
  });

  const stars = new THREE.Points(geometry, material);
  const constellations = createConstellationLayer();
  scene.add(stars);
  scene.add(constellations);

  const speedState = { value: 1 };
  let speedTween;
  let active = false;
  let raf = null;
  let lastTs = 0;

  function render(ts) {
    if (!active) return;

    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016);
    lastTs = ts;

    advanceStarfield({
      positions,
      starCount: STAR_COUNT,
      dt,
      speed: speedState.value,
      cameraZ: camera.position.z
    });

    geometry.attributes.position.needsUpdate = true;
    material.uniforms.uSpeed.value = speedState.value;

    stars.rotation.z += dt * 0.01;
    constellations.rotation.z -= dt * 0.006;
    constellations.material.opacity = 0.12 + Math.min(0.2, speedState.value * 0.01);
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
    const target = Math.min(MAX_SPEED, Math.max(MIN_SPEED, nextSpeed));
    speedTween?.kill();

    if (immediate) {
      speedState.value = target;
      return;
    }

    speedTween = gsap.to(speedState, {
      value: target,
      duration: 0.95,
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
