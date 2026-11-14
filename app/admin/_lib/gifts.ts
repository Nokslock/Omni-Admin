export const COIN_PRESETS = [10, 25, 50, 100] as const;
export const PRO_PRESETS = [
  { days: 7, label: "1 week" },
  { days: 30, label: "1 month" },
  { days: 90, label: "3 months" },
  { days: 365, label: "1 year" },
] as const;
export const MAX_COINS = 10000;
export const MAX_PRO_DAYS = 366;

export type Recipient = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  suspended: boolean;
  deleting: boolean;
  coins: { total: number; bought: number; earned: number };
  pro: {
    until: string;
    /** "kasala" for a gift from staff, otherwise the app store. */
    store: string | null;
    willRenew: boolean;
  } | null;
};

export type UserHit = { id: string; name: string; email: string | null; pro: boolean };

export type GrantRow = {
  id: string;
  kind: "coins" | "pro" | "pro_ended";
  coins: number | null;
  proDays: number | null;
  proUntil: string | null;
  note: string | null;
  createdAt: string;
  userId: string | null;
  userName: string;
  byName: string;
};

export const GIFT_ERRORS: Record<string, string> = {
  invalid_amount: `Coins must be a whole number from 1 to ${MAX_COINS}.`,
  invalid_days: `Pro must be from 1 to ${MAX_PRO_DAYS} days.`,
  user_not_active: "This account is suspended or being deleted.",
  already_subscribed:
    "They already pay for Pro through the App Store or Google Play, so days can't be added.",
  no_gifted_pro: "They don't have gifted Pro to end.",
  admins_only: "Only admins can send gifts.",
};
