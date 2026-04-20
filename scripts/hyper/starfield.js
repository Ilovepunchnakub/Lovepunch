// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/hyper/starfield.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

import { DEPTH, SPREAD_X, SPREAD_Y } from './constants.js';

export function createStarBuffers(starCount) {
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const seeds = new Float32Array(starCount);

  for (let i = 0; i < starCount; i += 1) {
    respawnStar(positions, i, true);
    sizes[i] = 0.7 + Math.random() * 1.8;
    seeds[i] = Math.random();
  }

  return { positions, sizes, seeds };
}

export function respawnStar(positions, i, randomizeDepth = false) {
  const idx = i * 3;
  const radiusBias = Math.pow(Math.random(), 0.65);
  positions[idx] = (Math.random() - 0.5) * SPREAD_X * radiusBias;
  positions[idx + 1] = (Math.random() - 0.5) * SPREAD_Y * radiusBias;
  positions[idx + 2] = randomizeDepth
    ? -Math.random() * DEPTH - 40
    : -DEPTH - Math.random() * 150;
}
