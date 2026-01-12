(function () {
  const backToTop = document.getElementById('back-to-top');
  const moreInfoToggles = document.querySelectorAll('[data-more-info-toggle]');
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const scrollTargets = [
    document.getElementById('content'),
    document.scrollingElement,
    document.documentElement,
    document.body
  ].filter((target, index, array) => target && array.indexOf(target) === index);

  const getScrollTop = () => {
    const values = scrollTargets.map((target) => ('scrollTop' in target) ? target.scrollTop : 0);
    values.push(window.scrollY || window.pageYOffset || 0);
    return Math.max(...values);
  };

  const setScrollTop = (value) => {
    scrollTargets.forEach((target) => {
      if (!target) return;
      if (typeof target.scrollTo === 'function') {
        target.scrollTo(0, value);
      } else if ('scrollTop' in target) {
        target.scrollTop = value;
      }
    });
    window.scrollTo(0, value);
  };

  const animateScrollToTop = (duration = 1000) => {
    const startY = getScrollTop();
    if (startY <= 0) return;
    if (reduceMotionQuery.matches) {
      setScrollTop(0);
      return;
    }

    const startTime = performance.now();

    const step = (now) => {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setScrollTop(startY * (1 - eased));
      if (elapsed < 1) window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  };

  backToTop?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    animateScrollToTop(1000);
  });

  moreInfoToggles.forEach((button) => {
    const targetId = button.getAttribute('aria-controls');
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;

    const collapsedLabel = button.dataset.labelCollapsed || 'More info';
    const expandedLabel = button.dataset.labelExpanded || 'Less info';

    const getCollapsedValue = () => {
      const value = window.getComputedStyle(target).getPropertyValue('--more-info-collapsed');
      return (value && value.trim()) || '18rem';
    };

    const forceReflow = () => { void target.getBoundingClientRect(); };

    const onTransitionEnd = (event) => {
      if (event.propertyName !== 'max-height') return;
      target.removeEventListener('transitionend', onTransitionEnd);
      const expanded = button.getAttribute('aria-expanded') === 'true';
      target.style.maxHeight = expanded ? 'none' : '';
    };

    const animateExpand = () => {
      target.style.maxHeight = getCollapsedValue();
      forceReflow();
      target.classList.add('is-expanded');
      target.style.maxHeight = `${target.scrollHeight}px`;
    };

    const animateCollapse = () => {
      target.style.maxHeight = `${target.scrollHeight}px`;
      forceReflow();
      target.classList.remove('is-expanded');
      target.style.maxHeight = getCollapsedValue();
    };

    const setExpanded = (expanded, { animate } = { animate: true }) => {
      button.setAttribute('aria-expanded', String(expanded));
      button.textContent = expanded ? expandedLabel : collapsedLabel;

      target.removeEventListener('transitionend', onTransitionEnd);

      if (!animate || reduceMotionQuery.matches) {
        target.classList.toggle('is-expanded', expanded);
        target.style.maxHeight = expanded ? 'none' : '';
        return;
      }

      target.addEventListener('transitionend', onTransitionEnd);

      if (expanded) {
        animateExpand();
      } else {
        animateCollapse();
      }
    };

    setExpanded(false, { animate: false });

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      setExpanded(!expanded);
    });
  });
})();
