// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/hyperTimeline.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { MAX_SPEED } from './hyper/constants.js';
import { wait } from './utils.js';

const PREPARE_DELAY_MS = 5600;
const WELCOME_HOLD_MS = 1800;
const HOLD_MS = 5600;
const FADE_BUFFER_MS = 900;
const TRAVEL_MS = 1600;

export async function playHyperTimeline({
  messages,
  showMessage,
  setSpeed,
  onBeforeStart,
  onDone,
  isCancelled
}) {
  await wait(PREPARE_DELAY_MS);
  if (isCancelled()) return false;

  onBeforeStart();
  await wait(WELCOME_HOLD_MS);
  if (isCancelled()) return false;

  const maxStage = Math.max(1, messages.length - 1);

  for (let i = 0; i < messages.length; i += 1) {
    if (isCancelled()) return false;

    const progress = i / maxStage;
    const targetSpeed = 1 + progress * (MAX_SPEED - 1);

    setSpeed(targetSpeed);
    showMessage(messages[i], {
      holdMs: HOLD_MS,
      fadeInMs: 1200,
      fadeOutMs: 1100
    });

    await wait(HOLD_MS + FADE_BUFFER_MS);
    if (isCancelled()) return false;

    await wait(TRAVEL_MS);
  }

  onDone();
  return true;
}
