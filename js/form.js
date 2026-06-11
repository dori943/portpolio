/* ============================================================
   js/form.js — Contact 폼 유효성 검사
   이벤트 → 유효성 상태 변경 → 에러 메시지 표시/숨김
   ============================================================ */

// ── DOM 참조 ──────────────────────────────────────────────────
const contactForm    = document.getElementById('contact-form');
const nameInput      = document.getElementById('contact-name');
const emailInput     = document.getElementById('contact-email');
const messageInput   = document.getElementById('contact-message');
const submitBtn      = document.getElementById('form-submit-btn');
const formSuccess    = document.getElementById('form-success');

const errorName    = document.getElementById('error-name');
const errorEmail   = document.getElementById('error-email');
const errorMessage = document.getElementById('error-message');

// ── 유효성 검사 함수 ──────────────────────────────────────────

/**
 * 이메일 형식 검사
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

/**
 * 필드 에러 표시 — 상태 변경 → DOM 업데이트
 * @param {HTMLElement} input   - 입력 요소
 * @param {HTMLElement} errorEl - 에러 메시지 요소
 * @param {string}      msg     - 에러 메시지 (빈 문자열이면 에러 해제)
 */
const setFieldError = (input, errorEl, msg) => {
  if (msg) {
    input.classList.add('error');
    errorEl.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.classList.remove('error');
    errorEl.textContent = '';
    input.removeAttribute('aria-invalid');
  }
};

/**
 * 이름 필드 검사
 * @returns {boolean} 유효 여부
 */
const validateName = () => {
  const value = nameInput.value.trim();
  if (!value) {
    setFieldError(nameInput, errorName, '이름을 입력해 주세요.');
    return false;
  }
  if (value.length < 2) {
    setFieldError(nameInput, errorName, '이름은 2자 이상이어야 합니다.');
    return false;
  }
  setFieldError(nameInput, errorName, '');
  return true;
};

/**
 * 이메일 필드 검사
 * @returns {boolean} 유효 여부
 */
const validateEmail = () => {
  const value = emailInput.value.trim();
  if (!value) {
    setFieldError(emailInput, errorEmail, '이메일을 입력해 주세요.');
    return false;
  }
  if (!isValidEmail(value)) {
    setFieldError(emailInput, errorEmail, '올바른 이메일 형식이 아닙니다. (예: name@example.com)');
    return false;
  }
  setFieldError(emailInput, errorEmail, '');
  return true;
};

/**
 * 메시지 필드 검사
 * @returns {boolean} 유효 여부
 */
const validateMessage = () => {
  const value = messageInput.value.trim();
  if (!value) {
    setFieldError(messageInput, errorMessage, '메시지를 입력해 주세요.');
    return false;
  }
  if (value.length < 10) {
    setFieldError(messageInput, errorMessage, '메시지는 10자 이상 입력해 주세요.');
    return false;
  }
  setFieldError(messageInput, errorMessage, '');
  return true;
};

// ── 실시간 검사 (input 이벤트) ────────────────────────────────
// 사용자가 타이핑할 때마다 에러 즉시 해제

nameInput.addEventListener('input', validateName);
emailInput.addEventListener('input', validateEmail);
messageInput.addEventListener('input', validateMessage);

// ── 폼 제출 ───────────────────────────────────────────────────
contactForm.addEventListener('submit', (e) => {
  // 기본 폼 제출 방지
  e.preventDefault();

  // 모든 필드 검사
  const isNameValid    = validateName();
  const isEmailValid   = validateEmail();
  const isMessageValid = validateMessage();

  if (!isNameValid || !isEmailValid || !isMessageValid) {
    // 첫 번째 에러 필드로 포커스 이동
    if (!isNameValid)         nameInput.focus();
    else if (!isEmailValid)   emailInput.focus();
    else                      messageInput.focus();
    return;
  }

  // ── 성공 처리 ──
  // 버튼 로딩 상태
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 전송 중...';

  // 실제 서버 전송 없이 UI 시뮬레이션 (setTimeout)
  setTimeout(() => {
    contactForm.style.display = 'none';
    formSuccess.classList.add('visible');
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 폼 초기화 (숨겨진 상태이지만 값은 지워 둠)
    contactForm.reset();
    submitBtn.disabled    = false;
    submitBtn.innerHTML   = '<i class="fa-solid fa-paper-plane"></i> 메시지 전송';
  }, 1000);
});