// ===== จัดการเพลงพื้นหลัง + popup ขอสิทธิ์เปิดเพลง =====
import { qs } from './utils.js';

const CONSENT_KEY = 'lovepunch_bgm_enabled';

export function createBackgroundMusicManager({ src, targetVolume = 0.42, fadeInMs = 1400 } = {}) {
  const audio = qs('bgmAudio');
  const gate = qs('bgmGate');
  const enableBtn = qs('bgmEnableBtn');

  let unlocked = false;
  let currentPage = 'home';
  let loaderVisible = false;
  let hasConsent = localStorage.getItem(CONSENT_KEY) === '1';
  let fadeRaf = 0;

  if (audio) {
    audio.src = src;
    audio.loop = true;
    audio.preload = 'auto';
    audio.playsInline = true;
    audio.volume = 0;
  }

  function cancelFade() {
    if (!fadeRaf) return;
    cancelAnimationFrame(fadeRaf);
    fadeRaf = 0;
  }

  function fadeInToTarget() {
    if (!audio) return;
    cancelFade();

    const from = Math.max(0, Math.min(audio.volume || 0, targetVolume));
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / fadeInMs);
      audio.volume = from + (targetVolume - from) * t;
      if (t < 1) fadeRaf = requestAnimationFrame(tick);
      else fadeRaf = 0;
    };

    fadeRaf = requestAnimationFrame(tick);
  }

  async function playSmooth() {
    if (!audio) return;
    try {
      await audio.play();
      fadeInToTarget();
    } catch {
      // ถ้า browser บล็อก autoplay จะให้ผู้ใช้กดปุ่มอีกครั้ง
      showConsentGate();
    }
  }

  function pauseNow() {
    if (!audio) return;
    cancelFade();
    audio.pause();
  }

  function shouldPlayNow() {
    return hasConsent && unlocked && currentPage === 'home' && !loaderVisible;
  }

  function syncPlayback() {
    if (shouldPlayNow()) {
      playSmooth();
      return;
    }
    pauseNow();
  }

  function showConsentGate() {
    if (!gate) return;
    gate.classList.add('show');
    gate.setAttribute('aria-hidden', 'false');
  }

  function hideConsentGate() {
    if (!gate) return;
    gate.classList.remove('show');
    gate.setAttribute('aria-hidden', 'true');
  }

  function markUnlocked() {
    unlocked = true;
    if (!hasConsent) {
      showConsentGate();
      return;
    }
    syncPlayback();
  }

  function init() {
    enableBtn?.addEventListener('click', async () => {
      hasConsent = true;
      localStorage.setItem(CONSENT_KEY, '1');
      hideConsentGate();
      syncPlayback();
    });

    document.addEventListener('app:loader-visibility', (event) => {
      loaderVisible = Boolean(event.detail?.visible);
      syncPlayback();
    });

    document.addEventListener('app:page-change', (event) => {
      currentPage = event.detail?.page || 'home';
      syncPlayback();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseNow();
      } else {
        syncPlayback();
      }
    });
  }

  return { init, markUnlocked, syncPlayback };
}
