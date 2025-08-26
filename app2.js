// 부모 nav에 이벤트 위임으로 클릭 처리
document.querySelector('nav').addEventListener('click', (event) => {
  const link = event.target.closest('a.nav-link');
  if (!link) return; // nav-link가 아니면 무시
  event.preventDefault();
  loadContent(link.href, true);
});

// 페이지 콘텐츠 로드 및 전환 함수
function loadContent(url, addToHistory = true) {
  const contentEl = document.querySelector('#content');
  const oldInner = contentEl.querySelector('.content-inner.active');

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContent = doc.querySelector('#content').innerHTML;

      if (!oldInner) {
        // 첫 콘텐츠 로딩
        const newInner = document.createElement('div');
        newInner.classList.add('content-inner', 'active');
        newInner.innerHTML = newContent;
        contentEl.innerHTML = '';
        contentEl.appendChild(newInner);

        const newTitle = doc.querySelector('title');
        if (newTitle) document.title = newTitle.innerText;
        if (addToHistory) history.pushState(null, '', url);
        return;
      }

      // 기존 콘텐츠 있을 때 전환 애니메이션 처리
      const newInner = document.createElement('div');
      newInner.classList.add('content-inner');
      newInner.innerHTML = newContent;
      contentEl.appendChild(newInner);

      requestAnimationFrame(() => {
        oldInner.classList.remove('active');
        newInner.classList.add('active');
      });

      oldInner.addEventListener('transitionend', () => {
        oldInner.remove();
        const newTitle = doc.querySelector('title');
        if (newTitle) document.title = newTitle.innerText;
        if (addToHistory) history.pushState(null, '', url);
      }, { once: true });
    })
    .catch(console.error);
}

// 뒤로가기/앞으로가기 이벤트 처리
window.addEventListener('popstate', () => {
  loadContent(location.href, false);
});
