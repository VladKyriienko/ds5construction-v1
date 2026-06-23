import { absoluteUrl } from './metadata';

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function getBreadcrumbJsonLd(
  items: BreadcrumbItem[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path
        ? absoluteUrl(item.path)
        : absoluteUrl(),
    })),
  };
}
