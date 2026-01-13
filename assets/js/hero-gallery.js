(function () {
  const heroGallery = document.querySelector('[data-hero-gallery]');
  if (!heroGallery) return;

  const stack = heroGallery.querySelector('.home-hero__gallery-stack');
  const mainImg = heroGallery.querySelector('[data-hero-gallery-main]');
  const dataItems = heroGallery.querySelectorAll('[data-hero-items] [data-src]');
  let heroItems = [];

  if (dataItems.length) {
    heroItems = Array.from(dataItems).map((node) => ({
      src: node.dataset.src,
      href: node.dataset.href || null,
      external: node.dataset.external === 'true'
    })).filter((item) => item && item.src);
  }

  if (!heroItems.length) {
    const dataImages = heroGallery.dataset.heroImages
      ? heroGallery.dataset.heroImages.split(',').map((src) => src.trim()).filter(Boolean)
      : [];
    const images = dataImages.length ? dataImages : (mainImg?.src ? [mainImg.src] : []);
    heroItems = images.map((src) => ({ src }));
  }

  if (!stack || !heroItems.length) return;

  stack.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const dockImages = [];
  const dockItems = [];

  const maxBoost = 0.6;
  const baseScale = 1 / (1 + maxBoost);
  stack.style.setProperty('--dock-base-scale', baseScale);
  const orderedItems = heroItems.slice();
  const preferredIndex = orderedItems.findIndex((item) => item.src.includes('main_img.png'));
  let preferred = null;
  if (preferredIndex > -1) {
    preferred = orderedItems.splice(preferredIndex, 1)[0];
  }
  for (let i = orderedItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [orderedItems[i], orderedItems[j]] = [orderedItems[j], orderedItems[i]];
  }
  if (preferred) {
    const insertAt = Math.floor(orderedItems.length / 2);
    orderedItems.splice(insertAt, 0, preferred);
  }
  const centerIndex = Math.floor(orderedItems.length / 2);

  orderedItems.forEach((item, index) => {
    const wrapper = item.href ? document.createElement('a') : document.createElement('div');
    wrapper.className = 'hero-dock__item';
    if (item.href) {
      wrapper.classList.add('is-link');
      wrapper.href = item.href;
      if (item.external) {
        wrapper.target = '_blank';
        wrapper.rel = 'noopener';
      }
    } else {
      wrapper.classList.add('is-static');
      wrapper.tabIndex = 0;
      wrapper.setAttribute('aria-label', 'In progress');
    }

    const img = new Image();
    img.src = item.src;
    img.alt = '';
    img.decoding = 'async';
    img.loading = index === centerIndex ? 'eager' : 'lazy';
    img.className = 'hero-dock__image';
    img.dataset.restScale = String(baseScale);
    if (index === centerIndex) img.classList.add('is-center');
    img.addEventListener('load', () => {
      wrapper.classList.add('is-loaded');
    }, { once: true });
    if (img.complete) {
      wrapper.classList.add('is-loaded');
    }
    wrapper.appendChild(img);
    if (!item.href) {
      const tooltip = document.createElement('span');
      tooltip.className = 'hero-dock__tooltip';
      tooltip.textContent = 'In progress';
      wrapper.appendChild(tooltip);
    }
    fragment.appendChild(wrapper);
    dockImages.push(img);
    dockItems.push(wrapper);
  });

  stack.appendChild(fragment);
  heroGallery.classList.add('is-ready');

  const setImageTransform = (item, scale, shiftX) => {
    item.style.transform = `translate3d(${shiftX}px, 0, 0) scale(${scale})`;
  };

  const updateOverlap = () => {
    if (dockItems.length < 2) return;
    const sizeValue = parseFloat(getComputedStyle(stack).getPropertyValue('--dock-size')) || 200;
    const scaledSize = sizeValue * baseScale;
    const width = stack.clientWidth || heroGallery.clientWidth;
    const totalWidth = dockItems.length * scaledSize;
    let overlap = 0;
    if (width > 0) {
      overlap = (totalWidth - width) / (dockItems.length - 1);
    }
    if (overlapMode === 'auto') {
      overlap += scaledSize * 0.08;
    }
    overlap = Math.min(Math.max(overlap, -scaledSize * 0.9), scaledSize * 0.9);
    stack.style.setProperty('--dock-overlap', `${overlap.toFixed(2)}px`);
  };

  const resetDock = () => {
    dockItems.forEach((item, index) => {
      const img = dockImages[index];
      const base = Number.parseFloat(img.dataset.restScale) || baseScale;
      setImageTransform(item, base, 0);
      item.style.zIndex = '1';
    });
  };

  const canHover = window.matchMedia('(hover: hover)').matches;
  const overlapMode = stack.dataset.overlapMode || 'manual';
  if (overlapMode === 'auto') {
    updateOverlap();
  }
  resetDock();

  let dockSize = 200;
  const updateDockParams = () => {
    const sizeValue = parseFloat(getComputedStyle(stack).getPropertyValue('--dock-size'));
    dockSize = Number.isFinite(sizeValue) ? sizeValue : 200;
  };
  updateDockParams();
  const getDockOverlap = () => {
    const overlapValue = parseFloat(getComputedStyle(stack).getPropertyValue('--dock-overlap'));
    return Number.isFinite(overlapValue) ? overlapValue : 0;
  };

  const updateDock = (pointerX) => {
    const overlap = getDockOverlap();
    const spacing = Math.max(dockSize - overlap, dockSize * 0.2);
    const influence = spacing * 1.5;
    const push = dockSize * 0.02;
    dockItems.forEach((item, index) => {
      const img = dockImages[index];
      const rect = item.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(pointerX - center);
      const t = Math.min(dist / influence, 1);
      const weight = Math.cos(t * Math.PI * 0.5) ** 2;
      const base = Number.parseFloat(img.dataset.restScale) || baseScale;
      const scale = base + weight * (1 - base);
      const shift = Math.sign(center - pointerX) * weight * push;
      setImageTransform(item, scale, shift);
      const depth = Math.round((influence - dist) * 10);
      item.style.zIndex = String(depth + index);
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
      const centerImg = dockItems[centerIndex];
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
      if (overlapMode === 'auto') {
        updateOverlap();
      }
      updateDockParams();
      if (currentX !== null) requestUpdate();
    });

    window.requestAnimationFrame(setPointerToCenter);
  } else {
    let scrollRaf = null;
    let hasCentered = false;
    const setScrollToCenter = () => {
      const centerImg = dockItems[centerIndex];
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
