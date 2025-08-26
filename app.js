// ---------------------------------------------
// SPA Navigation Script (app.js)
// ---------------------------------------------

// [fn] 메인 컨텐츠 로드 함수
// url: 불러올 주소
// addToHistory: true면 pushState, false면 popstate 처리
function loadContent(url, addToHistory = true, stateContent = null) {
  const content = document.querySelector('#content');
  const currentContent = content.querySelector('.content-inner');

  // 기존 콘텐츠에 페이드 아웃 애니메이션 추가
  if (currentContent) {
    currentContent.classList.add('fade-out');
    currentContent.classList.remove('fade-in');
  }

  // 애니메이션이 끝난 후 새로운 콘텐츠 로드
  setTimeout(() => {
    if (stateContent) {
      // [popstate] 히스토리에서 가져온 콘텐츠 사용
      content.innerHTML = stateContent;
    } else {
      // [fetch] 새로운 콘텐츠 로드
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.text();
        })
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // [content] 본문 영역 교체
          let newContent = doc.querySelector('#content').innerHTML;

          // .content-inner가 없으면 추가
          if (!newContent.includes('content-inner')) {
            newContent = `<div class="content-inner">${newContent}</div>`;
          }

          content.innerHTML = newContent;

          // [title] 문서 타이틀 변경
          const newTitle = doc.querySelector('title');
          if (newTitle) document.title = newTitle.innerText;

          // [history] pushState 처리
          if (addToHistory) {
            history.pushState({ url, content: newContent }, '', url);
          }
        })
        .catch(err => {
          console.error(err);
        });
    }

    // 새 콘텐츠에 페이드 인 애니메이션 추가
    const newContentInner = content.querySelector('.content-inner');
    if (newContentInner) {
      requestAnimationFrame(() => {
        newContentInner.classList.add('fade-in');
        newContentInner.classList.remove('fade-out');
      });
    }
  }, 400); // 페이드 아웃 애니메이션 시간(0.4초)과 동일
}

// ---------------------------------------------
// [event] 초기 페이지 상태 저장
// 첫 진입 시 현재 content를 history에 등록
// ---------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  const initialContent = document.querySelector('#content').innerHTML;
  history.replaceState(
    { url: location.href, content: initialContent },
    '',
    location.href
  );
});

// ---------------------------------------------
// [event] 네비게이션 클릭 처리 (이벤트 위임)
// .nav-link 클릭 시 기본 이동 막고 loadContent 호출
// 외부 링크(link.origin !== location.origin)는 제외
// ---------------------------------------------
document.addEventListener('click', e => {
  const link = e.target.closest('.nav-link');
  if (!link) return; // nav-link 아닌 경우 무시

  if (link.origin !== location.origin) return; // 외부 링크는 무시

  e.preventDefault();
  loadContent(link.href, true);
});

// ---------------------------------------------
// [event] 뒤로가기/앞으로가기(popstate)
// state.content가 있으면 그대로 복원,
// 없으면 다시 fetch해서 로드
// ---------------------------------------------
window.addEventListener('popstate', e => {
  const content = document.querySelector('#content');
  const currentContent = content.querySelector('.content-inner');

  // 기존 콘텐츠에 페이드 아웃 애니메이션 추가
  if (currentContent) {
    currentContent.classList.add('fade-out');
    currentContent.classList.remove('fade-in');
  }

  // 애니메이션이 끝난 후 콘텐츠 복원
  setTimeout(() => {
    if (e.state && e.state.content) {
      content.innerHTML = e.state.content;
    } else {
      loadContent(location.href, false);
    }

    // 새 콘텐츠에 페이드 인 애니메이션 추가
    const newContentInner = content.querySelector('.content-inner');
    if (newContentInner) {
      requestAnimationFrame(() => {
        newContentInner.classList.add('fade-in');
        newContentInner.classList.remove('fade-out');
      });
    }
  }, 400); // 페이드 아웃 애니메이션 시간(0.4초)과 동일
});
