export function initMusicPlayer({ userId, showToast }){
  const audio = document.getElementById('musicPlayer');
  const pickBtn = document.getElementById('musicPickBtn');
  const toggleBtn = document.getElementById('musicToggleBtn');
  const input = document.getElementById('musicFileInput');
  const status = document.getElementById('musicStatus');

  if(!audio || !pickBtn || !toggleBtn || !input || !status) return;

  const key = `soft-love-music-state:${userId}`;
  const savedVolume = Number(localStorage.getItem(`${key}:volume`) || 0.7);
  audio.volume = Number.isFinite(savedVolume) ? Math.min(1, Math.max(0, savedVolume)) : 0.7;

  const setStatus = (text) => { status.textContent = text; };
  const updateButton = () => {
    toggleBtn.textContent = audio.paused ? '▶️ เล่น' : '⏸️ หยุด';
  };

  pickBtn.addEventListener('click', () => input.click(), { passive: true });

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if(!file) return;

    const objectUrl = URL.createObjectURL(file);
    if(audio.dataset.blobUrl) URL.revokeObjectURL(audio.dataset.blobUrl);

    audio.src = objectUrl;
    audio.dataset.blobUrl = objectUrl;
    audio.load();

    setStatus(`กำลังใช้ไฟล์: ${file.name}`);
    updateButton();
    showToast?.('เลือกเพลงแล้ว 🎵');
  });

  toggleBtn.addEventListener('click', async () => {
    if(!audio.src){
      showToast?.('เลือกไฟล์เพลงก่อนนะ');
      return;
    }

    try{
      if(audio.paused){
        await audio.play();
      }else{
        audio.pause();
      }
      updateButton();
    }catch{
      showToast?.('เบราว์เซอร์บล็อกการเล่นอัตโนมัติ ลองกดอีกครั้ง');
    }
  });

  audio.addEventListener('play', updateButton, { passive: true });
  audio.addEventListener('pause', updateButton, { passive: true });
  audio.addEventListener('ended', updateButton, { passive: true });

  audio.addEventListener('volumechange', () => {
    localStorage.setItem(`${key}:volume`, String(audio.volume));
  }, { passive: true });

  updateButton();
}
