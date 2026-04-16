const TAP_TARGET = 10;
const RESET_MS = 12000;

export function attachSecretTapTest({ element, onTrigger, onProgress }) {
  if (!element || typeof onTrigger !== 'function') return () => {};

  let tapCount = 0;
  let resetTimer = null;

  const notifyProgress = () => {
    if (typeof onProgress === 'function') {
      onProgress({ count: tapCount, target: TAP_TARGET });
    }
  };

  const resetCounter = () => {
    tapCount = 0;
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
    notifyProgress();
  };

  const queueReset = () => {
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      resetCounter();
    }, RESET_MS);
  };

  const onTap = () => {
    tapCount += 1;
    notifyProgress();

    if (tapCount >= TAP_TARGET) {
      resetCounter();
      onTrigger();
      return;
    }

    queueReset();
  };

  element.addEventListener('pointerdown', onTap);

  return () => {
    resetCounter();
    element.removeEventListener('pointerdown', onTap);
  };
}
