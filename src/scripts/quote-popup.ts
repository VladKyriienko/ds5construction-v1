function openQuotePopup() {
  const popup = document.querySelector<HTMLElement>(
    '[data-quote-popup]',
  );
  if (!popup) return;
  popup.classList.remove('hidden');
  popup.classList.add('flex');
  popup.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  void import('./contact-form').then((mod) =>
    mod.ensureContactForms(),
  );
}

function closeQuotePopup() {
  const popup = document.querySelector<HTMLElement>(
    '[data-quote-popup]',
  );
  if (!popup) return;
  popup.classList.add('hidden');
  popup.classList.remove('flex');
  popup.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function initQuotePopup() {
  if (
    document.documentElement.dataset.quotePopupInit ===
    'true'
  )
    return;
  document.documentElement.dataset.quotePopupInit = 'true';

  document
    .querySelectorAll('[data-quote-button]')
    .forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        openQuotePopup();
      });
    });

  document
    .querySelectorAll(
      '[data-quote-popup-close], [data-quote-popup-backdrop]',
    )
    .forEach((el) => {
      el.addEventListener('click', closeQuotePopup);
    });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeQuotePopup();
  });

  document.addEventListener(
    'quote-form-success',
    closeQuotePopup,
  );
}

initQuotePopup();
