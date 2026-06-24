import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import type { GoogleReviewItem } from '../types';

const MAX_REVIEWS = 5;
const CACHE_PATH = path.join(
  import.meta.dirname,
  '../data/google-reviews.cache.json',
);

type PlaceReview = {
  text?: { text?: string } | string;
  authorAttribution?: { displayName?: string };
  relativePublishTimeDescription?: string;
  rating?: number;
};

type PlaceDetailsResponse = {
  rating?: number;
  userRatingCount?: number;
  reviews?: PlaceReview[];
};

type ReviewsCacheFile = {
  fetchedAt: string;
  rating?: number;
  reviewCount?: number;
  items: GoogleReviewItem[];
};

export type GoogleReviewsSchemaData = {
  rating?: number;
  reviewCount?: number;
  reviews: GoogleReviewItem[];
};

function normalizePlaceId(placeId: string): string {
  const trimmed = placeId.trim();
  if (trimmed.startsWith('places/'))
    return trimmed.slice(7).trim();
  return trimmed;
}

function readReviewsCacheFile(): ReviewsCacheFile | null {
  if (!existsSync(CACHE_PATH)) return null;

  try {
    return JSON.parse(
      readFileSync(CACHE_PATH, 'utf8'),
    ) as ReviewsCacheFile;
  } catch {
    return null;
  }
}

function readReviewsCache(): GoogleReviewItem[] {
  const data = readReviewsCacheFile();
  return Array.isArray(data?.items) ? data.items : [];
}

export function readGoogleReviewsSchemaData(): GoogleReviewsSchemaData {
  const data = readReviewsCacheFile();
  return {
    rating: data?.rating,
    reviewCount: data?.reviewCount,
    reviews: Array.isArray(data?.items) ? data.items : [],
  };
}

function writeReviewsCache(
  items: GoogleReviewItem[],
  rating?: number,
  reviewCount?: number,
): void {
  const payload: ReviewsCacheFile = {
    fetchedAt: new Date().toISOString(),
    ...(rating !== undefined ? { rating } : {}),
    ...(reviewCount !== undefined ? { reviewCount } : {}),
    items,
  };
  writeFileSync(
    CACHE_PATH,
    `${JSON.stringify(payload, null, 2)}\n`,
  );
}

async function fetchGoogleReviewsUncached(
  placeId: string,
  apiKey: string,
): Promise<{
  items: GoogleReviewItem[];
  rating?: number;
  reviewCount?: number;
}> {
  const rawId = normalizePlaceId(placeId);
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(rawId)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey.trim(),
      'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
    },
  });
  const errText = await res.text();
  if (!res.ok)
    throw new Error(
      `Google Places API ${res.status}: ${errText}`,
    );

  const data = JSON.parse(errText) as PlaceDetailsResponse;
  const reviews = data.reviews ?? [];
  const items: GoogleReviewItem[] = [];

  for (
    let i = 0;
    i < Math.min(MAX_REVIEWS, reviews.length);
    i++
  ) {
    const r = reviews[i];
    if (!r) continue;
    const quote =
      typeof r.text === 'string'
        ? r.text
        : (r.text?.text ?? '');
    const author =
      r.authorAttribution?.displayName ?? 'Google review';
    const project =
      r.relativePublishTimeDescription ?? 'Google';
    if (!quote.trim()) continue;
    items.push({
      quote,
      author,
      project,
      ...(typeof r.rating === 'number'
        ? { rating: r.rating }
        : {}),
    });
  }

  return {
    items,
    rating: data.rating,
    reviewCount: data.userRatingCount,
  };
}

export async function getGoogleReviews(): Promise<
  GoogleReviewItem[]
> {
  const apiKey = import.meta.env.GOOGLE_PLACES_API_KEY;
  const placeId = import.meta.env.GOOGLE_PLACE_ID;

  const key = apiKey?.trim();
  const id = placeId?.trim();
  const cached = readReviewsCache();

  if (!key || !id) return cached;

  try {
    const { items, rating, reviewCount } =
      await fetchGoogleReviewsUncached(id, key);
    if (items.length > 0) {
      writeReviewsCache(items, rating, reviewCount);
    }
    return items;
  } catch (err) {
    console.error(
      '[google-reviews]',
      err instanceof Error ? err.message : err,
    );
    return cached;
  }
}
