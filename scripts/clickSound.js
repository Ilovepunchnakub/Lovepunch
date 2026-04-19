const CLICKABLE_SELECTOR = 'button, .soft-btn, .ni, .fc, .profile-toggle';

export function initClickSound() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  let lastPlay = 0;

  const playCuteClick = () => {
    const now = performance.now();
    if (now - lastPlay < 40) return;
    lastPlay = now;

    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const time = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.15, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
    gain.connect(ctx.destination);

    const oscA = ctx.createOscillator();
    oscA.type = 'triangle';
    oscA.frequency.setValueAtTime(1046, time);
    oscA.frequency.exponentialRampToValueAtTime(1318, time + 0.08);

    const oscB = ctx.createOscillator();
    oscB.type = 'sine';
    oscB.frequency.setValueAtTime(1568, time);
    oscB.frequency.exponentialRampToValueAtTime(2093, time + 0.08);

    oscA.connect(gain);
    oscB.connect(gain);
    oscA.start(time);
    oscB.start(time);
    oscA.stop(time + 0.14);
    oscB.stop(time + 0.12);
  };

  document.addEventListener('pointerdown', (event) => {
    const clickable = event.target.closest(CLICKABLE_SELECTOR);
    if (!clickable) return;
    playCuteClick();
  });
}
