import {
  GOOGLE_MAPS_LOCATION_QUERY,
  SOCIAL_FACEBOOK_URL,
  SOCIAL_INSTAGRAM_URL,
  SOCIAL_YOUTUBE_URL,
} from '../config/siteConfig';
import type { GoogleReviewsSchemaData } from './google-reviews';
import { absoluteUrl } from './metadata';

const BUSINESS = {
  name: 'DS5 Construction Ltd',
  telephone: '+44 7383 501785',
  email: 'info@DS5construction.co.uk',
  streetAddress: '90 Paul St',
  addressLocality: 'London',
  postalCode: 'EC2A 4NE',
  addressCountry: 'GB',
} as const;

export function getLocalBusinessJsonLd(
  reviewData?: GoogleReviewsSchemaData,
) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: BUSINESS.name,
    url: absoluteUrl(),
    image: absoluteUrl('photo/hero.webp'),
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    },
    areaServed: {
      '@type': 'City',
      name: 'London',
    },
    sameAs: [
      SOCIAL_FACEBOOK_URL,
      SOCIAL_INSTAGRAM_URL,
      SOCIAL_YOUTUBE_URL,
    ],
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(GOOGLE_MAPS_LOCATION_QUERY)}`,
  };

  if (
    reviewData?.rating !== undefined &&
    reviewData.reviewCount !== undefined &&
    reviewData.reviewCount > 0
  ) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviewData.rating,
      reviewCount: reviewData.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (reviewData?.reviews.length) {
    jsonLd.review = reviewData.reviews.map((item) => {
      const review: Record<string, unknown> = {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: item.author,
        },
        reviewBody: item.quote,
      };

      if (item.rating !== undefined) {
        review.reviewRating = {
          '@type': 'Rating',
          ratingValue: item.rating,
          bestRating: 5,
          worstRating: 1,
        };
      }

      return review;
    });
  }

  return jsonLd;
}
