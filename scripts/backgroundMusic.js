// ===== จัดการเพลงพื้นหลัง + popup ขอสิทธิ์เปิดเพลง =====
import { qs } from './utils.js';
import { TEXT_CONTENT } from './siteTextContent.js';

export function createBackgroundMusicManager({ src, targetVolume = 0.42, fadeInMs = 1400 } = {}) {
  const audio = qs('bgmAudio');
  const gate = qs('bgmGate');
  const enableBtn = qs('bgmEnableBtn');
  const quickToggle = qs('bgmQuickToggle');

  let unlocked = false;
  let currentPage = 'home';
  let loaderVisible = false;
  let hasConsent = false;
  let fadeRaf = 0;
  let manualPause = false;

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
    } catch (error) {
      // ถ้าไม่มีไฟล์เพลงหรือเล่นไม่ได้ ให้คงสถานะ consent ไว้และไม่เด้ง popup ซ้ำ
      console.warn(TEXT_CONTENT.app.bgm.warnMissing, error);
    }
  }

  function pauseNow() {
    if (!audio) return;
    cancelFade();
    audio.pause();
  }

  function shouldPlayNow() {
    return hasConsent && unlocked && currentPage === 'home' && !loaderVisible && !manualPause;
  }

  function syncPlayback() {
    if (shouldPlayNow()) {
      playSmooth();
      return;
    }
    pauseNow();
  }


  function syncQuickToggle() {
    if (!quickToggle) return;
    quickToggle.hidden = !unlocked;
    if (!unlocked) return;
    if (!hasConsent) {
      quickToggle.textContent = TEXT_CONTENT.app.bgm.quickAsk;
      return;
    }
    quickToggle.textContent = manualPause ? TEXT_CONTENT.app.bgm.quickOff : TEXT_CONTENT.app.bgm.quickOn;
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
    hasConsent = false;
    manualPause = false;
    showConsentGate();
    syncQuickToggle();
    pauseNow();
  }

  function init() {
    enableBtn?.addEventListener('click', async () => {
      hasConsent = true;
      manualPause = false;
      hideConsentGate();
      syncQuickToggle();
      syncPlayback();
    });

    quickToggle?.addEventListener('click', () => {
      if (!hasConsent) {
        showConsentGate();
        return;
      }
      manualPause = !manualPause;
      syncQuickToggle();
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
