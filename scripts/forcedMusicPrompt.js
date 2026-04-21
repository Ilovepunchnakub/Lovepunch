import { qs, toast } from './utils.js';

const DEFAULT_AUDIO_PATH = 'assets/audio/background/main.mp3';

export function initForcedMusicPrompt() {
  const modal = qs('forcedMusicModal');
  const playBtn = qs('forcedMusicPlayBtn');
  if (!modal || !playBtn) return;

  const bgm = new Audio(DEFAULT_AUDIO_PATH);
  bgm.loop = true;
  bgm.preload = 'auto';

  function openPrompt() {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('forced-music-lock');
  }

  function closePrompt() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('forced-music-lock');
  }

  async function startMusic() {
    try {
      await bgm.play();
      closePrompt();
      toast('เริ่มเล่นเพลงแล้ว 💖');
    } catch {
      toast('ยังเล่นเพลงไม่ได้ ลองกดปุ่มอีกครั้งนะ');
    }
  }

  playBtn.addEventListener('click', startMusic);
  openPrompt();
}
