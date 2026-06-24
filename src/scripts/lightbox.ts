import type { OpenLightboxDetail } from './open-lightbox-event';
import {
  dispatchLightboxClosed,
  dispatchLightboxIndexChange,
} from './open-lightbox-event';
import {
  enableLoopTransitions,
  handleLoopTransitionEnd,
  loopRealIndex,
  shouldHandleLoopTransitionEnd,
  withLoopSlides,
} from './carousel-loop';

export type LightboxState = OpenLightboxDetail;

const FALLBACK_IMAGE = '/photo/hero.webp';
const SWIPE_THRESHOLD_PX = 50;

let activeCleanup: (() => void) | null = null;
let state: LightboxState | null = null;

export function openLightbox(detail: LightboxState) {
  activeCleanup?.();
  activeCleanup = null;
  state = detail;
  activeCleanup = mountLightbox();
}

function mountLightbox(): () => void {
  const root = document.querySelector<HTMLElement>(
    '[data-lightbox]',
  );
  if (!root || !state) return () => {};

  const { images, title, index } = state;
  const track = root.querySelector<HTMLElement>(
    '[data-lightbox-track]',
  );
  const closeBtn = root.querySelector<HTMLButtonElement>(
    '[data-lightbox-close]',
  );
  const prevBtn = root.querySelector<HTMLButtonElement>(
    '[data-lightbox-prev]',
  );
  const nextBtn = root.querySelector<HTMLButtonElement>(
    '[data-lightbox-next]',
  );
  const backdrop = root.querySelector<HTMLElement>(
    '[data-lightbox-backdrop]',
  );
  const viewport = track?.parentElement;

  if (!track || !viewport) return () => {};

  const { slides, isSingle } = withLoopSlides(images);
  const slideCount = slides.length;
  let selectedIndex = isSingle
    ? 0
    : Math.min(Math.max(index + 1, 1), slideCount - 2);
  let isTransitioning = false;
  let swipeStartX: number | null = null;

  const currentRealIndex = () =>
    loopRealIndex(
      selectedIndex,
      images.length,
      slideCount,
      isSingle,
    );

  const notifyIndexChange = () => {
    dispatchLightboxIndexChange({
      images,
      index: currentRealIndex(),
    });
  };

  const buildSlides = () => {
    track.innerHTML = slides
      .map((src, i) => {
        const validSrc = src?.startsWith('/')
          ? src
          : FALLBACK_IMAGE;
        const photoNum =
          images.length <= 1
            ? 1
            : i === 0
              ? images.length
              : i === slideCount - 1
                ? 1
                : i;
        return `<div class="relative h-full min-h-0 shrink-0" style="width:${100 / slideCount}%">
          <img src="${validSrc}" alt="${title} – ${photoNum}" class="absolute inset-0 h-full w-full object-contain" decoding="async" />
        </div>`;
      })
      .join('');
    track.style.width = `${slideCount * 100}%`;
  };

  const updateTransform = () => {
    track.style.transform = `translateX(-${selectedIndex * (100 / slideCount)}%)`;
    track.style.transition = isTransitioning
      ? 'transform 300ms ease-out'
      : 'none';
  };

  const toggleNav = () => {
    const hidden = isSingle;
    prevBtn?.classList.toggle('hidden', hidden);
    nextBtn?.classList.toggle('hidden', hidden);
  };

  const goPrev = () => {
    if (isSingle) return;
    selectedIndex = Math.max(selectedIndex - 1, 0);
    updateTransform();
    notifyIndexChange();
  };

  const goNext = () => {
    if (isSingle) return;
    selectedIndex = Math.min(
      selectedIndex + 1,
      slideCount - 1,
    );
    updateTransform();
    notifyIndexChange();
  };

  const handleSwipeEnd = (endX: number) => {
    const startX = swipeStartX;
    swipeStartX = null;
    if (startX === null || isSingle) return;
    const deltaX = endX - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (deltaX > 0) goPrev();
    else goNext();
  };

  const close = () => {
    const closingIndex = currentRealIndex();
    root.classList.add('hidden');
    root.classList.remove('flex');
    document.body.style.overflow = '';
    state = null;
    activeCleanup?.();
    activeCleanup = null;
    dispatchLightboxClosed({ images, index: closingIndex });
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  };

  const onTransitionEnd = (event: TransitionEvent) => {
    if (!shouldHandleLoopTransitionEnd(event, track))
      return;
    handleLoopTransitionEnd(
      selectedIndex,
      slideCount,
      isSingle,
      (nextIndex, transitioning) => {
        selectedIndex = nextIndex;
        isTransitioning = transitioning;
        updateTransform();
        if (!transitioning) return;
        notifyIndexChange();
      },
      track,
    );
  };

  const onPrevClick = (e: Event) => {
    e.stopPropagation();
    goPrev();
  };

  const onNextClick = (e: Event) => {
    e.stopPropagation();
    goNext();
  };

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) swipeStartX = touch.clientX;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (touch) handleSwipeEnd(touch.clientX);
  };

  const onMouseDown = (e: MouseEvent) => {
    swipeStartX = e.clientX;
    const onMouseUp = (up: MouseEvent) => {
      handleSwipeEnd(up.clientX);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mouseup', onMouseUp);
  };

  buildSlides();
  toggleNav();
  updateTransform();
  enableLoopTransitions((transitioning) => {
    isTransitioning = transitioning;
  });
  notifyIndexChange();

  track.addEventListener('transitionend', onTransitionEnd);
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  prevBtn?.addEventListener('click', onPrevClick);
  nextBtn?.addEventListener('click', onNextClick);
  window.addEventListener('keydown', onKey);
  viewport.addEventListener('touchstart', onTouchStart);
  viewport.addEventListener('touchend', onTouchEnd);
  viewport.addEventListener('mousedown', onMouseDown);

  root.classList.remove('hidden');
  root.classList.add('flex');
  document.body.style.overflow = 'hidden';

  return () => {
    track.removeEventListener(
      'transitionend',
      onTransitionEnd,
    );
    closeBtn?.removeEventListener('click', close);
    backdrop?.removeEventListener('click', close);
    prevBtn?.removeEventListener('click', onPrevClick);
    nextBtn?.removeEventListener('click', onNextClick);
    window.removeEventListener('keydown', onKey);
    viewport.removeEventListener(
      'touchstart',
      onTouchStart,
    );
    viewport.removeEventListener('touchend', onTouchEnd);
    viewport.removeEventListener('mousedown', onMouseDown);
  };
}
