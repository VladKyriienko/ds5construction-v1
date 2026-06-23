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
};

type PlaceDetailsResponse = {
  reviews?: PlaceReview[];
};

type ReviewsCacheFile = {
  fetchedAt: string;
  items: GoogleReviewItem[];
};

function normalizePlaceId(placeId: string): string {
  const trimmed = placeId.trim();
  if (trimmed.startsWith('places/'))
    return trimmed.slice(7).trim();
  return trimmed;
}

function readReviewsCache(): GoogleReviewItem[] {
  if (!existsSync(CACHE_PATH)) return [];

  try {
    const data = JSON.parse(
      readFileSync(CACHE_PATH, 'utf8'),
    ) as ReviewsCacheFile;
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

function writeReviewsCache(
  items: GoogleReviewItem[],
): void {
  const payload: ReviewsCacheFile = {
    fetchedAt: new Date().toISOString(),
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
): Promise<GoogleReviewItem[]> {
  const rawId = normalizePlaceId(placeId);
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(rawId)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey.trim(),
      'X-Goog-FieldMask': 'reviews',
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
    items.push({ quote, author, project });
  }

  return items;
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
    const items = await fetchGoogleReviewsUncached(id, key);
    if (items.length > 0) writeReviewsCache(items);
    return items;
  } catch (err) {
    console.error(
      '[google-reviews]',
      err instanceof Error ? err.message : err,
    );
    return cached;
  }
}
