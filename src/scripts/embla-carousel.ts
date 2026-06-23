type EmblaConstructor =
  typeof import('embla-carousel').default;

export function initEmblaRoot(
  root: HTMLElement,
  EmblaCarousel: EmblaConstructor,
) {
  if (root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';

  const AUTOPLAY_MS = 5000;

  const viewport = root.querySelector<HTMLElement>(
    '[data-embla-viewport]',
  );
  const prevBtn = root.querySelector<HTMLButtonElement>(
    '[data-embla-prev]',
  );
  const nextBtn = root.querySelector<HTMLButtonElement>(
    '[data-embla-next]',
  );
  const dots = root.querySelectorAll<HTMLButtonElement>(
    '[data-embla-dot]',
  );

  if (!viewport) return;

  const loop = root.dataset.loop !== 'false';
  const align =
    (root.dataset.align as 'start' | 'center' | 'end') ??
    'center';
  const autoplay = root.dataset.autoplay === 'true';
  const pauseOnHover =
    root.dataset.pauseOnHover !== 'false';
  const pauseOnPointerDown =
    root.dataset.pauseOnPointerDown !== 'false';

  const api = EmblaCarousel(viewport, {
    loop,
    align,
    duration: 30,
  });
  const slides = Array.from(
    root.querySelectorAll<HTMLElement>(
      '[data-embla-slide]',
    ),
  );

  const updateState = () => {
    const selected = api.selectedScrollSnap();
    const slideCount = slides.length;
    const normalized =
      slideCount > 0 ? selected % slideCount : 0;

    dots.forEach((dot, index) => {
      const active = index === normalized;
      dot.setAttribute('aria-selected', String(active));
      dot.classList.toggle('w-6', active);
      dot.classList.toggle('bg-foreground', active);
      dot.classList.toggle('w-2', !active);
      dot.classList.toggle(
        'bg-muted-foreground/40',
        !active,
      );
    });

    slides.forEach((slide, index) => {
      const active = index === normalized;
      slide.dataset.active = String(active);
      slide
        .querySelector<HTMLElement>('a')
        ?.setAttribute('data-active', String(active));
    });
  };

  api.on('select', updateState);
  api.on('reInit', updateState);
  updateState();

  prevBtn?.addEventListener('click', () =>
    api.scrollPrev(),
  );
  nextBtn?.addEventListener('click', () =>
    api.scrollNext(),
  );
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () =>
      api.scrollTo(index),
    );
  });

  let timer: ReturnType<typeof setInterval> | null = null;
  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
  const start = () => {
    if (!autoplay || timer) return;
    timer = setInterval(
      () => api.scrollNext(),
      AUTOPLAY_MS,
    );
  };

  if (autoplay) {
    start();
    if (pauseOnHover) {
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
    }
    if (pauseOnPointerDown) {
      api.on('pointerDown', stop);
    }
  }
}
