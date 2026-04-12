export function initLoginGate({ users, onLoginSuccess }){
  const gate = document.getElementById("pinGate");
  const appMain = document.getElementById("appMain");
  const form = document.getElementById("loginForm");
  const status = document.getElementById("loginStatus");
  const pinInput = document.getElementById("loginPin");
  const pinDots = Array.from(document.querySelectorAll("#pinDots .pin-dot"));
  const pinPad = document.getElementById("pinPad");
  const lockIndicator = document.getElementById("pinLockIndicator");
  const clearBtn = document.getElementById("pinClearBtn");
  const backspaceBtn = document.getElementById("pinBackspaceBtn");

  if(!gate || !appMain || !form || !status || !pinInput || !pinPad) return;

  const pinMap = new Map((users || []).map((u) => [String(u.pin || ""), u]));
  let isSubmitting = false;

  const setPinPadDisabled = (disabled) => {
    pinPad.querySelectorAll("button").forEach((btn) => {
      btn.disabled = disabled;
      btn.setAttribute("aria-disabled", String(disabled));
    });
  };

  const applyDotState = () => {
    const valueLength = pinInput.value.length;
    pinDots.forEach((dot, idx) => dot.classList.toggle("filled", idx < valueLength));
  };

  const resetLockState = () => {
    lockIndicator?.classList.remove("lock-state-error", "lock-state-success");
    lockIndicator?.classList.add("lock-state-locked");
  };

  const setErrorState = (message) => {
    isSubmitting = false;
    setPinPadDisabled(false);
    status.textContent = message;
    status.classList.add("error");
    status.classList.remove("success");
    pinPad.classList.remove("shake");
    void pinPad.offsetWidth;
    pinPad.classList.add("shake");
    lockIndicator?.classList.remove("lock-state-success", "lock-state-locked");
    lockIndicator?.classList.add("lock-state-error");
    setTimeout(resetLockState, 500);
  };

  const unlockApp = (user) => {
    isSubmitting = true;
    setPinPadDisabled(true);
    appMain.setAttribute("aria-hidden", "false");
    appMain.classList.add("reveal");
    document.body.classList.remove("locked");
    document.body.classList.add("unlock-success");
    gate.classList.add("hide");
    sessionStorage.setItem("soft-love-unlocked", "1");
    sessionStorage.setItem("soft-love-user-id", user.userId);
    status.textContent = "ปลดล็อกสำเร็จ";
    status.classList.remove("error");
    status.classList.add("success");
    lockIndicator?.classList.remove("lock-state-error", "lock-state-locked");
    lockIndicator?.classList.add("lock-state-success");
    if(navigator.vibrate) navigator.vibrate([25, 40, 60]);
    setTimeout(() => document.body.classList.remove("unlock-success"), 950);
    onLoginSuccess?.(user);
  };

  const cachedUserId = sessionStorage.getItem("soft-love-user-id");
  if(sessionStorage.getItem("soft-love-unlocked") === "1" && cachedUserId){
    const cachedUser = (users || []).find((u) => u.userId === cachedUserId) || users?.[0];
    if(cachedUser){
      unlockApp(cachedUser);
      return;
    }
  }

  const submitPin = () => {
    if(isSubmitting) return;

    const value = pinInput.value;
    if(value.length < 4){
      setErrorState("PIN ต้องมี 4 หลัก");
      return;
    }

    isSubmitting = true;
    setPinPadDisabled(true);

    const user = pinMap.get(value);
    if(!user){
      pinInput.value = "";
      applyDotState();
      setErrorState("PIN ไม่ถูกต้อง");
      return;
    }

    unlockApp(user);
  };

  pinPad.addEventListener("click", (event) => {
    if(isSubmitting) return;

    const target = event.target.closest("button");
    if(!target) return;

    const digit = target.dataset.digit;
    if(digit && pinInput.value.length < 4){
      pinInput.value += digit;
      applyDotState();
      status.textContent = "";
      status.classList.remove("error", "success");
      if(pinInput.value.length === 4) submitPin();
      return;
    }

    if(target === clearBtn){
      pinInput.value = "";
      applyDotState();
      return;
    }

    if(target === backspaceBtn){
      pinInput.value = pinInput.value.slice(0, -1);
      applyDotState();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if(isSubmitting) return;
    submitPin();
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    if(isSubmitting) return;
    if(event.key >= "0" && event.key <= "9" && pinInput.value.length < 4){
      pinInput.value += event.key;
      applyDotState();
      if(pinInput.value.length === 4) submitPin();
    }
    if(event.key === "Backspace"){
      pinInput.value = pinInput.value.slice(0, -1);
      applyDotState();
    }
    if(event.key === "Escape"){
      pinInput.value = "";
      applyDotState();
    }
  });

  applyDotState();
  setPinPadDisabled(false);
}
