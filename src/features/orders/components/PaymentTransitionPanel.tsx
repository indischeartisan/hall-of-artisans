import type { Order, ReviewRequest } from "../types";
import { money } from "./OrderComponents";

type Props = {
  request: ReviewRequest;
  order: Order | null;
  busy: boolean;
  onCheckout: () => void;
};

export default function PaymentTransitionPanel({ request, order, busy, onCheckout }: Props) {
  const waiting = request.status === "PAYMENT_PENDING";
  const packageName = request.packageSnapshot?.name || "Artisan Creation";
  const adjustmentCount = request.revisionsIncluded ?? request.packageSnapshot?.consultationsIncluded ?? 0;

  return <section className={`payment-transition${waiting ? " payment-transition--waiting" : ""}`}>
    <p>{waiting ? "Payment Pending" : "Everything Is Ready"}</p>
    <h2>{waiting ? "Your order is awaiting payment confirmation." : "Your creation has been approved."}</h2>
    <span>{waiting
      ? "Your approved proposal and checkout details are safely preserved. Crafting begins after payment is confirmed."
      : "Complete payment to begin crafting. Your approved proposal and package price are now locked."}</span>

    <div className="payment-transition__package">
      <div><small>{packageName}</small><strong>{request.bottleSize}</strong><span>{adjustmentCount} adjustment{adjustmentCount === 1 ? "" : "s"} included</span></div>
      <strong>{money(request.finalPrice, request.currency)}</strong>
    </div>

    {waiting ? <details className="payment-transition__details">
      <summary>View Order Details</summary>
      <dl><div><dt>Order</dt><dd>{order?.orderNumber || "Checkout created"}</dd></div><div><dt>Payment</dt><dd>{order?.paymentStatus || "Pending"}</dd></div><div><dt>Production</dt><dd>Starts after payment confirmation</dd></div></dl>
    </details> : <>
      <button className="payment-transition__primary" type="button" disabled={busy || !request.finalPrice || !request.selectedPackageId} onClick={onCheckout}>{busy ? "Opening…" : "Continue to Payment"}</button>
      <small className="payment-transition__note">Payment unlocks the Crafting stage.</small>
    </>}
  </section>;
}
