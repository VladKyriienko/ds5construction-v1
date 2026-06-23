const STORAGE_KEY = 'projectsCarouselReturnSlug';

function initProjectsCarousel() {
  if (
    document.documentElement.dataset
      .projectsCarouselInit === 'true'
  )
    return;
  document.documentElement.dataset.projectsCarouselInit =
    'true';

  document
    .querySelectorAll('[data-carousel-project-link]')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const slide = link.closest('[data-project-slug]');
        const slug = slide?.getAttribute(
          'data-project-slug',
        );
        if (slug) sessionStorage.setItem(STORAGE_KEY, slug);
      });
    });

  const root = document.querySelector(
    '[data-projects-carousel]',
  );
  const slug = sessionStorage.getItem(STORAGE_KEY);
  if (root && slug) {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

initProjectsCarousel();
