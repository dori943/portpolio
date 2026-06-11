/* ============================================================
   js/main.js — 인터랙션 & 상태 관리
   햄버거 메뉴 / 다크 모드 / 스크롤 / 타이핑 / Intersection Observer
   "이벤트 → 상태 변경 → 화면 업데이트" 흐름 3가지 이상
   ============================================================ */

/* ─────────────────────────────────────────────────────────────
   0. 유틸리티
   ───────────────────────────────────────────────────────────── */

/**
 * querySelector 단축 (항상 element 반환)
 * @param {string} selector
 * @param {Document|Element} [scope=document]
 */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/* ─────────────────────────────────────────────────────────────
   1. 다크 모드 토글
   상태 흐름: 버튼 클릭 → isDark 토글 → data-theme 변경 + 아이콘 교체 + localStorage 저장
   ───────────────────────────────────────────────────────────── */
const themeToggle  = document.getElementById('theme-toggle');
const themeIcon    = document.getElementById('theme-icon');
const htmlEl       = document.documentElement;

// 저장된 테마 불러오기 (로컬스토리지 → 시스템 기본값)
const getSavedTheme = () => {
  const saved = localStorage.getItem('portfolio-theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * 테마 적용 함수
 * @param {'light'|'dark'} theme
 */
const applyTheme = (theme) => {
  htmlEl.setAttribute('data-theme', theme);
  themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
  localStorage.setItem('portfolio-theme', theme);
};

// 초기 테마 적용
applyTheme(getSavedTheme());

// 버튼 클릭 이벤트 → 상태 토글
themeToggle.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ─────────────────────────────────────────────────────────────
   2. 햄버거 메뉴 토글
   상태 흐름: 버튼 클릭 → isOpen 토글 → 클래스/ARIA 변경
   ───────────────────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

let isMenuOpen = false;

/**
 * 메뉴 상태 적용
 * @param {boolean} open
 */
const applyMenu = (open) => {
  isMenuOpen = open;
  navLinks.classList.toggle('open', open);
  hamburger.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  // 메뉴 열릴 때 body 스크롤 고정
  document.body.style.overflow = open ? 'hidden' : '';
};

hamburger.addEventListener('click', () => {
  applyMenu(!isMenuOpen);
});

// 메뉴 링크 클릭 시 닫기
navLinks.addEventListener('click', (e) => {
  if (e.target.classList.contains('nav__link')) {
    applyMenu(false);
  }
});

// 바깥 영역 클릭 시 닫기
document.addEventListener('click', (e) => {
  if (isMenuOpen && !hamburger.contains(e.target) && !navLinks.contains(e.target)) {
    applyMenu(false);
  }
});

/* ─────────────────────────────────────────────────────────────
   3. 스크롤 이벤트 처리
   3-a. 네비게이션 스타일 변경 (60px 기준)
   3-b. 스크롤 탑 버튼 표시 (300px 기준)
   3-c. 현재 섹션 활성 링크 표시
   README: nav scrolled 기준 60px / scroll-top 기준 300px
   ───────────────────────────────────────────────────────────── */
const siteHeader  = document.getElementById('site-header');
const scrollTopBtn = document.getElementById('scroll-top');
const navLinkEls  = $$('.nav__link');
const sections    = $$('section[id]');

const NAV_SCROLL_THRESHOLD     = 60;   // 네비 스타일 변경 기준
const SCROLL_TOP_THRESHOLD     = 300;  // 스크롤 탑 버튼 기준

// 스크롤 상태 객체
const scrollState = {
  isNavScrolled  : false,
  isScrollTopShown: false,
  activeSection  : '',
};

/**
 * 스크롤 핸들러 — scroll 이벤트 → 상태 변경 → DOM 업데이트
 */
const handleScroll = () => {
  const scrollY = window.scrollY;

  // 3-a. 네비 스타일
  const shouldScrolled = scrollY > NAV_SCROLL_THRESHOLD;
  if (shouldScrolled !== scrollState.isNavScrolled) {
    scrollState.isNavScrolled = shouldScrolled;
    siteHeader.classList.toggle('scrolled', shouldScrolled);
  }

  // 3-b. 스크롤 탑 버튼
  const shouldShow = scrollY > SCROLL_TOP_THRESHOLD;
  if (shouldShow !== scrollState.isScrollTopShown) {
    scrollState.isScrollTopShown = shouldShow;
    scrollTopBtn.classList.toggle('visible', shouldShow);
  }

  // 3-c. 활성 섹션
  let current = '';
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 120) current = section.id;
  });

  if (current !== scrollState.activeSection) {
    scrollState.activeSection = current;
    navLinkEls.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', isActive);
    });
  }
};

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll(); // 초기 실행

