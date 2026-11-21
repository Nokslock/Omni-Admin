export type PayoutStatus = "pending" | "paid" | "rejected";

export const payoutStatusMeta: Record<PayoutStatus, { label: string; color: string }> = {
  pending: { label: "Waiting to be paid", color: "#f59e0b" },
  paid: { label: "Paid", color: "#22c55e" },
  rejected: { label: "Rejected", color: "#ef4444" },
};

/** One cash-out request from the mobile app. */
export type Payout = {
  id: string;
  /** Null when the account has since been erased. */
  userId: string | null;
  userName: string;
  userEmail: string | null;
  userPhone: string | null;
  userSuspended: boolean;
  coins: number;
  /** Money value of one coin when the request was made. */
  coinValue: number;
  /** coins × coinValue. */
  amount: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  /**
   * True once staff have checked this bank account belongs to the person.
   * A request can't be marked paid until then.
   */
  accountVerified: boolean;
  status: PayoutStatus;
  /** Bank transfer reference, set when paid. */
  reference: string | null;
  /** Why it was rejected. */
  reason: string | null;
  createdAt: string;
  decidedAt: string | null;
};

/** Gift earnings still inside the hold period, grouped by the day they come out
 *  of it. `coins` is in points (1 point is worth one coin's value). */
export type HoldDay = {
  /** ISO date (UTC), e.g. 2026-11-20. */
  date: string;
  coins: number;
  people: number;
};

/** Gifts between members over one window, and what Kasala kept. */
export type GiftWindow = {
  /** Number of gifts sent. */
  gifts: number;
  /** Coins the senders paid. */
  sent: number;
  /** Coins that reached the reporters. */
  toReporters: number;
  /** Coins Kasala kept (sent − toReporters). */
  kept: number;
  /** How many of each gift were sent, most sent first. */
  byGift: { id: string; emoji: string; name: string; count: number }[];
};

export type GiftCut = {
  /** The reporter's share, in percent (60). */
  sharePercent: number;
  last30: GiftWindow;
  allTime: GiftWindow;
  /** When the first gift with a cut was sent; earlier gifts paid 100%. */
  cutSince: string | null;
};

export type PayoutOverview = {
  payouts: Payout[];
  gifts: GiftCut;
  currency: string;
  coinValue: number;
  /** Smallest cash-out the app allows, in coins. */
  minWithdrawal: number;
  /** Days a tip is held before it can be cashed out. */
  holdDays: number;
  /** Earned coins sitting in wallets, not yet requested. */
  earnedOutstanding: number;
  schedule: HoldDay[];
  /** When this was loaded on the server, so ages read the same on both sides. */
  loadedAtMs: number;
};

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/** Database errors, in words. */
export const PAYOUT_ERRORS: Record<string, string> = {
  staff_only: "Your account can't do this.",
  not_pending: "This request has already been paid or rejected.",
  account_not_verified: "Check and verify the bank account before marking this paid.",
};
