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

export type HeroImageRenderData = {
  src: string;
  srcset: string;
  width: number;
  height: number;
  sizes: string;
};

export type HeroImageData = {
  preload: HeroImageRenderData;
  img: HeroImageRenderData;
};

function heroHeightForWidth(width: number): number {
  return Math.round(
    (HERO_IMAGE.height * width) / HERO_IMAGE.width,
  );
}

/** Single source of truth for hero preload + <img> (avoids dev/prod URL mismatch). */
export async function getHeroImageData(): Promise<HeroImageData> {
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

  const srcset = srcsetEntries.join(', ');

  const { src } = await getImage({
    src: heroImageSrc,
    width: HERO_IMAGE.width,
    height: HERO_IMAGE.height,
    format: 'webp',
    quality: HERO_IMAGE.quality,
  });

  const render: HeroImageRenderData = {
    src,
    srcset,
    width: HERO_IMAGE.width,
    height: HERO_IMAGE.height,
    sizes: HERO_IMAGE.sizes,
  };

  return {
    preload: render,
    img: render,
  };
}

/** @deprecated Use getHeroImageData() */
export async function getHeroPreloadImage() {
  const { preload } = await getHeroImageData();
  return {
    href: preload.src,
    srcset: preload.srcset,
    sizes: preload.sizes,
  };
}
