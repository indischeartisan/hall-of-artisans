import { Link, useSearchParams } from "react-router";
import EditorialSection from "./components/EditorialSection";
import SectionHeading from "./components/SectionHeading";

export default function DokuPaymentReturnPage() {
  const [params] = useSearchParams();
  const cancelled = params.get("status") === "cancelled";
  return <EditorialSection className="indische-placeholder indische-placeholder--checkout">
    <SectionHeading
      eyebrow="Indische Artisan"
      title={cancelled ? "Payment was not completed." : "Payment return received."}
      body={cancelled ? "No payment status has been changed." : "We will confirm your order only from a verified DOKU notification."}
    />
    <Link className="indische-text-link" to="/account">Return to your account</Link>
  </EditorialSection>;
}
