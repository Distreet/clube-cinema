import type { Review } from '../types';

export const PALETTE = [
  ['#c0392b', '#3b0d18'],
  ['#2e6f8e', '#0f2433'],
  ['#7d5ba6', '#241238'],
  ['#d98a2b', '#3a1f08'],
  ['#2f8f6b', '#0c2a20'],
  ['#b8456b', '#33101d'],
  ['#5b6ee1', '#171a45'],
];

export function getPaletteColor(index: number): [string, string] {
  return PALETTE[index % PALETTE.length] as [string, string];
}

/**
 * Formats a number with 1 decimal place and Brazilian comma (e.g. 9.2 -> "9,2")
 */
export function formatRating(val: number): string {
  return val.toFixed(1).replace('.', ',');
}

/**
 * Converts a 0.5-5.0 rating into unicode stars (e.g. 4.5 -> "★★★★½")
 */
export function formatStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? '½' : '';
  return '★'.repeat(full) + half;
}

/**
 * Computes group average on a 0 to 10 scale (star rating * 2),
 * considering only reviews where rating is not null.
 */
export function calcGroupAverage(reviews: Review[]): number | null {
  const valid = reviews.filter((r): r is Review & { rating: number } => r.rating !== null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, curr) => acc + curr.rating, 0);
  return (sum / valid.length) * 2;
}
