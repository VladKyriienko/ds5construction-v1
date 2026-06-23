function setMenuOpen(open: boolean) {
  const toggle = document.querySelector<HTMLButtonElement>(
    '[data-mobile-menu-toggle]',
  );
  const menu = document.querySelector<HTMLElement>(
    '[data-mobile-menu]',
  );
  const backdrop = document.querySelector<HTMLElement>(
    '[data-mobile-menu-backdrop]',
  );
  const header = document.querySelector<HTMLElement>(
    '[data-mobile-header]',
  );
  const menuIcon = document.querySelector<HTMLElement>(
    '[data-menu-icon]',
  );
  const closeIcon = document.querySelector<HTMLElement>(
    '[data-close-icon]',
  );

  if (!toggle || !menu) return;

  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute(
    'aria-label',
    open ? 'Close menu' : 'Open menu',
  );
  menu.classList.toggle('hidden', !open);
  menu.classList.toggle('flex', open);
  menu.setAttribute('aria-hidden', String(!open));
  backdrop?.classList.toggle('hidden', !open);
  header?.classList.toggle('z-60', open);
  header?.classList.toggle('pointer-events-auto', open);
  menuIcon?.setAttribute('data-open', String(open));
  closeIcon?.setAttribute('data-open', String(open));
  document.body.classList.toggle('overflow-hidden', open);
}

function updateHeaderHeight() {
  const header = document.querySelector<HTMLElement>(
    '[data-mobile-header]',
  );
  if (!header) return;
  document.documentElement.style.setProperty(
    '--mobile-header-height',
    `${header.offsetHeight}px`,
  );
}

function initMobileMenu() {
  if (
    document.documentElement.dataset.mobileMenuInit ===
    'true'
  )
    return;
  document.documentElement.dataset.mobileMenuInit = 'true';

  const toggle = document.querySelector<HTMLButtonElement>(
    '[data-mobile-menu-toggle]',
  );
  const menu = document.querySelector<HTMLElement>(
    '[data-mobile-menu]',
  );
  const backdrop = document.querySelector<HTMLElement>(
    '[data-mobile-menu-backdrop]',
  );

  if (!toggle || !menu) return;

  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight);

  const header = document.querySelector<HTMLElement>(
    '[data-mobile-header]',
  );
  if (header && 'ResizeObserver' in window) {
    const ro = new ResizeObserver(updateHeaderHeight);
    ro.observe(header);
  }

  toggle.addEventListener('click', () => {
    const isOpen =
      toggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  backdrop?.addEventListener('click', () =>
    setMenuOpen(false),
  );

  document
    .querySelectorAll(
      '[data-mobile-menu-link], [data-close-mobile-menu]',
    )
    .forEach((el) => {
      el.addEventListener('click', () =>
        setMenuOpen(false),
      );
    });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  window
    .matchMedia('(min-width: 56.25rem)')
    .addEventListener('change', (event) => {
      if (event.matches) setMenuOpen(false);
    });
}

initMobileMenu();
