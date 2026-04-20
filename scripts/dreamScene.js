import { qs } from './utils.js';

const svgMarkup = `<svg viewBox="0 0 600 552"><path d="M300,107.77C284.68,55.67,239.76,0,162.31,0,64.83,0,0,82.08,0,171.71c0,.48,0,.95,0,1.43-.52,19.5,0,217.94,299.87,379.69v0l0,0,.05,0,0,0,0,0v0C600,391.08,600.48,192.64,600,173.14c0-.48,0-.95,0-1.43C600,82.08,535.17,0,437.69,0,360.24,0,315.32,55.67,300,107.77" fill="#ee5282"/></svg>`;

let libsPromise = null;

async function loadDreamLibs() {
  if (libsPromise) return libsPromise;
  libsPromise = Promise.all([
    import('https://cdn.jsdelivr.net/npm/three@0.136.0/build/three.module.js'),
    import('https://cdn.jsdelivr.net/npm/three@0.136.0/examples/jsm/controls/OrbitControls.js'),
    import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js')
  ]).then(([threeMod, controlsMod, gsapMod]) => ({
    THREE: threeMod,
    OrbitControls: controlsMod.OrbitControls,
    gsap: gsapMod.gsap
  }));
  return libsPromise;
}

export function createDreamScene({ navigator }) {
  const pageId = 'dream';
  const root = qs('dreamSceneRoot');
  const closeBtn = qs('dreamClose');
  let teardown = () => {};

  async function mount() {
    if (!root) return;
    teardown();
    root.innerHTML = svgMarkup;

    const { THREE, OrbitControls, gsap } = await loadDreamLibs();
    if (!root || navigator.current() !== pageId) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = 500;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    root.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    const path = root.querySelector('path');
    const length = path.getTotalLength();
    const vertices = [];
    const tl = gsap.timeline({ repeat: -1, yoyo: true });

    for (let i = 0; i < length; i += 0.25) {
      const point = path.getPointAtLength(i);
      const vector = new THREE.Vector3(point.x, -point.y, 0);
      vector.x += (Math.random() - 0.5) * 30;
      vector.y += (Math.random() - 0.5) * 30;
      vector.z += (Math.random() - 0.5) * 70;
      vertices.push(vector);
      tl.from(vector, { x: 300, y: -276, z: 0, ease: 'power2.inOut', duration: gsap.utils.random(2, 5) }, i * 0.002);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const material = new THREE.PointsMaterial({ color: 0xee5282, blending: THREE.AdditiveBlending, size: 3 });
    const particles = new THREE.Points(geometry, material);
    particles.position.x -= 300;
    particles.position.y += 276;
    scene.add(particles);

    gsap.fromTo(scene.rotation, { y: -0.2 }, { y: 0.2, repeat: -1, yoyo: true, ease: 'power2.inOut', duration: 3 });

    let rafId = 0;
    const render = () => {
      rafId = requestAnimationFrame(render);
      geometry.setFromPoints(vertices);
      controls.update();
      renderer.render(scene, camera);
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);
    render();

    teardown = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      tl.kill();
      renderer.dispose();
      root.innerHTML = '';
      teardown = () => {};
    };
  }

  function open() {
    navigator.go(pageId).then(() => {
      if (navigator.current() === pageId) mount();
    });
  }

  function close({ navigate = true } = {}) {
    if (navigate && navigator.current() === pageId) navigator.go('home', { skipLoader: true });
    teardown();
  }

  function init() {
    closeBtn?.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navigator.current() === pageId) {
        event.preventDefault();
        close();
      }
    });
  }

  return { init, open, close, destroy: teardown };
}