// 3-d. 스크롤 탑 버튼 클릭
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─────────────────────────────────────────────────────────────
   4. 부드러운 스크롤 (앵커 링크)
   CSS scroll-behavior: smooth 가 기본이지만,
   nav-height 오프셋 보정을 JS로 처리
   ───────────────────────────────────────────────────────────── */
const NAV_HEIGHT = 64;

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const targetId = link.getAttribute('href').slice(1);
  if (!targetId) return;

  const target = document.getElementById(targetId);
  if (!target) return;

  e.preventDefault();
  const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
  window.scrollTo({ top, behavior: 'smooth' });
});

/* ─────────────────────────────────────────────────────────────
   5. Intersection Observer — 스크롤 애니메이션
   threshold: 0.2 (README에 명시)
   ───────────────────────────────────────────────────────────── */
// api.js에서도 사용하므로 전역 변수로 선언
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        target.classList.add('visible');
        revealObserver.unobserve(target); // 한 번만 실행
      }
    });
  },
  { threshold: 0.2 }
);

// 초기 .reveal 요소 등록
$$('.reveal').forEach((el) => revealObserver.observe(el));

/* ─────────────────────────────────────────────────────────────
   6. 스킬 바 애니메이션 (Intersection Observer)
   ───────────────────────────────────────────────────────────── */
const skillBarObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        const fill  = target.querySelector('.skill-card__fill');
        const width = fill.dataset.width;
        fill.style.width = `${width}%`;
        skillBarObserver.unobserve(target);
      }
    });
  },
  { threshold: 0.4 }
);

$$('.skill-card').forEach((card) => skillBarObserver.observe(card));

/* ─────────────────────────────────────────────────────────────
   7. 타이핑 애니메이션 (Hero 섹션)
   구조분해 할당 활용
   ───────────────────────────────────────────────────────────── */
const typedEl = document.getElementById('typed-role');
const roles   = [
  'Frontend Developer',
  'UI/UX Enthusiast',
  'JavaScript Learner',
  'Open Source Contributor',
];

// 타이핑 상태
const typingState = {
  roleIndex  : 0,
  charIndex  : 0,
  isDeleting : false,
};

/**
 * 타이핑 한 프레임 처리
 */
const typeStep = () => {
  const { roleIndex, charIndex, isDeleting } = typingState;
  const currentRole = roles[roleIndex];

  if (isDeleting) {
    // 지우기
    typedEl.textContent = currentRole.slice(0, charIndex - 1);
    typingState.charIndex -= 1;
  } else {
    // 타이핑
    typedEl.textContent = currentRole.slice(0, charIndex + 1);
    typingState.charIndex += 1;
  }

  let delay = isDeleting ? 60 : 100;

  if (!isDeleting && typingState.charIndex === currentRole.length) {
    // 완성 → 잠깐 대기 후 지우기 시작
    delay = 2000;
    typingState.isDeleting = true;
  } else if (isDeleting && typingState.charIndex === 0) {
    // 다 지웠음 → 다음 역할
    typingState.isDeleting = false;
    typingState.roleIndex  = (roleIndex + 1) % roles.length;
    delay = 400;
  }

  setTimeout(typeStep, delay);
};

// 페이지 로드 후 약간 대기 후 시작
setTimeout(typeStep, 800);

/* ─────────────────────────────────────────────────────────────
   8. 연도 자동 업데이트 (Footer)
   ───────────────────────────────────────────────────────────── */
const yearEl = document.getElementById('current-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
