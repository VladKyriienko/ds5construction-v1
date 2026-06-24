import {
  GALLERY_AUTOPLAY_INTERVAL_MS,
  GALLERY_FALLBACK_IMAGE,
  GALLERY_TRANSITION_MS,
} from '../config/siteConfig';
import {
  enableLoopTransitions,
  handleLoopTransitionEnd,
  loopRealIndex,
  shouldHandleLoopTransitionEnd,
  withLoopSlides,
} from './carousel-loop';
import {
  dispatchOpenLightbox,
  lightboxImagesMatch,
  type LightboxIndexChangeDetail,
} from './open-lightbox-event';

function initGalleries() {
  document
    .querySelectorAll<HTMLElement>('[data-gallery]')
    .forEach((root) => {
      if (root.dataset.initialized === 'true') return;
      root.dataset.initialized = 'true';

      const images = JSON.parse(
        root.dataset.images ?? '[]',
      ) as string[];
      const title = root.dataset.title ?? 'Gallery';
      const list =
        images.length > 0
          ? images
          : [GALLERY_FALLBACK_IMAGE];
      const { slides, isSingle, initialIndex } =
        withLoopSlides(list);
      const slideCount = slides.length;

      const track = root.querySelector<HTMLElement>(
        '[data-gallery-track]',
      );
      const counter = root.querySelector<HTMLElement>(
        '[data-gallery-counter]',
      );
      const thumbStrip = root.querySelector<HTMLElement>(
        '[data-gallery-thumbs]',
      );
      const prevBtn = root.querySelector<HTMLButtonElement>(
        '[data-gallery-prev]',
      );
      const nextBtn = root.querySelector<HTMLButtonElement>(
        '[data-gallery-next]',
      );
      const lightboxTrigger =
        root.querySelector<HTMLButtonElement>(
          '[data-gallery-lightbox]',
        );

      if (!track || !counter) return;

      let selectedIndex = initialIndex;
      let isTransitioning = false;
      let isGalleryInView = false;
      let autoplayTimer: ReturnType<
        typeof setInterval
      > | null = null;

      const realIndex = () =>
        loopRealIndex(
          selectedIndex,
          list.length,
          slideCount,
          isSingle,
        );

      const update = () => {
        track.style.transform = `translateX(-${selectedIndex * (100 / slideCount)}%)`;
        track.style.transition = isTransitioning
          ? `transform ${GALLERY_TRANSITION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
          : 'none';
        counter.textContent = `${realIndex() + 1}/${list.length}`;
        thumbStrip
          ?.querySelectorAll<HTMLButtonElement>(
            '[data-thumb-index]',
          )
          .forEach((btn) => {
            const idx = Number(btn.dataset.thumbIndex);
            const active = idx === realIndex();
            btn.classList.toggle(
              'border-foreground',
              active,
            );
            btn.classList.toggle('ring-2', active);
            btn.classList.toggle(
              'ring-foreground/20',
              active,
            );
            btn.classList.toggle('border-border', !active);
            btn.setAttribute(
              'aria-pressed',
              String(active),
            );
          });
      };

      const syncToRealIndex = (index: number) => {
        if (isSingle) return;
        const nextIndex = Math.min(
          Math.max(index + 1, 1),
          slideCount - 2,
        );
        if (selectedIndex === nextIndex) {
          update();
          return;
        }
        isTransitioning = false;
        selectedIndex = nextIndex;
        update();
        enableLoopTransitions((transitioning) => {
          isTransitioning = transitioning;
        });
      };

      const goTo = (index: number) => {
        selectedIndex = index;
        update();
      };

      const goNext = () => {
        if (isSingle) return;
        selectedIndex = Math.min(
          selectedIndex + 1,
          slideCount - 1,
        );
        update();
        stopAutoplay();
      };

      const goPrev = () => {
        if (isSingle) return;
        selectedIndex = Math.max(selectedIndex - 1, 0);
        update();
        stopAutoplay();
      };

      track.addEventListener('transitionend', (event) => {
        if (!shouldHandleLoopTransitionEnd(event, track))
          return;
        handleLoopTransitionEnd(
          selectedIndex,
          slideCount,
          isSingle,
          (index, transitioning) => {
            selectedIndex = index;
            isTransitioning = transitioning;
            update();
          },
          track,
        );
      });

      prevBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        goPrev();
      });
      nextBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        goNext();
      });

      thumbStrip
        ?.querySelectorAll<HTMLButtonElement>(
          '[data-thumb-index]',
        )
        .forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.thumbIndex);
            if (!isSingle) goTo(idx + 1);
            stopAutoplay();
          });
        });

      lightboxTrigger?.addEventListener('click', () => {
        dispatchOpenLightbox({
          images: list,
          title,
          index: realIndex(),
        });
      });

      const stopAutoplay = () => {
        if (autoplayTimer) {
          clearInterval(autoplayTimer);
          autoplayTimer = null;
        }
      };

      const startAutoplay = () => {
        if (
          isSingle ||
          autoplayTimer ||
          !isGalleryInView ||
          document.hidden ||
          root.dataset.autoplayPaused === 'true'
        ) {
          return;
        }
        autoplayTimer = setInterval(
          goNext,
          GALLERY_AUTOPLAY_INTERVAL_MS,
        );
      };

      const setGalleryInView = (inView: boolean) => {
        isGalleryInView = inView;
        if (!inView) {
          stopAutoplay();
          return;
        }
        if (root.dataset.autoplayPaused !== 'true') {
          startAutoplay();
        }
      };

      const pauseForLightbox = () => {
        root.dataset.autoplayPaused = 'true';
        stopAutoplay();
      };

      const resumeAfterLightbox = (event: Event) => {
        delete root.dataset.autoplayPaused;
        const detail = (
          event as CustomEvent<
            LightboxIndexChangeDetail | undefined
          >
        ).detail;
        if (
          detail &&
          lightboxImagesMatch(detail.images, list)
        ) {
          syncToRealIndex(detail.index);
        }
        if (isGalleryInView && !document.hidden) {
          startAutoplay();
        }
      };

      const onLightboxIndexChange = (event: Event) => {
        const detail = (
          event as CustomEvent<LightboxIndexChangeDetail>
        ).detail;
        if (!lightboxImagesMatch(detail.images, list))
          return;
        syncToRealIndex(detail.index);
      };

      document.addEventListener(
        'open-lightbox',
        pauseForLightbox,
      );
      document.addEventListener(
        'lightbox-closed',
        resumeAfterLightbox,
      );
      document.addEventListener(
        'lightbox-index-change',
        onLightboxIndexChange,
      );

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopAutoplay();
          return;
        }
        if (
          isGalleryInView &&
          root.dataset.autoplayPaused !== 'true'
        ) {
          startAutoplay();
        }
      });

      if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) {
              setGalleryInView(false);
              return;
            }

            const rect = entry.boundingClientRect;
            const visibleWidth = Math.max(
              0,
              Math.min(rect.right, window.innerWidth) -
                Math.max(rect.left, 0),
            );
            const widthRatio =
              visibleWidth / (rect.width || 1);
            setGalleryInView(widthRatio >= 0.5);
          },
          { threshold: [0, 0.5] },
        );
        observer.observe(root);
      } else {
        setGalleryInView(true);
      }

      update();
      enableLoopTransitions((transitioning) => {
        isTransitioning = transitioning;
      });
    });
}

initGalleries();
