/* ============================================================
   js/api.js — GitHub API 연동
   비동기 처리: fetch + async/await + try/catch
   상태: loading → success / error / empty
   ============================================================ */

// ── 상수 ──────────────────────────────────────────────────────
const GITHUB_API_BASE = 'https://api.github.com/users';
const REPOS_PER_PAGE  = 30;

// 언어별 색상 (GitHub 스타일)
const LANG_COLORS = {
  JavaScript : '#f1e05a',
  TypeScript : '#3178c6',
  Python     : '#3572A5',
  HTML       : '#e34c26',
  CSS        : '#563d7c',
  Java       : '#b07219',
  'C#'       : '#239120',
  Ruby       : '#701516',
  Go         : '#00ADD8',
  Rust       : '#dea584',
  PHP        : '#4F5D95',
  Swift      : '#F05138',
  Kotlin     : '#7F52FF',
  Shell      : '#89e051',
  Vue        : '#41b883',
};

// ── DOM 참조 ─────────────────────────────────────────────────
const projectsState = document.getElementById('projects-state');
const projectsGrid  = document.getElementById('projects-grid');
const usernameInput = document.getElementById('github-username');
const fetchBtn      = document.getElementById('fetch-repos-btn');

// ── 상태 렌더 함수 ────────────────────────────────────────────

/**
 * 로딩 상태 렌더링
 */
const renderLoading = () => {
  projectsState.innerHTML = `
    <div class="state-loading" aria-label="저장소 불러오는 중">
      <i class="fa-solid fa-spinner" aria-hidden="true"></i>
      <p class="state-loading__text">저장소를 불러오는 중입니다...</p>
    </div>
  `;
  projectsGrid.innerHTML = '';
};

/**
 * 에러 상태 렌더링
 * @param {string} message - 표시할 에러 메시지
 */
const renderError = (message) => {
  projectsState.innerHTML = `
    <div class="state-error" role="alert">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <p class="state-error__title">${message}</p>
      <button class="btn btn--outline btn--sm" id="retry-btn">
        <i class="fa-solid fa-rotate-right"></i> 다시 시도
      </button>
    </div>
  `;
  // 재시도 버튼 이벤트
  document.getElementById('retry-btn').addEventListener('click', () => {
    loadRepos(usernameInput.value.trim());
  });
};

/**
 * 빈 상태 렌더링
 */
const renderEmpty = () => {
  projectsState.innerHTML = `
    <div class="state-empty">
      <i class="fa-regular fa-folder-open" aria-hidden="true"></i>
      <p class="state-empty__text">표시할 공개 저장소가 없습니다.</p>
    </div>
  `;
};

/**
 * 단일 저장소를 카드 HTML로 변환 (map 활용)
 * @param {Object} repo - GitHub API 저장소 객체
 * @returns {string} 카드 HTML 문자열
 */
