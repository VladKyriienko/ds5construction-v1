import type { ServiceBlockBackground } from '../types';
import { SERVICE_BLOCK_BACKGROUNDS } from '../types';

export type ImageHeightKey =
  | 'short'
  | 'wide'
  | 'tall'
  | 'normal';

export type BlockImageOptions = {
  imageHeight?:
    | 'short'
    | 'normal'
    | 'wide'
    | 'tall'
    | undefined;
  imageSize?:
    | 'small'
    | 'default'
    | 'large'
    | 'wide'
    | undefined;
};

export function stripeVariant(
  stripeIndex: number,
): 'default' | 'muted' {
  return stripeIndex % 2 === 0 ? 'default' : 'muted';
}

export function getImageHeightKey(
  options: BlockImageOptions,
): ImageHeightKey {
  if (
    options.imageHeight === 'short' ||
    options.imageSize === 'small'
  )
    return 'short';
  if (
    options.imageHeight === 'wide' ||
    options.imageSize === 'wide'
  )
    return 'wide';
  if (options.imageHeight === 'tall') return 'tall';
  return 'normal';
}

export function getBlockImageDimensions(
  key: ImageHeightKey,
): {
  width: number;
  height: number;
} {
  switch (key) {
    case 'short':
      return { width: 1200, height: 800 };
    case 'wide':
      return { width: 1600, height: 900 };
    case 'tall':
      return { width: 900, height: 1200 };
    default:
      return { width: 1200, height: 900 };
  }
}

function normalizeBlockBackground(
  value: string | undefined,
): ServiceBlockBackground {
  if (
    value &&
    (
      SERVICE_BLOCK_BACKGROUNDS as readonly string[]
    ).includes(value)
  ) {
    return value as ServiceBlockBackground;
  }
  return 'default';
}

export function getBlockInnerSurfaceClass(
  background: string | undefined,
): string {
  const surface = normalizeBlockBackground(background);
  return surface === 'card'
    ? 'rounded-xl border border-border bg-card px-4 py-8 shadow-sm sm:px-6 md:px-8 md:py-10'
    : '';
}
