import {
  ANIMATIONS_ENABLED,
  SCROLL_ANIMATION_ROOT_MARGIN,
  SCROLL_ANIMATION_DURATION_MS,
} from '../config/siteConfig';

const observerCache = new Map<
  string,
  IntersectionObserver
>();
const elementListeners = new WeakMap<Element, () => void>();

function getSharedObserver(
  rootMargin: string,
): IntersectionObserver {
  const cached = observerCache.get(rootMargin);
  if (cached) return cached;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const listener = elementListeners.get(entry.target);
        if (listener) {
          listener();
          elementListeners.delete(entry.target);
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin, threshold: 0 },
  );

  observerCache.set(rootMargin, observer);
  return observer;
}

function observeElement(
  element: Element,
  listener: () => void,
  rootMargin: string,
) {
  elementListeners.set(element, listener);
  getSharedObserver(rootMargin).observe(element);
}

function initAnimateOnScroll() {
  if (
    document.documentElement.dataset.animateScrollInit ===
    'true'
  )
    return;
  document.documentElement.dataset.animateScrollInit =
    'true';

  if (!ANIMATIONS_ENABLED) {
    document
      .querySelectorAll('[data-animate-on-scroll]')
      .forEach((el) => {
        el.classList.add('is-visible');
      });
    return;
  }

  document
    .querySelectorAll<HTMLElement>(
      '[data-animate-on-scroll]',
    )
    .forEach((el) => {
      const delay = Number(el.dataset.delay ?? '200');
      const rootMargin =
        el.dataset.rootMargin ??
        SCROLL_ANIMATION_ROOT_MARGIN;

      observeElement(
        el,
        () => {
          el.style.transitionDelay = `${delay}ms`;
          el.style.transitionDuration = `${SCROLL_ANIMATION_DURATION_MS}ms`;
          el.classList.add('is-visible');
        },
        rootMargin,
      );
    });
}

initAnimateOnScroll();