const repoToCard = (repo) => {
  const {
    name,
    description,
    html_url,
    homepage,
    stargazers_count,
    forks_count,
    language,
    updated_at,
  } = repo;

  const langColor = language ? (LANG_COLORS[language] ?? '#8892a4') : null;
  const langDot   = langColor
    ? `<span class="lang-dot" style="background:${langColor}" aria-hidden="true"></span>`
    : '';
  const langText = language
    ? `<span>${langDot}${language}</span>`
    : '';

  const homepageLink = homepage
    ? `<a href="${homepage}" target="_blank" rel="noopener noreferrer" class="project-card__link" aria-label="${name} 데모 사이트">
         <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> 데모
       </a>`
    : '';

  const updatedDate = new Date(updated_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return `
    <article class="project-card reveal" role="listitem">
      <div class="project-card__header">
        <i class="fa-solid fa-book project-card__icon" aria-hidden="true"></i>
        <h3 class="project-card__name">${name}</h3>
      </div>
      <p class="project-card__desc">
        ${description ?? '설명이 없는 저장소입니다.'}
      </p>
      <div class="project-card__meta">
        ${langText}
        <span>
          <i class="fa-regular fa-star" aria-hidden="true"></i>
          ${stargazers_count.toLocaleString()}
        </span>
        <span>
          <i class="fa-solid fa-code-fork" aria-hidden="true"></i>
          ${forks_count.toLocaleString()}
        </span>
        <span>
          <i class="fa-regular fa-clock" aria-hidden="true"></i>
          ${updatedDate}
        </span>
      </div>
      <div class="project-card__links">
        <a href="${html_url}" target="_blank" rel="noopener noreferrer" class="project-card__link" aria-label="${name} GitHub 저장소">
          <i class="fa-brands fa-github" aria-hidden="true"></i> 코드 보기
        </a>
        ${homepageLink}
      </div>
    </article>
  `;
};

/**
 * 성공 상태 렌더링 — repos 배열을 카드로 변환
 * @param {Array} repos
 */
const renderRepos = (repos) => {
  projectsState.innerHTML = '';
  // map: 각 repo 객체 → 카드 HTML
  const cardsHTML = repos.map(repoToCard).join('');
  projectsGrid.innerHTML = cardsHTML;

  // 카드에 스크롤 애니메이션 적용 (새로 삽입된 요소에도)
  requestAnimationFrame(() => {
    projectsGrid.querySelectorAll('.reveal').forEach((el) => {
      revealObserver.observe(el);
    });
  });
};

// ── 메인 API 호출 함수 ────────────────────────────────────────

/**
 * GitHub repos 불러오기
 * 이벤트 → 로딩 상태 → API 호출 → 성공/에러/빈 상태
 * @param {string} username
 */
const loadRepos = async (username) => {
  if (!username) {
    renderError('GitHub 아이디를 입력해 주세요.');
    return;
  }

  // 상태 1: 로딩
  renderLoading();
  fetchBtn.disabled = true;

  try {
    const url      = `${GITHUB_API_BASE}/${encodeURIComponent(username)}/repos?per_page=${REPOS_PER_PAGE}&sort=updated`;
    const response = await fetch(url);

    if (response.status === 403) {
      // 레이트 리밋 처리
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const resetDate = resetTime
        ? new Date(parseInt(resetTime, 10) * 1000).toLocaleTimeString('ko-KR')
        : '잠시 후';
      throw new Error(`GitHub API 요청 한도 초과. ${resetDate}에 다시 시도해 주세요.`);
    }

    if (response.status === 404) {
      throw new Error(`'${username}' 사용자를 찾을 수 없습니다.`);
    }

    if (!response.ok) {
      throw new Error(`요청 실패 (${response.status}). 잠시 후 다시 시도해 주세요.`);
    }

    const repos = await response.json();

    // fork 제외, 공개 저장소만 (filter 활용)
    const ownRepos = repos.filter((repo) => !repo.fork);

    if (ownRepos.length === 0) {
      // 상태 3: 빈 상태
      renderEmpty();
    } else {
      // 상태 2: 성공
      renderRepos(ownRepos);
    }

  } catch (error) {
    // 상태 4: 에러
    console.error('[GitHub API]', error);
    renderError(error.message ?? '프로젝트를 불러올 수 없습니다.');
  } finally {
    fetchBtn.disabled = false;
  }
};

// ── 이벤트 바인딩 ─────────────────────────────────────────────

// 버튼 클릭
fetchBtn.addEventListener('click', () => {
  loadRepos(usernameInput.value.trim());
});

// Enter 키
usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    loadRepos(usernameInput.value.trim());
  }
});

// ── 초기 로드 ─────────────────────────────────────────────────
// revealObserver는 main.js에서 전역으로 선언됨
// DOMContentLoaded 이후 api.js가 defer로 로드되므로 main.js 이후 실행
// → window.revealObserver에 의존하지 않고 별도 처리
document.addEventListener('DOMContentLoaded', () => {
  loadRepos(usernameInput.value.trim());
});
