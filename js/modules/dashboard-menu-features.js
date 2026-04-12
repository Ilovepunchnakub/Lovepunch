export function initMemoryPlaylist({ memoryChips, memoryQuote, storageKey, saveRemote, playSound }){
  const memMoments = [
    { label: "Moment 1", quote: "อยู่ด้วยกันนาน ๆ แบบนี้ทุกวันนะ" },
    { label: "Moment 2", quote: "ขอบคุณที่ทำให้ทุกวันสดใส" },
    { label: "Moment 3", quote: "เธอเก่งมาก และน่ารักมาก" }
  ];

  let activeMemoryIndex = Number(localStorage.getItem(storageKey) || 0);

  function setActiveMemory(index, syncRemote = false){
    const safe = Math.max(0, Math.min(memMoments.length - 1, index));
    activeMemoryIndex = safe;
    localStorage.setItem(storageKey, String(safe));
    if(memoryQuote) memoryQuote.textContent = `"${memMoments[safe].quote}"`;
    const chips = memoryChips?.querySelectorAll(".memory-chip") || [];
    chips.forEach((chip, i) => chip.classList.toggle("active", i === safe));
    if(syncRemote) saveRemote?.(safe);
  }

  if(memoryChips){
    const frag = document.createDocumentFragment();
    memMoments.forEach((m, i) => {
      const btn = document.createElement("button");
      btn.className = "memory-chip";
      btn.type = "button";
      btn.textContent = m.label;
      btn.addEventListener("click", () => {
        if(i === activeMemoryIndex) return;
        setActiveMemory(i, true);
        playSound?.("tap");
      }, { passive: true });
      frag.appendChild(btn);
    });
    memoryChips.appendChild(frag);
    setActiveMemory(activeMemoryIndex);
  }

  return { setActiveMemory };
}

export function bindBlessingButton({ blessingBtn, showToast, playSound }){
  const blessings = [
    "ขอให้วันนี้เป็นวันที่ดีนะ",
    "พักผ่อนเยอะ ๆ และยิ้มบ่อย ๆ",
    "ขอให้ทุกอย่างราบรื่นและใจฟู"
  ];

  blessingBtn?.addEventListener("click", () => {
    const idx = Math.floor(Math.random() * blessings.length);
    showToast(blessings[idx]);
    playSound?.("success");
  }, { passive: true });
}
