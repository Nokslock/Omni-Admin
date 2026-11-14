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

/** Tips still inside the hold period, grouped by the day they come out of it. */
export type HoldDay = {
  /** ISO date (UTC), e.g. 2026-11-20. */
  date: string;
  coins: number;
  people: number;
};

export type PayoutOverview = {
  payouts: Payout[];
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
