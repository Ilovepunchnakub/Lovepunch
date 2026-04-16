const TAP_TARGET = 10;
const RESET_MS = 7000;

export function attachSecretTapTest({ element, onTrigger }) {
  if (!element || typeof onTrigger !== 'function') return () => {};

  let tapCount = 0;
  let resetTimer = null;

  const resetCounter = () => {
    tapCount = 0;
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
  };

  const onTap = () => {
    tapCount += 1;

    if (tapCount >= TAP_TARGET) {
      resetCounter();
      onTrigger();
      return;
    }

    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      resetCounter();
    }, RESET_MS);
  };

  element.addEventListener('click', onTap);

  return () => {
    resetCounter();
    element.removeEventListener('click', onTap);
  };
}
