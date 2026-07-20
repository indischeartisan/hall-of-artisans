import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import GlobalHeader from "../../components/GlobalHeader";
import { orderService } from "./orderService";
import type { CheckoutDetails, ReviewRequest } from "./types";

const money = (value: number | null, currency: string) => value === null ? "Awaiting final price" : new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

export default function CheckoutPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [eligible, setEligible] = useState<ReviewRequest[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [form, setForm] = useState<CheckoutDetails>({ recipient: "", address: "", phone: "", deliveryMethod: "Insured artisan delivery", paymentMethod: "Development mock payment", shippingPreference: "together" });
  const [error, setError] = useState("");

  useEffect(() => {
    orderService.ensureDemoData();
    const available = orderService.getCheckoutEligibleRequests();
    setEligible(available);
    const stored = orderService.getCheckoutSelection().filter((id) => available.some((item) => item.id === id));
    const initial = requestId && available.some((item) => item.id === requestId) ? [...new Set([requestId, ...stored])] : stored;
    setSelectedIds(initial);
    orderService.setCheckoutSelection(initial);
  }, [requestId]);

  const selected = useMemo(() => eligible.filter((item) => selectedIds.includes(item.id)), [eligible, selectedIds]);
  const total = selected.reduce((sum, item) => sum + (item.finalPrice ?? 0), 0);
  const currency = selected[0]?.currency ?? "IDR";
  const update = <K extends keyof CheckoutDetails>(key: K, value: CheckoutDetails[K]) => setForm((current) => ({ ...current, [key]: value }));
  const toggle = (id: string) => {
    const next = selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id];
    setSelectedIds(next); orderService.setCheckoutSelection(next);
  };
  const confirm = async () => {
    setError("");
    const result = await orderService.createCheckout(selectedIds, form);
    if (!result.ok || !result.data) { setError(result.error ?? "Checkout could not be created."); return; }
    navigate(`/my-orders/${result.data.items![0].reviewRequestId}`);
  };

  return <><GlobalHeader variant="light"/><main className="checkout-shell">
    <p className="checkout-dev">DEVELOPMENT MOCK CHECKOUT — NO REAL PAYMENT WILL BE MADE</p>
    <section>
      <div className="checkout-creations">
        <p>THE HALL OF ARTISANS</p><h1>Your Creations</h1>
        <p className="checkout-intro">Choose every approved creation you want to place in this order.</p>
        {eligible.length ? <div className="checkout-item-list">{eligible.map((item) => <label key={item.id} className={selectedIds.includes(item.id) ? "selected" : ""}>
          <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggle(item.id)}/>
          <span><strong>{item.perfumeName}</strong><small>{item.concentration} · {item.bottleSize}</small></span>
          <b>{money(item.finalPrice, item.currency)}</b>
        </label>)}</div> : <div className="checkout-empty"><strong>No creation is ready yet.</strong><p>An artisan must approve the creation and lock its final price before checkout.</p></div>}
        {selected.length > 1 && <p className="checkout-batch-note">One payment, {selected.length} independent creations. Each creation keeps its own production status.</p>}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); void confirm(); }}>
        <div className="checkout-form-heading"><small>ORDER SUMMARY</small><strong>{selected.length} {selected.length === 1 ? "creation" : "creations"} selected</strong></div>
        <label>Recipient<input value={form.recipient} onChange={(e) => update("recipient", e.target.value)} required/></label>
        <label>Address<textarea value={form.address} onChange={(e) => update("address", e.target.value)} required/></label>
        <label>Phone<input value={form.phone} onChange={(e) => update("phone", e.target.value)} required/></label>
        <label>Delivery method<select value={form.deliveryMethod} onChange={(e) => update("deliveryMethod", e.target.value)}><option>Insured artisan delivery</option><option>Studio collection</option></select></label>
        {selected.length > 1 && <fieldset><legend>When creations finish at different times</legend><label><input type="radio" name="shipping" checked={form.shippingPreference === "together"} onChange={() => update("shippingPreference", "together")}/> Send together when all are ready</label><label><input type="radio" name="shipping" checked={form.shippingPreference === "separately"} onChange={() => update("shippingPreference", "separately")}/> Send each creation when ready</label></fieldset>}
        <label>Payment method<select value={form.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)}><option>Development mock payment</option></select></label>
        <div className="checkout-total"><span>Total</span><strong>{money(total, currency)}</strong></div>
        {error&&<p className="checkout-error" role="alert">{error}</p>}
        <button disabled={!selected.length}>Create Mock Checkout</button><small>This creates a payment-pending order. It cannot mark payment as paid.</small>
      </form>
    </section>
  </main></>;
}
