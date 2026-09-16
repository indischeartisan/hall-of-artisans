export type PaymentProviderId = "KOMERCE";

export type InternalPaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";

export type PaymentOrder = {
  id: string;
  orderNumber: string;
  amount: number;
  currency: string;
};

export type PaymentCreation = {
  provider: PaymentProviderId;
  reference: string;
  paymentUrl: string | null;
};

export type PaymentProvider = {
  readonly id: PaymentProviderId;
  createPayment(order: PaymentOrder): Promise<PaymentCreation>;
  verifyWebhook(payload: unknown, signature: string | null): Promise<InternalPaymentStatus>;
  getPaymentStatus(reference: string): Promise<InternalPaymentStatus>;
};
