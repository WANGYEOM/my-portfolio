// Mobile header logo belt marquee (home only)
(function () {
  const SPEED_PX_PER_SEC = 200; // 이동 속도: 1초에 200px 오른쪽

  function ready(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(fn, 0);
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupBelt() {
    const belt = document.querySelector('.mobile-header .logo-belt');
    if (!belt) return; // 홈이 아니거나 데스크탑
    const track = belt.querySelector('.logo-belt-track');
    if (!track) return;

    // 기본 로고 원본 하나 확보
    const baseImg = track.querySelector('img, svg');
    if (!baseImg) return;

    let rafId = null;
    let offset = 0; // translateX(px), [-seqWidth, 0)
    let seqWidth = 0; // 단일 시퀀스(반복 단위)의 총 너비

    function cancel() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

    function clearTrack() {
      while (track.firstChild) track.removeChild(track.firstChild);
    }

    function buildSequence(targetWidth) {
      // targetWidth 이상이 될 때까지 로고를 반복해 하나의 시퀀스를 만든다.
      let w = 0;
      let count = 0;
      while (w < targetWidth || count < 8) {
        const clone = baseImg.cloneNode(true);
        track.appendChild(clone);
        w = track.scrollWidth;
        count++;
      }
    }

    function populate() {
      cancel();
      clearTrack();

      const containerWidth = Math.max(1, belt.clientWidth);
      // 단일 시퀀스를 컨테이너 너비 이상으로 구성
      buildSequence(containerWidth + 100);

      // 첫 시퀀스 너비 측정 (현재 트랙 전체가 첫 시퀀스)
      seqWidth = track.scrollWidth;
      if (seqWidth <= 0) seqWidth = containerWidth; // fallback

      // 무한 루프용으로 동일 시퀀스를 한 번 더 추가
      const firstSeqChildren = Array.from(track.children);
      firstSeqChildren.forEach(node => {
        track.appendChild(node.cloneNode(true));
      });

      // 시작 위치: 왼쪽 바깥(-seqWidth)에서 0까지 오른쪽으로 이동하면 자연스러운 반복
      offset = -seqWidth;

      // 애니메이션 시작
      start();
    }

    let lastTs = 0;
    function loop(ts) {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000; // sec
      lastTs = ts;

      // 오른쪽으로 이동: offset 증가
      offset += SPEED_PX_PER_SEC * dt;
      if (offset >= 0) offset -= seqWidth; // 범위를 [-seqWidth, 0)로 유지

      track.style.transform = `translateX(${offset}px)`;

      rafId = requestAnimationFrame(loop);
    }

    function start() {
      lastTs = 0;
      rafId = requestAnimationFrame(loop);
    }

    // 이미지가 로드된 후에 populate 수행 (치수 정확성)
    function ensureImagesReady() {
      const imgs = track.querySelectorAll('img');
      const pending = [];
      imgs.forEach(img => {
        if (img.complete) return;
        pending.push(new Promise(res => { img.addEventListener('load', res, { once: true }); img.addEventListener('error', res, { once: true }); }));
      });
      if (pending.length) {
        Promise.all(pending).then(populate);
      } else {
        populate();
      }
    }

    // 초기화 및 리사이즈 대응
    ensureImagesReady();
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(populate, 150);
    });

    // 네비 오버레이가 위에 올라와도 별도 처리는 필요 없음 (z-index 상 네비가 상위)
  }

  ready(setupBelt);
})();
