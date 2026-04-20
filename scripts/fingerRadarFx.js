// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/fingerRadarFx.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
export function createRadarFx(canvas) {
  if (!canvas) return { start: () => {}, stop: () => {}, pulseProgress: () => {} };

  const ctx = canvas.getContext('2d');
  let raf = null;
  let running = false;
  let phase = 0;
  let blips = [];
  let progress = 0;

  const spawnBlip = () => {
    blips.push({
      angle: Math.random() * Math.PI * 2,
      radius: 0.2 + Math.random() * 0.75,
      life: 1,
      speed: 0.004 + Math.random() * 0.007
    });
  };

  const draw = () => {
    if (!running) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.48;
    phase += 0.02;

    ctx.clearRect(0, 0, w, h);

    const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    base.addColorStop(0, 'rgba(255, 246, 251, 0.97)');
    base.addColorStop(0.65, 'rgba(255, 230, 242, 0.78)');
    base.addColorStop(1, 'rgba(255, 205, 226, 0.36)');
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    for (let ring = 1; ring <= 5; ring += 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * (ring / 5), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(207, 74, 131, ${0.08 + ring * 0.03})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const sweep = (phase * 2.1) % (Math.PI * 2);
    const beam = ctx.createConicGradient(sweep - 0.26, cx, cy);
    beam.addColorStop(0, 'rgba(255, 150, 202, 0)');
    beam.addColorStop(0.06, 'rgba(255, 150, 202, 0.1)');
    beam.addColorStop(0.16, 'rgba(255, 115, 184, 0.58)');
    beam.addColorStop(0.26, 'rgba(255, 150, 202, 0.16)');
    beam.addColorStop(0.34, 'rgba(255, 150, 202, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    if (Math.random() < 0.12 + progress * 0.0025 && blips.length < 14) {
      spawnBlip();
    }

    blips = blips.filter((blip) => blip.life > 0);
    for (const blip of blips) {
      blip.life -= blip.speed;
      const px = cx + Math.cos(blip.angle) * r * blip.radius;
      const py = cy + Math.sin(blip.angle) * r * blip.radius;
      const alpha = Math.max(0, blip.life);

      ctx.beginPath();
      ctx.arc(px, py, 2 + alpha * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(198, 39, 104, ${0.4 + alpha * 0.5})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, 7 + alpha * 12, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 106, 177, ${alpha * 0.45})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    const reflection = ctx.createLinearGradient(0, cy - r, 0, cy + r);
    reflection.addColorStop(0, 'rgba(255,255,255,0.2)');
    reflection.addColorStop(0.45, 'rgba(255,255,255,0.04)');
    reflection.addColorStop(1, 'rgba(255,255,255,0.16)');
    ctx.fillStyle = reflection;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    raf = requestAnimationFrame(draw);
  };

  return {
    start() {
      running = true;
      phase = 0;
      blips = [];
      cancelAnimationFrame(raf);
      draw();
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    pulseProgress(nextProgress) {
      progress = nextProgress;
      if (Math.random() < 0.7) spawnBlip();
    }
  };
}
