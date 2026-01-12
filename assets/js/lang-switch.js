(function () {
  const langButtons = Array.from(document.querySelectorAll('.lang-switch__btn'));
  const langSwitches = Array.from(document.querySelectorAll('.lang-switch'));
  if (!langButtons.length || !langSwitches.length) return;

  const langHideTimers = new Map();
  const prefersHover = window.matchMedia('(hover: hover)');
  const CLOSE_DELAY = 400;

  const setActiveLang = (lang) => {
    langButtons.forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  };

  const clearLangTimer = (sw) => {
    const timer = langHideTimers.get(sw);
    if (timer) {
      window.clearTimeout(timer);
      langHideTimers.delete(sw);
    }
  };

  const closeLangSwitches = (except) => {
    langSwitches.forEach((sw) => {
      if (sw !== except) {
        clearLangTimer(sw);
        sw.classList.remove('is-open');
      }
    });
  };

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang || 'en';
      setActiveLang(lang);
      closeLangSwitches();
    });
  });

  langSwitches.forEach((sw) => {
    sw.addEventListener('click', (event) => {
      if (event.target.closest('.lang-switch__btn')) return;
      const willOpen = !sw.classList.contains('is-open');
      closeLangSwitches();
      if (willOpen) sw.classList.add('is-open');
    });

    if (prefersHover.matches) {
      sw.addEventListener('pointerenter', () => {
        clearLangTimer(sw);
        closeLangSwitches(sw);
        sw.classList.add('is-open');
      });
      sw.addEventListener('pointerleave', () => {
        clearLangTimer(sw);
        const timer = window.setTimeout(() => {
          sw.classList.remove('is-open');
          langHideTimers.delete(sw);
        }, CLOSE_DELAY);
        langHideTimers.set(sw, timer);
      });
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.lang-switch')) return;
    closeLangSwitches();
  });

  const initialLang = langButtons.find((btn) => btn.classList.contains('is-active'))?.dataset.lang || 'en';
  setActiveLang(initialLang);
})();
