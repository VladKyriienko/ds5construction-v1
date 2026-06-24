import { dispatchOpenLightbox } from './open-lightbox-event';

function bindOpenLightboxTrigger(btn: HTMLElement) {
  if (btn.dataset.bound === 'true') return;
  btn.dataset.bound = 'true';

  btn.addEventListener('click', () => {
    dispatchOpenLightbox({
      images: JSON.parse(
        btn.getAttribute('data-lightbox-images') ?? '[]',
      ),
      title:
        btn.getAttribute('data-lightbox-title') ??
        'Gallery',
      index: Number(
        btn.getAttribute('data-lightbox-index') ?? '0',
      ),
    });
  });
}

function initOpenLightboxTriggers() {
  document
    .querySelectorAll<HTMLElement>('[data-open-lightbox]')
    .forEach(bindOpenLightboxTrigger);
}

initOpenLightboxTriggers();
