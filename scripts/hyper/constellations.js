// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/hyper/constellations.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { DEPTH } from './constants.js';

const GROUPS = [
  [[-160, 100], [-80, 120], [0, 90], [120, 110], [180, 70]],
  [[-220, -120], [-120, -90], [-30, -130], [70, -80], [150, -118]],
  [[-70, 220], [10, 200], [100, 230], [170, 190]],
  [[-260, 30], [-170, 0], [-100, 20], [-10, -10], [70, 15]]
];

export function createConstellationLayer() {
  const segments = [];

  GROUPS.forEach((group, groupIndex) => {
    for (let i = 0; i < group.length - 1; i += 1) {
      const [x1, y1] = group[i];
      const [x2, y2] = group[i + 1];
      const z = -DEPTH * (0.15 + groupIndex * 0.08);
      segments.push(x1, y1, z, x2, y2, z);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(segments, 3));

  const material = new THREE.LineBasicMaterial({
    color: '#7fd4ff',
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending
  });

  return new THREE.LineSegments(geometry, material);
}
