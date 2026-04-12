function pad(n, l = 2){ return String(n).padStart(l, "0"); }

function animateNumber(el, val){
  if(!el || el.textContent === val) return;
  el.textContent = val;
}

export function initCounter({ startDate, milestoneDays }){
  const cEls = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  };
  const mBar = document.getElementById("milestoneBar");
  const mLabel = document.getElementById("milestoneLabel");
  const mTrack = document.querySelector(".milestone-track");

  let rafId = 0;
  let lastSecond = -1;

  const tick = () => {
    const now = Date.now();
    const sec = Math.floor(now / 1000);

    if(sec !== lastSecond){
      lastSecond = sec;
      const diff = Math.max(0, now - startDate);
      const tot = Math.floor(diff / 1000);
      const d = Math.floor(tot / 86400);
      const h = Math.floor((tot % 86400) / 3600);
      const m = Math.floor((tot % 3600) / 60);
      const s = tot % 60;

      animateNumber(cEls.days, pad(d, 3));
      animateNumber(cEls.hours, pad(h));
      animateNumber(cEls.minutes, pad(m));
      animateNumber(cEls.seconds, pad(s));

      const pct = Math.min(100, (d / milestoneDays) * 100).toFixed(1);
      if(mBar) mBar.style.setProperty("--progress", `${pct}`);
      if(mLabel) mLabel.textContent = `${pct}%`;
      if(mTrack) mTrack.setAttribute("aria-valuenow", pct);
    }

    rafId = requestAnimationFrame(tick);
  };

  const onVisibility = () => {
    if(document.hidden && rafId){
      cancelAnimationFrame(rafId);
      rafId = 0;
      return;
    }
    if(!document.hidden && !rafId) rafId = requestAnimationFrame(tick);
  };

  document.addEventListener("visibilitychange", onVisibility, { passive: true });
  rafId = requestAnimationFrame(tick);
}
