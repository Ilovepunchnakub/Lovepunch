// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/hyperRenderer.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import {
  createMetricState,
  easeOutExpo,
  lerp,
  projectRelativisticStar,
  temperatureToRGB,
  updateMetricState
} from './hyperPhysics.js';
import {
  drawDeepSpaceBackdrop,
  drawLensingField,
  drawMetricShockfront
} from './hyperPostFx.js';

const STAR_DENSITY = 0.92;

function createStar() {
  const z = Math.random() * 2 - 1;
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.max(0.0001, 1 - z * z));

  return {
    dx: Math.cos(angle) * radius,
    dy: Math.sin(angle) * radius,
    dz: z,
    radiusSeed: Math.random(),
    temp: 2400 + Math.random() * 9200,
    twinkleSeed: Math.random() * Math.PI * 2,
    pulse: Math.random() * Math.PI * 2
  };
}

export function createHyperRenderer({ canvas }) {
  if (!canvas) throw new Error('hyperRenderer requires a canvas');

  let raf = null;
  let stars = [];
  let active = false;
  let lastTs = 0;
  let speed = 1;
  let prevSpeed = 1;
  let targetSpeed = 1;
  const metric = createMetricState();

  const setSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const resetStars = () => {
    const count = Math.floor(Math.min(2400, Math.max(1000, canvas.width * STAR_DENSITY)));
    stars = Array.from({ length: count }, createStar);
  };

  const drawStar = (ctx, star, camera) => {
    const projection = projectRelativisticStar({
      star,
      width: canvas.width,
      height: canvas.height,
      metric,
      camera
    });

    if (!projection.visible) return;

    const { x, y, intensity, shiftedTemp, size, blur, edge } = projection;

    if (x < -120 || x > canvas.width + 120 || y < -120 || y > canvas.height + 120) return;

    const rgb = temperatureToRGB(shiftedTemp);
    const alpha = Math.min(0.98, 0.1 + intensity * 0.09);

    ctx.save();
    ctx.shadowBlur = blur;
    ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(0.95, alpha * 0.9)})`;

    const corona = ctx.createRadialGradient(x, y, 0, x, y, size * (2 + (1 - edge) * 0.8));
    corona.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(1, alpha * 1.35)})`);
    corona.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.35})`);
    corona.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(x, y, size * (2 + (1 - edge) * 0.8), 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(1, alpha * 1.55)})`;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawFrame = (ts) => {
    if (!active) return;

    const ctx = canvas.getContext('2d');
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;

    const response = easeOutExpo(Math.min(1, dt * 7));
    speed = lerp(speed, targetSpeed, response * 0.42);
    const speedDelta = speed - prevSpeed;
    prevSpeed = speed;

    const camera = {
      focalLengthMm: 35,
      sensorMm: 36,
      focalPx: Math.min(canvas.width, canvas.height) * 0.82
    };

    const grain = 0.055 + metric.instability * 0.2;
    ctx.fillStyle = `rgba(2, 4, 12, ${grain})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawDeepSpaceBackdrop(ctx, canvas.width, canvas.height, metric);

    updateMetric(speed, speedDelta, dt);

    for (const star of stars) {
      drawStar(ctx, star, camera);
    }

    drawLensingField(ctx, canvas.width, canvas.height, metric);
    drawMetricShockfront(ctx, canvas.width, canvas.height, metric);

    raf = requestAnimationFrame(drawFrame);
  };

  const updateMetric = (speedValue, speedDelta, dt) => {
    updateMetricState({ state: metric, dt, speed: speedValue, speedDelta });
  };

  const setSpeed = (multiplier, immediate = false) => {
    targetSpeed = Math.max(0.05, multiplier);
    if (immediate) {
      speed = targetSpeed;
      prevSpeed = targetSpeed;
    }
  };

  const start = () => {
    active = true;
    cancelAnimationFrame(raf);
    lastTs = 0;
    speed = 1;
    prevSpeed = 1;
    targetSpeed = 1;
    setSize();
    resetStars();
    drawFrame(performance.now());
  };

  const stop = () => {
    active = false;
    cancelAnimationFrame(raf);
  };

  return {
    start,
    stop,
    setSpeed,
    resize: () => {
      if (!active) return;
      setSize();
      resetStars();
    },
    prepare: () => {
      setSize();
      resetStars();
    }
  };
}
