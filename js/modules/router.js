const VIEW_SELECTOR = '.view-section[data-view]';

export function createRouter({ onChange } = {}){
  let currentView = 'dashboard';

  function setView(viewName){
    const sections = Array.from(document.querySelectorAll(VIEW_SELECTOR));
    if(!sections.length) return;
    const target = sections.find((s) => s.dataset.view === viewName) || sections[0];
    const nextView = target.dataset.view;

    sections.forEach((section) => {
      const isActive = section === target;
      section.classList.remove('view-enter', 'view-exit');
      if(isActive){
        section.style.display = 'block';
        requestAnimationFrame(() => {
          section.classList.add('active', 'view-enter');
        });
        section.setAttribute('aria-hidden', 'false');
      }else if(section.classList.contains('active')){
        section.classList.add('view-exit');
        section.classList.remove('active');
        section.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          if(!section.classList.contains('active')) section.style.display = 'none';
        }, 360);
      }else{
        section.classList.remove('active');
        section.setAttribute('aria-hidden', 'true');
        section.style.display = 'none';
      }
    });

    currentView = nextView;
    onChange?.(currentView);
  }

  return { setView, getCurrentView: () => currentView };
}
