(function () {
  const heroGallery = document.querySelector('[data-hero-gallery]');
  if (!heroGallery) return;

  const stack = heroGallery.querySelector('.home-hero__gallery-stack');
  const mainImg = heroGallery.querySelector('[data-hero-gallery-main]');
  const dataImages = heroGallery.dataset.heroImages
    ? heroGallery.dataset.heroImages.split(',').map((src) => src.trim()).filter(Boolean)
    : [];
  const images = dataImages.length ? dataImages : (mainImg?.src ? [mainImg.src] : []);

  if (!stack || !images.length) return;

  stack.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const dockImages = [];

  const orderedImages = images.slice();
  const preferredIndex = orderedImages.findIndex((src) => src.includes('main_img.png'));
  let preferred = null;
  if (preferredIndex > -1) {
    preferred = orderedImages.splice(preferredIndex, 1)[0];
  }
  for (let i = orderedImages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [orderedImages[i], orderedImages[j]] = [orderedImages[j], orderedImages[i]];
  }
  if (preferred) {
    const insertAt = Math.floor(orderedImages.length / 2);
    orderedImages.splice(insertAt, 0, preferred);
  }
  const centerIndex = Math.floor(orderedImages.length / 2);

  orderedImages.forEach((src, index) => {
    const img = new Image();
    img.src = src;
    img.alt = '';
    img.decoding = 'async';
    img.loading = index === centerIndex ? 'eager' : 'lazy';
    img.className = 'hero-dock__image';
    img.dataset.restScale = '1';
    if (index === centerIndex) img.classList.add('is-center');
    img.addEventListener('load', () => {
      img.classList.add('is-loaded');
    }, { once: true });
    fragment.appendChild(img);
    dockImages.push(img);
  });

  stack.appendChild(fragment);
  heroGallery.classList.add('is-ready');

  const setImageTransform = (img, scale, shiftX) => {
    img.style.transform = `translate3d(${shiftX}px, 0, 0) scale(${scale})`;
  };

  const updateOverlap = () => {
    if (dockImages.length < 2) return;
    const sizeValue = parseFloat(getComputedStyle(stack).getPropertyValue('--dock-size')) || 200;
    const width = stack.clientWidth || heroGallery.clientWidth;
    const totalWidth = dockImages.length * sizeValue;
    let overlap = 0;
    if (totalWidth > width && width > 0) {
      overlap = (totalWidth - width) / (dockImages.length - 1);
    }
    overlap = Math.min(Math.max(overlap, 0), sizeValue * 0.9);
    stack.style.setProperty('--dock-overlap', `${overlap.toFixed(2)}px`);
  };

  const resetDock = () => {
    dockImages.forEach((img) => {
      const base = Number.parseFloat(img.dataset.restScale) || 1;
      setImageTransform(img, base, 0);
      img.style.zIndex = '1';
    });
  };

  const canHover = window.matchMedia('(hover: hover)').matches;
  if (canHover) {
    updateOverlap();
  }
  resetDock();

  let dockSize = 200;
  const maxBoost = 0.6;
  const updateDockParams = () => {
    const sizeValue = parseFloat(getComputedStyle(stack).getPropertyValue('--dock-size'));
    dockSize = Number.isFinite(sizeValue) ? sizeValue : 200;
  };
  updateDockParams();

  const updateDock = (pointerX) => {
    const influence = dockSize * 1.6;
    const push = dockSize * 0.12;
    dockImages.forEach((img, index) => {
      const rect = img.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(pointerX - center);
      const weight = Math.max(0, (influence - dist) / influence);
      const base = Number.parseFloat(img.dataset.restScale) || 1;
      const scale = base + weight * maxBoost;
      const shift = Math.sign(center - pointerX) * weight * push;
      setImageTransform(img, scale, shift);
      const depth = Math.round((influence - dist) * 10);
      img.style.zIndex = String(depth + index);
    });
  };

  if (canHover) {
    let currentX = null;
    let targetX = null;
    let rafId = null;
    const easing = 0.32;

    const animatePointer = () => {
      rafId = null;
      if (currentX === null || targetX === null) return;
      const delta = targetX - currentX;
      currentX += delta * easing;
      if (Math.abs(delta) < 0.5) {
        currentX = targetX;
      }
      updateDock(currentX);
      if (currentX !== targetX) {
        rafId = window.requestAnimationFrame(animatePointer);
      }
    };

    const requestUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(animatePointer);
    };

    const setPointerToCenter = () => {
      const centerImg = dockImages[centerIndex];
      if (!centerImg) return;
      const rect = centerImg.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      currentX = center;
      targetX = center;
      updateDock(center);
    };

    stack.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      if (currentX === null) currentX = targetX;
      requestUpdate();
    });

    stack.addEventListener('pointerenter', (event) => {
      targetX = event.clientX;
      if (currentX === null) currentX = targetX;
      requestUpdate();
    });

    window.addEventListener('resize', () => {
      updateOverlap();
      updateDockParams();
      if (currentX !== null) requestUpdate();
    });

    window.requestAnimationFrame(setPointerToCenter);
  } else {
    let scrollRaf = null;
    let hasCentered = false;
    const setScrollToCenter = () => {
      const centerImg = dockImages[centerIndex];
      if (!centerImg) return;
      const galleryRect = heroGallery.getBoundingClientRect();
      const imgRect = centerImg.getBoundingClientRect();
      const center = imgRect.left - galleryRect.left + heroGallery.scrollLeft + imgRect.width / 2;
      const target = center - heroGallery.clientWidth / 2;
      const maxScroll = heroGallery.scrollWidth - heroGallery.clientWidth;
      if (maxScroll <= 0) return false;
      heroGallery.scrollLeft = 0;
      heroGallery.scrollTo({ left: Math.max(0, Math.min(maxScroll, target)), behavior: 'auto' });
      return true;
    };
    const handleScroll = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = null;
        const rect = heroGallery.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        updateDock(centerX);
      });
    };
    const centerOnce = () => {
      if (hasCentered) return;
      if (!setScrollToCenter()) return;
      hasCentered = true;
      handleScroll();
    };
    const centerAfterImages = () => {
      const decodePromises = dockImages.map((img) => {
        if (typeof img.decode === 'function') {
          return img.decode().catch(() => null);
        }
        return Promise.resolve();
      });
      Promise.all(decodePromises).then(centerOnce);
    };

    heroGallery.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      updateDockParams();
      handleScroll();
    });
    window.addEventListener('load', centerOnce, { once: true });
    centerAfterImages();
  }
})();
