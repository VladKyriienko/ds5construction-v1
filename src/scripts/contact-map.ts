import { getGoogleMapsEmbedSrc } from '../config/siteConfig';

function initContactMaps() {
  document
    .querySelectorAll<HTMLElement>('[data-contact-map]')
    .forEach((root) => {
      if (root.dataset.initialized === 'true') return;
      root.dataset.initialized = 'true';

      const button = root.querySelector<HTMLButtonElement>(
        '[data-contact-map-load]',
      );
      const embedSrc = root.dataset.embedSrc;
      if (!button || !embedSrc) return;

      button.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.title = 'DS5 Construction location map';
        iframe.src = embedSrc;
        iframe.className =
          'contact-map-embed h-full w-full border-0';
        iframe.loading = 'lazy';
        iframe.referrerPolicy =
          'no-referrer-when-downgrade';
        iframe.setAttribute('allowfullscreen', '');

        root.replaceChildren(iframe);
      });
    });
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    initContactMaps,
  );
} else {
  initContactMaps();
}
