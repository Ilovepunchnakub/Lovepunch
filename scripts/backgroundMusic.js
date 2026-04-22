// ===== จัดการเพลงพื้นหลัง + popup บังคับกดเพื่อเริ่มเพลง =====
import { qs } from './utils.js';
import { TEXT_CONTENT } from './siteTextContent.js';

export function createBackgroundMusicManager({ src, targetVolume = 0.42, fadeInMs = 1400 } = {}) {
  const audio = qs('bgmAudio');
  const gate = qs('bgmGate');
  const enableBtn = qs('bgmEnableBtn');

  let unlocked = false;
  let hasConsent = false;
  let loaderVisible = false;
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
    } catch (error) {
      console.warn(TEXT_CONTENT.app.bgm.warnMissing, error);
    }
  }

  function pauseNow() {
    if (!audio) return;
    cancelFade();
    audio.pause();
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

  function shouldPlayNow() {
    return unlocked && hasConsent && !loaderVisible && !document.hidden;
  }

  function syncPlayback() {
    if (shouldPlayNow()) {
      playSmooth();
      return;
    }
    pauseNow();
  }

  function markUnlocked() {
    unlocked = true;
    hasConsent = false;
    pauseNow();
    showConsentGate();
  }

  function init() {
    enableBtn?.addEventListener('click', async () => {
      hasConsent = true;
      hideConsentGate();
      syncPlayback();
    });

    document.addEventListener('app:loader-visibility', (event) => {
      loaderVisible = Boolean(event.detail?.visible);
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
