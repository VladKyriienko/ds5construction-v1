function initProcessLightbox() {
  document
    .querySelectorAll('[data-process-lightbox]')
    .forEach((btn) => {
      if (btn.getAttribute('data-bound') === 'true') return;
      btn.setAttribute('data-bound', 'true');

      btn.addEventListener('click', () => {
        document.dispatchEvent(
          new CustomEvent('open-lightbox', {
            detail: {
              images: JSON.parse(
                btn.getAttribute('data-lightbox-images') ??
                  '[]',
              ),
              title:
                btn.getAttribute('data-lightbox-title') ??
                'Gallery',
              index: Number(
                btn.getAttribute('data-lightbox-index') ??
                  '0',
              ),
            },
          }),
        );
      });
    });
}

initProcessLightbox();
