import { getURL } from '../utils/helpers';

export const SITE_NAME = 'DS5 Construction';
export const DEFAULT_OG_IMAGE = '/photo/hero.webp';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

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

export type PageMetadata = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  /** Optimized LCP image for <link rel="preload"> */
  preloadImage?: {
    href: string;
    srcset: string;
    sizes: string;
  };
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
