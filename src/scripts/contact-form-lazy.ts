import { SCROLL_ANIMATION_ROOT_MARGIN } from '../config/siteConfig';

function loadContactForms() {
  void import('./contact-form').then((mod) =>
    mod.ensureContactForms(),
  );
}

function observeLazyContactForms() {
  const forms = document.querySelectorAll<HTMLElement>(
    '[data-contact-form-lazy]:not([data-contact-form-pending])',
  );
  if (!forms.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        loadContactForms();
      }
    },
    {
      rootMargin: SCROLL_ANIMATION_ROOT_MARGIN,
      threshold: 0,
    },
  );

  forms.forEach((form) => {
    form.dataset.contactFormPending = 'true';
    observer.observe(form);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    observeLazyContactForms,
  );
} else {
  observeLazyContactForms();
}
