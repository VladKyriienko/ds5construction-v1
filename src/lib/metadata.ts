import { getURL } from '../utils/helpers';

export const DEFAULT_OG_IMAGE = '/photo/hero.webp';

export function absoluteUrl(path: string = ''): string {
  const normalized = path.replace(/^\/+/, '');
  return normalized ? getURL(normalized) : getURL();
}

export function ogImageUrl(
  imagePath: string = DEFAULT_OG_IMAGE,
): string {
  return absoluteUrl(
    imagePath.startsWith('/')
      ? imagePath.slice(1)
      : imagePath,
  );
}

import type { HeroImageRenderData } from '../utils/hero-image';

export type PageMetadata = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  /** Optimized LCP image for <link rel="preload"> — same URLs as hero <img> */
  preloadImage?: HeroImageRenderData;
};

export function buildPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}): PageMetadata {
  const pageUrl = path ? absoluteUrl(path) : absoluteUrl();
  const imageUrl = ogImageUrl(image);

  return {
    title,
    description,
    canonical: pageUrl,
    image: imageUrl,
  };
}
