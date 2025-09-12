// ---------------------------------------------
// SPA Navigation Script (app.js)
// ---------------------------------------------

const routes = {
  '/': '/index.html',
  '/wellbuy': '/pages/wellbuy.html',
  '/democracy': '/pages/democracy.html',
  '/tashu': '/pages/tashu.html',
  '/immuone': '/pages/immuone.html',
  '/shanghai-branding': '/pages/shanghai-branding.html',
  '/loop': '/pages/loop.html',
  '/lego': '/pages/lego.html',
  '/naming-process': '/pages/naming-process.html',
  '/about': '/pages/about.html',
  '/others': '/pages/others.html'
};

// fade-in 적용 함수
function applyFadeIn() {
  const inner = document.querySelector('.content-inner');
  if (inner) {
    inner.classList.remove('fade-out');
    // 다음 프레임에서 fade-in 추가
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inner.classList.add('fade-in');
      });
    });
  }
}

// [fn] 메인 컨텐츠 로드 함수
// url: 불러올 주소
// addToHistory: true면 pushState, false면 popstate 처리
function loadContent(url, addToHistory = true, stateContent = null) {
  const content = document.querySelector('#content');
  const currentContent = content.querySelector('.content-inner');
  // fade-out 적용 (기존 컨텐츠 숨김)
  if (currentContent) {
    currentContent.classList.add('fade-out');
    currentContent.classList.remove('fade-in');
  }
  // 400ms 후 새 컨텐츠 교체 및 fade-in 적용
  setTimeout(() => {
    if (stateContent) {
      content.innerHTML = stateContent;
      applyFadeIn();
    } else {
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.text();
        })
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          let newContent = doc.querySelector('#content').innerHTML;
          if (!newContent.includes('content-inner')) {
            newContent = `<div class="content-inner">${newContent}</div>`;
          }
          content.innerHTML = newContent;
          applyFadeIn();
        });
    }
    // pushState 처리
    if (addToHistory) {
      history.pushState(null, '', url);
    }
  }, 400); // 400ms는 style.css에서 지정한 transition 시간에 맞춤
}


// ---------------------------------------------
// [event] 초기 페이지 상태 저장
// 첫 진입 시 현재 content를 history에 등록
// ---------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname === '/' ? '/index.html' : window.location.pathname;
  loadContent(path, false);
  //const initialPath = location.pathname || '/index.html';
  //loadContent(initialPath, false);

  // 해시 관련 조건 다 제거

  // 네비게이션 활성화 상태 초기화
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    // location.href 대신 pathname으로 비교해야 할 수 있음
    if (link.pathname === location.pathname) {
      link.classList.add('active');
    }
  });
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

  if (currentContent) {
    currentContent.classList.add('fade-out');
    currentContent.classList.remove('fade-in');
    currentContent.classList.remove('active'); // active 제거
  }

  setTimeout(() => {
    if (e.state && e.state.content) {
      content.innerHTML = e.state.content;
    } else {
      loadContent(location.pathname, false);
      return; // loadContent가 애니메이션까지 처리함
    }

    const newContentInner = content.querySelector('.content-inner');
    if (newContentInner) {
      requestAnimationFrame(() => {
        newContentInner.classList.add('fade-in');
        newContentInner.classList.remove('fade-out');
      });
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.pathname === location.pathname) {
        link.classList.add('active');
      }
    });
  }, 400);
});





// ---------------------------------------------
// [fn] 페이지 맨 위로 부드럽게 스크롤
// ---------------------------------------------
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

// ---------------------------------------------
// [event] back-to-top 버튼 클릭 처리
// ---------------------------------------------
document.getElementById('back-to-top').addEventListener('click', e => {
  e.preventDefault(); // 기본 동작 막기
  scrollToTop(); // 페이지 맨 위로 이동
});