(function () {
  const body = document.body;
  const siteHeader = document.querySelector('.site-header');
  if (!siteHeader) return;

  const SCROLL_DELTA = 6;
  const SHOW_THRESHOLD = 10;
  const HIDE_AFTER = 120;
  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  const updateHeaderOnScroll = () => {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;
    const menuOpen = body.classList.contains('works-menu-open');

    if (currentY < SHOW_THRESHOLD || delta < -SCROLL_DELTA || menuOpen) {
      siteHeader.classList.remove('is-hidden');
    } else if (delta > SCROLL_DELTA && currentY > HIDE_AFTER) {
      siteHeader.classList.add('is-hidden');
    }

    lastScrollY = currentY;
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateHeaderOnScroll);
  }, { passive: true });

  window.addEventListener('resize', () => {
    lastScrollY = window.scrollY;
    siteHeader.classList.remove('is-hidden');
  });

  updateHeaderOnScroll();
})();
