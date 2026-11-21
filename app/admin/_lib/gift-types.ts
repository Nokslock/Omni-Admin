/**
 * The gift list (public.gift_types): what people buy with Kasala Coins and send
 * to reporters. Shared by the page, the editor and the server actions.
 */

export const GIFT_LANGS = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "de", label: "German" },
] as const;

export type GiftLang = (typeof GIFT_LANGS)[number]["code"];

export type GiftTypeRow = {
  id: string;
  emoji: string;
  imageUrl: string | null;
  names: Partial<Record<GiftLang, string>>;
  coins: number;
  sort: number;
  active: boolean;
  /** Times sent, all time and in the last 30 days. */
  sentAllTime: number;
  sentLast30: number;
};

export type GiftInput = {
  id: string;
  emoji: string;
  imageUrl: string;
  names: Partial<Record<GiftLang, string>>;
  coins: number;
  active: boolean;
};

/** Cheapest and dearest a gift may cost. The server refuses gifts under 2. */
export const MIN_GIFT_COINS = 2;
export const MAX_GIFT_COINS = 10000;

/**
 * Prices that app versions from before the gift list still send as plain coin
 * amounts. Each needs an active gift at that price, or those versions can't
 * send it.
 */
export const LEGACY_PRICES = [5, 10, 25] as const;

/** What the reporter's earnings go up by for a gift (rounded down, at least 1). */
export function reporterShare(coins: number, percent: number): number {
  return Math.max(1, Math.floor((coins * percent) / 100));
}

/** Returns a problem with the input, or null when it can be saved. */
export function validateGift(input: GiftInput, isNew: boolean): string | null {
  if (isNew && !/^[a-z][a-z0-9_]{1,29}$/.test(input.id)) {
    return "The ID must be 2–30 lowercase letters, numbers or underscores, starting with a letter (for example: candle).";
  }
  const emoji = input.emoji.trim();
  if (!emoji) return "Add an emoji.";
  if ([...emoji].length > 8) return "Use a single emoji.";
  if (!input.names.en?.trim()) return "Add the English name.";
  for (const { code } of GIFT_LANGS) {
    if ((input.names[code]?.trim().length ?? 0) > 24) return "Keep names to 24 characters so they fit on phones.";
  }
  if (!Number.isInteger(input.coins) || input.coins < MIN_GIFT_COINS || input.coins > MAX_GIFT_COINS) {
    return `The price must be a whole number of coins from ${MIN_GIFT_COINS} to ${MAX_GIFT_COINS.toLocaleString()}.`;
  }
  const url = input.imageUrl.trim();
  if (url && !/^https:\/\/\S+$/.test(url)) return "The image link must start with https://.";
  return null;
}
