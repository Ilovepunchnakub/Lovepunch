// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/entryGate.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { CFG } from './config.js';
import { qs, randomInt } from './utils.js';

export function initEntryGate({ onUnlocked, completionLoader }) {
  const gate = qs('entryGate');
  const button = qs('entryHeartBtn');
  const hint = qs('entryHint');

  const entryGateText = CFG.UI_TEXT?.ENTRY_GATE ?? {};
  const gateTuning = CFG.ENTRY_GATE_TUNING ?? {};

  const getText = (key, fallback) => {
    const value = entryGateText[key];
    return typeof value === 'string' && value.trim() ? value : fallback;
  };

  const getProgressHint = (percent) => {
    const value = entryGateText.progressHint;
    if (typeof value === 'function') return value(percent);
    if (typeof value === 'string' && value.trim()) return value;
    return `เติมแล้ว ${percent}% กดเพิ่มได้อีกนะ`;
  };

  function applyGateStaticText() {
    const tagEl = gate.querySelector('.entry-gate-tag');
    const titleEl = gate.querySelector('.entry-gate-card h1');
    const subEl = gate.querySelector('.entry-gate-sub');

    if (tagEl) tagEl.textContent = getText('tag', tagEl.textContent || 'Heart Unloc');
    if (titleEl) titleEl.textContent = getText('title', titleEl.textContent || 'My heart is yours');
    if (subEl) subEl.textContent = getText('subtitle', subEl.textContent || 'กดค้างหรือแตะเพิ่มหัวใจให้เต็มคั้บ');

    button.setAttribute('aria-label', getText('buttonAriaLabel', 'Press heart...'));
    hint.textContent = getText('idleHint', 'กดค้างหรือแตะเพิ่มได้เลยคั้บเธอ...');
  }

  applyGateStaticText();

  const holdMs = Number(gateTuning.holdMs) > 500 ? Number(gateTuning.holdMs) : 2400;
  const tapThresholdMs = Number(gateTuning.tapThresholdMs) > 0 ? Number(gateTuning.tapThresholdMs) : 220;
  const tapIncrement = Number(gateTuning.tapIncrement) > 0 ? Number(gateTuning.tapIncrement) : 0.24;
  const sparkleSteps = Number(gateTuning.sparkleSteps) > 4 ? Number(gateTuning.sparkleSteps) : 14;

  let raf = null;
  let activePointerId = null;
  let holdStartedAt = 0;
  let holdBaseProgress = 0;
  let progress = 0;
  let latestSparkleStep = -1;
  let unlocked = false;
  let suppressNextClick = false;

  const params = new URLSearchParams(window.location.search);
  const shouldBypassGate = params.get('skipEntry') === '1';

  if (params.get('forceEntry') === '1') {
    const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
    window.history.replaceState({}, '', cleanUrl);
  }

  if (shouldBypassGate) {
    const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
    window.history.replaceState({}, '', cleanUrl);
    gate.classList.remove('show');
    onUnlocked?.();
    return { isLocked: () => false };
  }

  const block = (e) => e.preventDefault();
  ['contextmenu', 'selectstart', 'dragstart'].forEach((ev) => gate.addEventListener(ev, block));

  function stopTick() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function setProgress(value) {
    progress = Math.max(0, Math.min(1, value));
    button.style.setProperty('--fill', `${(progress * 100).toFixed(2)}%`);
    button.style.setProperty('--charge', progress.toFixed(3));
  }

  function spawnSparkle() {
    const sparkle = document.createElement('span');
    sparkle.className = 'entry-sparkle';
    sparkle.textContent = ['✨', '💖', '💫'][Math.floor(Math.random() * 3)];
    sparkle.style.left = `${12 + Math.random() * 76}%`;
    sparkle.style.top = `${14 + Math.random() * 72}%`;
    button.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 900);
  }

  function applyProgressFeedback() {
    if (progress >= 1) return;
    hint.textContent = getProgressHint(Math.round(progress * 100));
  }

  function finishUnlock() {
    if (unlocked) return;
    unlocked = true;
    activePointerId = null;
    stopTick();
    setProgress(1);
    button.classList.remove('holding');
    button.classList.add('charged');
    navigator.vibrate?.(35);
    hint.textContent = getText('doneHint', 'เติมครบ 100% แล้ว');

    gate.classList.add('done');
    completionLoader?.show();

    const fakeLoadingMs = randomInt(3000, 6000);
    const gateFadeMs = 560;

    setTimeout(() => gate.classList.remove('show'), gateFadeMs);
    setTimeout(() => {
      completionLoader?.hide();
      onUnlocked?.();
    }, gateFadeMs + fakeLoadingMs);
  }

  function updateHoldProgress(ts) {
    if (activePointerId === null || unlocked) return;

    const nextProgress = holdBaseProgress + (ts - holdStartedAt) / holdMs;
    setProgress(nextProgress);

    const sparkleStep = Math.floor(progress * sparkleSteps);
    if (sparkleStep !== latestSparkleStep) {
      latestSparkleStep = sparkleStep;
      spawnSparkle();
    }

    if (progress >= 1) {
      finishUnlock();
      return;
    }

    raf = requestAnimationFrame(updateHoldProgress);
  }

  function startHold(e) {
    if (unlocked || gate.classList.contains('done')) return;

    e.preventDefault();

    if (activePointerId !== null) return;

    activePointerId = e.pointerId ?? 1;
    holdStartedAt = performance.now();
    holdBaseProgress = progress;
    latestSparkleStep = -1;

    button.classList.add('holding');
    hint.textContent = getText('loadingHint', 'กำลังยืนยันตัวตนของคนน่ารัก...');

    stopTick();
    raf = requestAnimationFrame(updateHoldProgress);

    if (e.pointerId !== undefined) button.setPointerCapture?.(e.pointerId);
  }

  function stopHold(pointerId = null, { forceResetHint = false } = {}) {
    if (activePointerId === null) return;
    if (pointerId !== null && pointerId !== activePointerId) return;

    activePointerId = null;
    stopTick();
    button.classList.remove('holding');
    latestSparkleStep = -1;

    if (!unlocked) {
      if (forceResetHint && progress <= 0) {
        hint.textContent = getText('idleHint', 'กดค้างหรือแตะเพิ่มได้เลยคั้บเธอ...');
      } else if (progress > 0) {
        applyProgressFeedback();
      } else {
        hint.textContent = getText('resetHint', 'ปล่อยแล้วยังไม่เต็มน้า ลองกดค้างอีกนิดนะ 💗');
      }
    }
  }

  function addTapProgress() {
    if (unlocked || activePointerId !== null || gate.classList.contains('done')) return;
    setProgress(progress + tapIncrement);
    latestSparkleStep = -1;
    spawnSparkle();
    applyProgressFeedback();
    if (progress >= 1) finishUnlock();
  }

  function onPointerDown(e) {
    if (e.isPrimary === false) return;
    suppressNextClick = false;
    startHold(e);
  }

  function onPointerUpLike(e) {
    if (activePointerId === null) return;
    if (e.pointerId !== undefined && e.pointerId !== activePointerId) return;

    const holdDuration = performance.now() - holdStartedAt;
    const wasTap = holdDuration <= tapThresholdMs;

    stopHold(e.pointerId ?? null, { forceResetHint: true });

    if (wasTap) {
      suppressNextClick = true;
      addTapProgress();
    }
  }

  button.addEventListener('pointerdown', onPointerDown);
  button.addEventListener('pointerup', onPointerUpLike);
  button.addEventListener('pointercancel', onPointerUpLike);
  button.addEventListener('lostpointercapture', onPointerUpLike);

  window.addEventListener('pointerup', onPointerUpLike, { passive: true });
  window.addEventListener('pointercancel', onPointerUpLike, { passive: true });

  button.addEventListener('click', (e) => {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    if (e.detail !== 0) return;
    addTapProgress();
  });

  button.addEventListener('contextmenu', block);
  button.addEventListener('dragstart', block);
  window.addEventListener('blur', () => stopHold(null, { forceResetHint: true }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHold(null, { forceResetHint: true });
  });

  if (!window.PointerEvent) {
    button.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length > 1) return;
        startHold(e);
      },
      { passive: false }
    );
    window.addEventListener('touchend', () => stopHold(null, { forceResetHint: true }), { passive: true });
    window.addEventListener('touchcancel', () => stopHold(null, { forceResetHint: true }), { passive: true });
    button.addEventListener('mousedown', startHold);
    window.addEventListener('mouseup', () => stopHold(null, { forceResetHint: true }));
    button.addEventListener('mouseleave', () => stopHold(null, { forceResetHint: true }));
  }

  return {
    isLocked: () => gate.classList.contains('show')
  };
}
