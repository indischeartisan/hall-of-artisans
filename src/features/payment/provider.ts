import { komerceProvider } from "./komerceProvider";
import type { PaymentProvider, PaymentProviderId } from "./types";

const providers: Record<PaymentProviderId, PaymentProvider> = {
  KOMERCE: komerceProvider
};

export const getPaymentProvider = (id: PaymentProviderId) => providers[id];
