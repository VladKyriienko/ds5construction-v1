import {
  GALLERY_AUTOPLAY_INTERVAL_MS,
  GALLERY_FALLBACK_IMAGE,
  GALLERY_TRANSITION_MS,
} from '../config/siteConfig';

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
      const showThumbnails =
        root.dataset.showThumbnails !== 'false';
      const list =
        images.length > 0
          ? images
          : [GALLERY_FALLBACK_IMAGE];
      const isSingle = list.length <= 1;

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

      const slides = isSingle
        ? list
        : [list[list.length - 1], ...list, list[0]];
      const slideCount = slides.length;
      let selectedIndex = isSingle ? 0 : 1;
      let isTransitioning = true;
      let autoplayTimer: ReturnType<
        typeof setInterval
      > | null = null;

      const realIndex = () => {
        if (isSingle) return 0;
        if (selectedIndex === 0) return list.length - 1;
        if (selectedIndex === slideCount - 1) return 0;
        return selectedIndex - 1;
      };

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

      track.addEventListener('transitionend', () => {
        if (isSingle) return;
        if (selectedIndex === 0) {
          isTransitioning = false;
          selectedIndex = slideCount - 2;
          update();
          requestAnimationFrame(() => {
            isTransitioning = true;
            update();
          });
        } else if (selectedIndex === slideCount - 1) {
          isTransitioning = false;
          selectedIndex = 1;
          update();
          requestAnimationFrame(() => {
            isTransitioning = true;
            update();
          });
        }
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
        document.dispatchEvent(
          new CustomEvent('open-lightbox', {
            detail: {
              images: list,
              title,
              index: realIndex(),
            },
          }),
        );
        stopAutoplay();
      });

      const stopAutoplay = () => {
        if (autoplayTimer) {
          clearInterval(autoplayTimer);
          autoplayTimer = null;
        }
      };

      const startAutoplay = () => {
        if (isSingle || autoplayTimer) return;
        autoplayTimer = setInterval(
          goNext,
          GALLERY_AUTOPLAY_INTERVAL_MS,
        );
      };

      if (!isSingle) {
        root.addEventListener('mouseenter', stopAutoplay);
        root.addEventListener('mouseleave', startAutoplay);
        startAutoplay();
      }

      update();
    });
}

initGalleries();
