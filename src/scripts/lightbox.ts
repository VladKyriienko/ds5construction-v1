export type LightboxState = {
  images: string[];
  title: string;
  index: number;
};

let state: LightboxState | null = null;

export function openLightbox(detail: LightboxState) {
  state = detail;
  renderLightbox();
}

function renderLightbox() {
  const root = document.querySelector<HTMLElement>(
    '[data-lightbox]',
  );
  if (!root || !state) return;

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

  if (!track) return;

  const slides =
    images.length > 1
      ? [images[images.length - 1], ...images, images[0]]
      : images;
  const slideCount = slides.length;
  let selectedIndex = images.length > 1 ? index + 1 : 0;
  let isTransitioning = true;

  const update = () => {
    track.innerHTML = slides
      .map((src, i) => {
        const validSrc = src?.startsWith('/')
          ? src
          : '/photo/hero.webp';
        const photoNum =
          images.length <= 1
            ? 1
            : i === 0
              ? images.length
              : i === slideCount - 1
                ? 1
                : i;
        return `<div class="relative h-full min-h-0 shrink-0" style="width:${100 / slideCount}%">
          <img src="${validSrc}" alt="${title} – ${photoNum}" class="absolute inset-0 h-full w-full object-contain" />
        </div>`;
      })
      .join('');
    track.style.width = `${slideCount * 100}%`;
    track.style.transform = `translateX(-${selectedIndex * (100 / slideCount)}%)`;
    track.style.transition = isTransitioning
      ? 'transform 300ms ease-out'
      : 'none';
  };

  const close = () => {
    root.classList.add('hidden');
    root.classList.remove('flex');
    document.body.style.overflow = '';
    state = null;
  };

  const goPrev = () => {
    if (images.length <= 1) return;
    selectedIndex = Math.max(selectedIndex - 1, 0);
    update();
  };

  const goNext = () => {
    if (images.length <= 1) return;
    selectedIndex = Math.min(
      selectedIndex + 1,
      slideCount - 1,
    );
    update();
  };

  track.ontransitionend = () => {
    if (images.length <= 1) return;
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
  };

  if (closeBtn) closeBtn.onclick = close;
  root
    .querySelector('[data-lightbox-backdrop]')
    ?.addEventListener('click', close);
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.stopPropagation();
      goPrev();
    };
  }
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      goNext();
    };
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  };
  window.addEventListener('keydown', onKey, {
    once: false,
  });

  root.classList.remove('hidden');
  root.classList.add('flex');
  document.body.style.overflow = 'hidden';
  update();

  root.addEventListener(
    'click',
    () => {
      window.removeEventListener('keydown', onKey);
    },
    { once: true },
  );
}
