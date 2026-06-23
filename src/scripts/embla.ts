const ROOT_MARGIN = '200px 0px';

let emblaModulePromise: Promise<
  typeof import('./embla-carousel')
> | null = null;
let emblaLibPromise: Promise<
  typeof import('embla-carousel').default
> | null = null;

function loadEmblaModules() {
  emblaModulePromise ??= import('./embla-carousel');
  emblaLibPromise ??= import('embla-carousel').then(
    (m) => m.default,
  );
  return Promise.all([
    emblaModulePromise,
    emblaLibPromise,
  ] as const);
}

function initEmblaRoot(root: HTMLElement) {
  if (
    root.dataset.initialized === 'true' ||
    root.dataset.emblaPending === 'true'
  ) {
    return;
  }
  root.dataset.emblaPending = 'true';

  void loadEmblaModules().then(([mod, EmblaCarousel]) => {
    mod.initEmblaRoot(root, EmblaCarousel);
  });
}

function observeEmblaRoots() {
  const roots = document.querySelectorAll<HTMLElement>(
    '[data-embla]:not([data-initialized]):not([data-embla-pending])',
  );
  if (!roots.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        initEmblaRoot(entry.target as HTMLElement);
      }
    },
    { rootMargin: ROOT_MARGIN, threshold: 0 },
  );

  roots.forEach((root) => observer.observe(root));
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    observeEmblaRoots,
  );
} else {
  observeEmblaRoots();
}
