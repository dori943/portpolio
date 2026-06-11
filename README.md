# 📁 Dev Portfolio

> 외부 프레임워크 없이 HTML, CSS, JavaScript만으로 제작한 반응형 포트폴리오 웹사이트입니다.

---

## 🚀 배포 URL

**GitHub Pages:** `https://dori943.github.io/portpolio/`

---

## 🛠 사용 기술

| 기술 | 역할 |
|------|------|
| HTML5 | 시맨틱 마크업, 접근성(ARIA) |
| CSS3 | CSS Variables, Flexbox, Grid, 반응형, 다크모드 |
| JavaScript (ES6+) | DOM 조작, 이벤트, 비동기 API, 상태 관리 |
| GitHub REST API | 저장소 목록 동적 렌더링 |
| Font Awesome 6 | 아이콘 |
| Google Fonts (JetBrains Mono, Inter) | 타이포그래피 |

---

## 📂 프로젝트 구조

```
portfolio/
├── index.html          # 구조 = 메인 페이지 (시맨틱 마크업)
├── css/
│   └── style.css       # 표현 = 스타일 (CSS Variables, 반응형, 다크모드)
├── js/
│   ├── main.js         # 동작 = 인터랙션 (테마, 메뉴, 스크롤, 애니메이션)
│   ├── api.js          # 데이터 = GitHub API 연동 (비동기, 상태 관리)
│   └── form.js         # 검증 = 폼 유효성 검사
├── images/
│   └── profile.jpg     
└── README.md
```

---

## ✅ 구현된 기능

### 인터랙션
- **다크 모드 토글** — localStorage에 저장, 새로고침 후 유지
- **햄버거 메뉴** — 모바일에서 토글, 바깥 클릭 시 닫힘
- **부드러운 스크롤** — nav-height(64px) 오프셋 보정
- **스크롤 탑 버튼** — 300px 이상 스크롤 시 표시 (README 명시)
- **네비 스타일 변경** — 60px 이상 스크롤 시 배경/그림자 추가 (README 명시)
- **타이핑 애니메이션** — Hero 섹션 역할명 순환
- **스크롤 애니메이션** — Intersection Observer, threshold 0.2 (README 명시)
- **스킬 바 애니메이션** — 섹션 진입 시 progressbar 채워짐

### API 연동
- GitHub API: `GET /users/{username}/repos`
- **로딩 상태**: 스피너 + "불러오는 중..." 텍스트
- **성공 상태**: 저장소 카드 그리드 렌더링
- **에러 상태**: 메시지 + 재시도 버튼 (404, 403 레이트리밋 포함)
- **빈 상태**: "표시할 공개 저장소가 없습니다" 메시지

### 폼 유효성 검사
- 이름 (필수, 2자 이상)
- 이메일 (필수, 형식 검사)
- 메시지 (필수, 10자 이상)
- 실시간 에러 표시 (input 이벤트)
- 성공 시 성공 메시지 표시

---

### 시맨틱 태그 사용 기준

```bash
<header>   → 사이트 전체 상단 (로고 + 네비)
<nav>      → 페이지 이동 링크 모음
<main>     → 페이지의 핵심 콘텐츠
<section>  → 주제별 구역 (Hero, About, Skills...)
<article>  → 독립적인 콘텐츠 단위 (스킬 카드, 프로젝트 카드)
<footer>   → 저작권, 소셜 링크
```

---

### addEventListener 방식을 쓰는 이유

기존 쉬운 onclick 방식은 아래와 같이 화면 구조 + 기능을 모두 담고 있어 기능 변경시 html 파일에서 고치고 js파일에서 또 고쳐야하는 번거로움 발생

addEventLister 방식은 **HTML에서 화면 구조**만 담당, **JS에서 기능만 담당**하도록 하여 역할을 분리함.

### 모바일 퍼스트를 사용한 이유

모바일 퍼스트 : 기본 CSS를 모바일 기준으로 작성하고, 화면이 넓어질수록 min-width 미디어쿼리로 덮어쓰는 방식 <=> 데스크톱 퍼스트

모바일 퍼스트가 좋은 이유 3가지:
첫째, 모바일 트래픽이 데스크톱보다 많기 때문에 핵심 콘텐츠를 먼저 설계하게 됩니다.
둘째, CSS 용량이 줄어듭니다. 모바일은 기본 스타일만 로드하고, 데스크톱은 추가 스타일을 덮어쓰는 구조라 불필요한 스타일 계산이 줄어듭니다.
셋째, 작은 화면부터 설계하면 콘텐츠 우선순위가 명확해집니다. 좁은 화면에서 보여줄 것과 숨길 것을 먼저 결정하게 되기 때문입니다.

```bash
/* 기본 = 모바일 */
.skills__grid {
  grid-template-columns: 1fr;  /* 1열 */
}

/* 768px 이상 = 태블릿 */
@media (min-width: 768px) {
  .skills__grid { grid-template-columns: repeat(2, 1fr); }
}

/* 1024px 이상 = 데스크톱 */
@media (min-width: 1024px) {
  .skills__grid { grid-template-columns: repeat(3, 1fr); }
}
```

---

## 📐 반응형 브레이크포인트

| 구간 | 범위 |
|------|------|
| 모바일 (기본) | ~ 767px |
| 태블릿 | 768px ~ |
| 데스크톱 | 1024px ~ |

---

## 🌐 GitHub Pages 배포 방법

1. GitHub에 저장소 생성 후 코드 push
2. **Settings → Pages → Source: Deploy from a branch**
3. Branch: `main` / Folder: `/ (root)` 선택 후 Save
4. 몇 분 후 `https://<username>.github.io/<repo>` 접속

---

## ⚠️ GitHub API 주의사항

- 인증 없이 사용 시 **시간당 60회 요청 제한** 있음
- 403 응답(레이트리밋) 발생 시 에러 상태 UI 표시
- 짧은 시간 내 반복 새로고침 자제

---

## 📸 스크린샷

> 배포 후 아래 경로에 스크린샷 추가 예정

- `screenshots/desktop-light.png`
- `screenshots/desktop-dark.png`
- `screenshots/mobile.png`
