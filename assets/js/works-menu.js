(function () {
  const body = document.body;
  const siteHeader = document.querySelector('.site-header');
  const worksToggle = document.getElementById('works-toggle');
  const worksMenu = document.getElementById('works-menu');
  const worksItem = worksToggle ? worksToggle.closest('.nav-item--works') : null;
  if (!worksToggle || !worksMenu || !worksItem) return;

  const prefersHover = window.matchMedia('(hover: hover)');
  const mobileQuery = window.matchMedia('(max-width: 720px)');
  const tabletQuery = window.matchMedia('(max-width: 960px)');
  const CLOSE_DELAY = 400;
  let hideMenuTimer;

  const openWorksMenu = () => {
    window.clearTimeout(hideMenuTimer);
    worksMenu.classList.remove('is-hiding');
    worksItem.classList.add('is-open');
    worksMenu.setAttribute('aria-hidden', 'false');
    worksToggle.setAttribute('aria-expanded', 'true');
    body.classList.add('works-menu-open');
    siteHeader?.classList.remove('is-hidden');
  };

  const closeWorksMenu = () => {
    window.clearTimeout(hideMenuTimer);
    worksToggle.setAttribute('aria-expanded', 'false');

    if (!worksItem.classList.contains('is-open')) {
      worksMenu.classList.remove('is-hiding');
      worksMenu.setAttribute('aria-hidden', 'true');
      body.classList.remove('works-menu-open');
      siteHeader?.classList.remove('is-hidden');
      return;
    }

    const startClosing = () => {
      worksItem.classList.remove('is-open');
      worksMenu.classList.add('is-hiding');

      const finishClosing = () => {
        worksMenu.classList.remove('is-hiding');
        worksMenu.setAttribute('aria-hidden', 'true');
        body.classList.remove('works-menu-open');
        siteHeader?.classList.remove('is-hidden');
      };

      worksMenu.addEventListener('animationend', finishClosing, { once: true });
      worksMenu.addEventListener('webkitAnimationEnd', finishClosing, { once: true });
    };

    hideMenuTimer = window.setTimeout(startClosing, CLOSE_DELAY);
  };

  const toggleWorksMenu = () => {
    const isOpen = worksItem.classList.contains('is-open');
    if (isOpen) closeWorksMenu(); else {
      worksMenu.setAttribute('aria-hidden', 'false');
      openWorksMenu();
    }
  };

  worksMenu.removeAttribute('hidden');
  worksMenu.setAttribute('aria-hidden', 'true');

  worksToggle.addEventListener('click', (event) => {
    event.preventDefault();
    toggleWorksMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeWorksMenu();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!worksItem.classList.contains('is-open')) return;
    if (worksItem.contains(event.target)) return;
    closeWorksMenu();
  });

  worksMenu.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (link) {
      window.requestAnimationFrame(closeWorksMenu);
    }
  });

  const handleFocusIn = () => {
    worksMenu.setAttribute('aria-hidden', 'false');
    openWorksMenu();
  };

  const handleFocusOut = (event) => {
    const nextFocus = event.relatedTarget;
    if (nextFocus && worksItem.contains(nextFocus)) return;
    closeWorksMenu();
  };

  const updateFocusHandlers = () => {
    worksItem.removeEventListener('focusin', handleFocusIn);
    worksItem.removeEventListener('focusout', handleFocusOut);

    if (prefersHover.matches) {
      worksItem.addEventListener('focusin', handleFocusIn);
      worksItem.addEventListener('focusout', handleFocusOut);
    }
  };

  updateFocusHandlers();
  if (typeof prefersHover.addEventListener === 'function') {
    prefersHover.addEventListener('change', updateFocusHandlers);
  } else if (typeof prefersHover.addListener === 'function') {
    prefersHover.addListener(updateFocusHandlers);
  }

  if (prefersHover.matches) {
    worksItem.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch' || tabletQuery.matches) return;
      worksMenu.setAttribute('aria-hidden', 'false');
      openWorksMenu();
    });
    worksItem.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'touch' || tabletQuery.matches || mobileQuery.matches) return;
      closeWorksMenu();
    });
  }

  const handleDocumentPointerDown = (event) => {
    if (!mobileQuery.matches || !worksItem.classList.contains('is-open')) return;
    if (worksItem.contains(event.target)) return;
    closeWorksMenu();
  };

  mobileQuery.addEventListener('change', (event) => {
    document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
    if (event.matches) {
      closeWorksMenu();
      document.addEventListener('pointerdown', handleDocumentPointerDown, true);
    }
  });

  tabletQuery.addEventListener('change', (event) => {
    if (event.matches) closeWorksMenu();
  });

  if (mobileQuery.matches) {
    document.addEventListener('pointerdown', handleDocumentPointerDown, true);
  }
})();
