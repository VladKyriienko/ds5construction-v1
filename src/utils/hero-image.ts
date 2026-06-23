import { getImage } from 'astro:assets';
import homeHero from '../assets/images/home-hero.webp';
import { IMAGE_SIZES } from '../config/siteConfig';

export const heroImageSrc = homeHero;

export const HERO_IMAGE = {
  width: 1320,
  height: 880,
  quality: 82,
  widths: [640, 960, 1320, 1920] as const,
  sizes: IMAGE_SIZES.heroContainer,
} as const;

function heroHeightForWidth(width: number): number {
  return Math.round(
    (HERO_IMAGE.height * width) / HERO_IMAGE.width,
  );
}

export async function getHeroPreloadImage() {
  const srcsetEntries = await Promise.all(
    HERO_IMAGE.widths.map(async (width) => {
      const { src } = await getImage({
        src: heroImageSrc,
        width,
        height: heroHeightForWidth(width),
        format: 'webp',
        quality: HERO_IMAGE.quality,
      });
      return `${src} ${width}w`;
    }),
  );

  const { src: href } = await getImage({
    src: heroImageSrc,
    width: HERO_IMAGE.width,
    height: HERO_IMAGE.height,
    format: 'webp',
    quality: HERO_IMAGE.quality,
  });

  return {
    href,
    srcset: srcsetEntries.join(', '),
    sizes: HERO_IMAGE.sizes,
  };
}
