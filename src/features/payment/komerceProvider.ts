import type { PaymentProvider } from "./types";

/**
 * Deliberately non-live. Komerce's official payment API contract, credentials,
 * and webhook verification details must be supplied before this provider is wired.
 */
export const komerceProvider: PaymentProvider = {
  id: "KOMERCE",
  async createPayment() {
    throw new Error("Komerce Payment is not configured.");
  },
  async verifyWebhook() {
    throw new Error("Komerce Payment webhook verification is not configured.");
  },
  async getPaymentStatus() {
    throw new Error("Komerce Payment is not configured.");
  }
};
