// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/hyperPostFx.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

import { clamp } from './hyperPhysics.js';

export function drawDeepSpaceBackdrop(ctx, width, height, metric) {
  const cx = width * 0.5;
  const cy = height * 0.5;

  const vignette = ctx.createRadialGradient(cx, cy, width * 0.08, cx, cy, Math.max(width, height) * 0.72);
  vignette.addColorStop(0, `rgba(6, 12, 28, ${0.2 + metric.beta * 0.16})`);
  vignette.addColorStop(0.46, 'rgba(4, 8, 20, 0.82)');
  vignette.addColorStop(1, 'rgba(1, 2, 6, 0.96)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const cloud = ctx.createRadialGradient(
    cx + Math.sin(metric.phase * 0.24) * width * 0.06,
    cy + Math.cos(metric.phase * 0.19) * height * 0.04,
    width * 0.02,
    cx,
    cy,
    Math.max(width, height) * 0.58
  );
  cloud.addColorStop(0, `rgba(86, 146, 255, ${0.05 + metric.beta * 0.08})`);
  cloud.addColorStop(0.38, `rgba(57, 93, 210, ${0.04 + metric.instability * 0.5})`);
  cloud.addColorStop(1, 'rgba(2, 4, 10, 0)');
  ctx.fillStyle = cloud;
  ctx.fillRect(0, 0, width, height);
}

export function drawLensingField(ctx, width, height, metric) {
  const cx = width * 0.5;
  const cy = height * 0.5;
  const ringRadius = Math.min(width, height) * (0.082 + metric.beta * 0.05);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 4; i += 1) {
    const t = i / 3;
    const radius = ringRadius * (1 + t * 1.2);
    const alpha = clamp(0.15 - t * 0.032 + metric.instability * 0.38, 0.03, 0.3);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(166, 225, 255, ${alpha})`;
    ctx.lineWidth = Math.max(0.8, 2.4 - t * 1.5);
    ctx.stroke();
  }

  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, ringRadius * 2.8);
  halo.addColorStop(0, `rgba(198, 228, 255, ${0.18 + metric.shock * 0.24})`);
  halo.addColorStop(0.24, `rgba(126, 179, 255, ${0.08 + metric.instability * 0.55})`);
  halo.addColorStop(1, 'rgba(9, 12, 25, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, ringRadius * 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawMetricShockfront(ctx, width, height, metric) {
  const cx = width * 0.5;
  const cy = height * 0.5;

  const rippleAlpha = clamp(metric.shock * 0.32, 0, 0.28);
  if (rippleAlpha < 0.01) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let wave = 0; wave < 2; wave += 1) {
    const dist = (metric.phase * 82 + wave * 68) % Math.max(width, height);
    const r = Math.min(width, height) * 0.1 + dist * 0.35;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(195, 227, 255, ${rippleAlpha * (1 - wave * 0.35)})`;
    ctx.lineWidth = 1.2 + wave * 0.8;
    ctx.stroke();
  }
  ctx.restore();
}
