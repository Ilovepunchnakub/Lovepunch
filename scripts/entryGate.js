// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/entryGate.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { qs, randomInt } from './utils.js';

export function initEntryGate({ onUnlocked, completionLoader }) {
  const gate = qs('entryGate');
  const button = qs('entryHeartBtn');
  const hint = qs('entryHint');

  let raf = null;
  let holding = false;
  let unlocked = false;
  let startAt = 0;
  const holdMs = 4500;
  let latestSparkleStep = -1;
  let activePointerId = null;
  let progress = 0;
  const tapThresholdMs = 220;
  let suppressNextClick = false;

  // บังคับให้กลับมาล็อกหน้าเข้าใช้งานใหม่ทุกครั้งที่รีเฟรช (เว้นแต่ระบุ skipEntry=1)
  const params = new URLSearchParams(window.location.search);
  const shouldBypassGate = params.get('skipEntry') === '1';

  if (params.get('forceEntry') === '1') {
    // ล้าง query หลังใช้งาน เพื่อไม่ให้ค้างใน URL
    const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
    window.history.replaceState({}, '', cleanUrl);
  }

  if (shouldBypassGate) {
    // ล้าง skipEntry หลังข้าม gate เพื่อให้การรีเฟรชครั้งถัดไปต้องปลดล็อกใหม่
    const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
    window.history.replaceState({}, '', cleanUrl);
    gate.classList.remove('show');
    onUnlocked?.();
    return {
      isLocked: () => false
    };
  }

  const block = (e) => e.preventDefault();
  ['contextmenu', 'selectstart', 'dragstart'].forEach((ev) => {
    gate.addEventListener(ev, block);
  });

  function spawnSparkle() {
    const sparkle = document.createElement('span');
    sparkle.className = 'entry-sparkle';
    sparkle.textContent = ['✨', '💖', '💫'][Math.floor(Math.random() * 3)];
    sparkle.style.left = `${12 + Math.random() * 76}%`;
    sparkle.style.top = `${14 + Math.random() * 72}%`;
    button.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 900);
  }

  function stopTick() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function setProgress(value) {
    progress = Math.max(0, Math.min(1, value));
    button.style.setProperty('--fill', `${(progress * 100).toFixed(2)}%`);
    button.style.setProperty('--charge', `${progress}`);
  }

  function finishUnlock() {
    if (unlocked) return;
    unlocked = true;
    stopTick();
    holding = false;
    activePointerId = null;
    button.classList.add('charged');
    navigator.vibrate?.(35);
    hint.textContent = 'เติมครบ 100% แล้ว';

    gate.classList.add('done');
    completionLoader?.show();

    // โหลดหลอกแบบสุ่ม 3-6 วินาทีให้เหมือนใช้งานจริง
    const fakeLoadingMs = randomInt(3000, 6000);
    const gateFadeMs = 560;

    setTimeout(() => {
      gate.classList.remove('show');
    }, gateFadeMs);

    setTimeout(() => {
      completionLoader?.hide();
      onUnlocked();
    }, gateFadeMs + fakeLoadingMs);
  }

  function tick(ts) {
    if (!holding) return;
    const elapsed = ts - startAt;
    setProgress(elapsed / holdMs);

    const sparkleStep = Math.floor(progress * 12);
    if (sparkleStep !== latestSparkleStep) {
      latestSparkleStep = sparkleStep;
      spawnSparkle();
    }

    if (progress >= 1) {
      finishUnlock();
      return;
    }

    raf = requestAnimationFrame(tick);
  }

  function startHold(e) {
    e.preventDefault();
    if (holding || unlocked || gate.classList.contains('done')) return;
    holding = true;
    startAt = performance.now() - progress * holdMs;
    latestSparkleStep = -1;
    hint.textContent = 'กำลังยืนยันตัวตนของคนน่ารัก...';
    button.classList.add('holding');
    raf = requestAnimationFrame(tick);
  }

  function stopHold() {
    if (!holding) return;
    holding = false;
    activePointerId = null;
    button.classList.remove('holding');
    stopTick();
    setProgress(0);
    latestSparkleStep = -1;
    hint.textContent = 'ปล่อยแล้วรีเซ็ตนะคั้บ กดค้างใหม่เพื่อเติมคั้บบ';
  }

  function addTapProgress() {
    if (unlocked || holding || gate.classList.contains('done')) return;
    setProgress(progress + 0.2);
    latestSparkleStep = -1;
    spawnSparkle();
    hint.textContent = `เติมแล้ว ${Math.round(progress * 100)}% กดเพิ่มได้อีกนะ`;
    if (progress >= 1) finishUnlock();
  }

  function handlePointerDown(e) {
    if (!e.isPrimary) return;
    activePointerId = e.pointerId;
    button.setPointerCapture?.(e.pointerId);
    suppressNextClick = false;
    startHold(e);
  }

  function handlePointerStop(e) {
    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    const wasHolding = holding;
    const holdDurationMs = performance.now() - startAt;

    if (wasHolding && holdDurationMs <= tapThresholdMs) {
      holding = false;
      activePointerId = null;
      button.classList.remove('holding');
      stopTick();
      addTapProgress();
      suppressNextClick = true;
      return;
    }

    stopHold();
  }

  button.addEventListener('pointerdown', handlePointerDown);
  button.addEventListener('pointerup', handlePointerStop);
  button.addEventListener('pointercancel', handlePointerStop);
  button.addEventListener('lostpointercapture', handlePointerStop);
  button.addEventListener('click', (e) => {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    if (e.detail !== 0) return;
    addTapProgress();
  });

  button.addEventListener('touchstart', block, { passive: false });
  button.addEventListener('contextmenu', block);
  button.addEventListener('dragstart', block);

  window.addEventListener('pointerup', handlePointerStop);
  window.addEventListener('pointercancel', handlePointerStop);
  window.addEventListener('blur', stopHold);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHold();
  });

  if (!window.PointerEvent) {
    button.addEventListener('mousedown', startHold);
    window.addEventListener('mouseup', stopHold);
    button.addEventListener('mouseleave', stopHold);
  }

  return {
    isLocked: () => gate.classList.contains('show')
  };
}
