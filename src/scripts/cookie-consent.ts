type CookieConsentChoice = 'all' | 'necessary';

const CONSENT_LOCALSTORAGE_KEY = 'ds5_cookie_consent';
const CONSENT_COOKIE_KEY = 'ds5_cookie_consent';
const CONSENT_COOKIE_DAYS = 365;

function readConsentFromStorage(): CookieConsentChoice | null {
  const fromStorage = localStorage.getItem(
    CONSENT_LOCALSTORAGE_KEY,
  );
  if (fromStorage === 'all' || fromStorage === 'necessary')
    return fromStorage;
  return null;
}

function writeConsent(choice: CookieConsentChoice) {
  localStorage.setItem(CONSENT_LOCALSTORAGE_KEY, choice);
  const maxAge = CONSENT_COOKIE_DAYS * 24 * 60 * 60;
  const secure =
    window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE_KEY}=${encodeURIComponent(choice)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  window.dispatchEvent(
    new Event('ds5-cookie-consent-updated'),
  );
}

function initCookieConsentPopup() {
  if (
    document.documentElement.dataset.cookiePopupInit ===
    'true'
  )
    return;
  document.documentElement.dataset.cookiePopupInit = 'true';

  const popup = document.querySelector<HTMLElement>(
    '[data-cookie-popup]',
  );
  const backdrop = document.querySelector<HTMLElement>(
    '[data-cookie-backdrop]',
  );
  if (!popup) return;

  const existing = readConsentFromStorage();
  if (existing) {
    popup.classList.add('hidden');
    backdrop?.classList.add('hidden');
    return;
  }

  popup.classList.remove('hidden');
  backdrop?.classList.remove('hidden');

  popup
    .querySelector('[data-cookie-accept-all]')
    ?.addEventListener('click', () => {
      writeConsent('all');
      popup.classList.add('hidden');
      backdrop?.classList.add('hidden');
    });

  popup
    .querySelector('[data-cookie-necessary]')
    ?.addEventListener('click', () => {
      writeConsent('necessary');
      popup.classList.add('hidden');
      backdrop?.classList.add('hidden');
    });
}

function initCookieConsentGuard() {
  if (
    document.documentElement.dataset.cookieGuardInit ===
    'true'
  )
    return;
  document.documentElement.dataset.cookieGuardInit = 'true';

  const guard = document.querySelector<HTMLElement>(
    '[data-cookie-guard]',
  );
  if (!guard) return;

  const allowed = new Set(['/', '/privacy']);

  const enforce = () => {
    const raw = localStorage.getItem(
      CONSENT_LOCALSTORAGE_KEY,
    );
    const hasConsent = raw === 'all' || raw === 'necessary';
    if (hasConsent) return;

    const path =
      window.location.pathname.replace(/\/+$/, '') || '/';
    const isAllowed =
      allowed.has(path) || path.startsWith('/privacy');
    if (!isAllowed) window.location.replace('/');
  };

  enforce();
  window.addEventListener(
    'ds5-cookie-consent-updated',
    enforce,
  );
}

initCookieConsentPopup();
initCookieConsentGuard();
