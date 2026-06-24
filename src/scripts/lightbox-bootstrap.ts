import type { LightboxState } from './lightbox';
import './open-lightbox-triggers.ts';

let lightboxPromise: Promise<
  typeof import('./lightbox')
> | null = null;

function loadLightbox() {
  lightboxPromise ??= import('./lightbox');
  return lightboxPromise;
}

document.addEventListener(
  'open-lightbox',
  (event) => {
    const detail = (event as CustomEvent<LightboxState>)
      .detail;
    void loadLightbox().then((mod) =>
      mod.openLightbox(detail),
    );
  },
  { capture: true },
);
