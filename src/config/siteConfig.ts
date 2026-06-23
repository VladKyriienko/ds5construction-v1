import type { DefaultTheme, NavLink } from '../types';

export type { DefaultTheme, NavLink };

export const COMING_SOON =
  import.meta.env.PUBLIC_COMING_SOON === 'true';

export const ANIMATIONS_ENABLED = true;
export const SCROLL_ANIMATION_ROOT_MARGIN =
  '0px 0px -5% 0px';
export const SCROLL_ANIMATION_DELAY_MS = 200;
export const SCROLL_ANIMATION_DURATION_MS = 1000;

export const SHOW_DARK_MODE_TOGGLE = true;
export const DEFAULT_THEME: DefaultTheme = 'light';

export const GALLERY_FALLBACK_IMAGE =
  '/photo/IMG_1830.jpeg';
export const IMAGE_BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADAPwCd//Z';
export const GALLERY_AUTOPLAY_INTERVAL_MS = 3000;
export const EMBLA_AUTOPLAY_INTERVAL_MS = 5000;
export const GALLERY_TRANSITION_MS = 280;

export const IMAGE_SIZES = {
  heroContainer: '(max-width: 767px) 100vw, 1320px',
  halfContainer:
    '(max-width: 767px) 100vw, (max-width: 1400px) 48vw, 660px',
  thirdGrid:
    '(max-width: 639px) 100vw, (max-width: 1023px) 48vw, (max-width: 1400px) 34vw, 440px',
  thirdGridMd:
    '(max-width: 767px) 100vw, (max-width: 1400px) 34vw, 440px',
  floatMd:
    '(max-width: 767px) 100vw, (max-width: 1400px) 45vw, 640px',
  galleryMain:
    '(max-width: 768px) 100vw, (max-width: 1536px) 94vw, 1400px',
  galleryThumb: '(max-width: 768px) 80px, 96px',
  servicesCarousel:
    '(max-width: 767px) 48vw, (max-width: 1280px) 32vw, 280px',
  projectsCarousel:
    '(max-width: 767px) 100vw, (max-width: 1400px) 68vw, 880px',
} as const;

export const NAV_LINKS: ReadonlyArray<NavLink> = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/our-services', label: 'Our Services' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact Us' },
];

export const FOOTER_LINKS: ReadonlyArray<NavLink> = [
  { href: '/our-services', label: 'Our Services' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
];

export const FOOTER_PRIVACY_HREF = '/privacy';

export const GOOGLE_MAPS_LOCATION_QUERY =
  'DS5 Construction LTD, 90 Paul St, London EC2A 4NE';
export const GOOGLE_MAPS_EMBED_ZOOM = 13;

export function getGoogleMapsOpenUrl(): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(GOOGLE_MAPS_LOCATION_QUERY)}&z=${GOOGLE_MAPS_EMBED_ZOOM}`;
}

export function getGoogleMapsEmbedSrc(): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(GOOGLE_MAPS_LOCATION_QUERY)}&z=${GOOGLE_MAPS_EMBED_ZOOM}&output=embed`;
}

export function FOOTER_COPYRIGHT(year: number): string {
  return `© ${year} DS5 Construction. All rights reserved.`;
}

export const SOCIAL_FACEBOOK_URL =
  'https://www.facebook.com/ds5.construction.ltd';
export const SOCIAL_INSTAGRAM_URL =
  'https://www.instagram.com/ds5.construction.ltd/';
export const SOCIAL_YOUTUBE_URL =
  'https://www.youtube.com/@DS5ConstructionLTD';
