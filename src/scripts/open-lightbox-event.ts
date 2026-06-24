export type OpenLightboxDetail = {
  images: string[];
  title: string;
  index: number;
};

export type LightboxIndexChangeDetail = {
  images: string[];
  index: number;
};

export function dispatchOpenLightbox(
  detail: OpenLightboxDetail,
): void {
  document.dispatchEvent(
    new CustomEvent('open-lightbox', { detail }),
  );
}

export function dispatchLightboxIndexChange(
  detail: LightboxIndexChangeDetail,
): void {
  document.dispatchEvent(
    new CustomEvent('lightbox-index-change', { detail }),
  );
}

export function dispatchLightboxClosed(
  detail?: LightboxIndexChangeDetail,
): void {
  document.dispatchEvent(
    new CustomEvent('lightbox-closed', { detail }),
  );
}

export function lightboxImagesMatch(
  a: string[],
  b: string[],
): boolean {
  return (
    a.length === b.length &&
    a.every((src, index) => src === b[index])
  );
}
