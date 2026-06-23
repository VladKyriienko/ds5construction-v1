import { DEFAULT_THEME } from '../config/siteConfig';

function applyTheme(isDark: boolean) {
  const el = document.documentElement;
  if (isDark) {
    el.classList.add('dark');
    el.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    el.classList.remove('dark');
    el.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
}

function readIsDark(): boolean {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') return false;
  if (saved === 'dark') return true;
  return DEFAULT_THEME === 'dark';
}

function initTheme() {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyTheme(!document.documentElement.classList.contains('dark'));
    });
  });
}

initTheme();
