import { Link, useParams } from "react-router";
import EditorialSection from "./components/EditorialSection";
import ProductCard from "./components/ProductCard";
import SectionHeading from "./components/SectionHeading";
import { PrimaryButton, SecondaryButton } from "./components/IndischeButtons";

type PlaceholderKind = "home" | "shop" | "product" | "cart" | "checkout" | "account";

const content: Record<Exclude<PlaceholderKind, "product">, { eyebrow: string; title: string; body: string }> = {
  home: { eyebrow: "Indische Artisan", title: "A home for scent, story, and craft.", body: "The Indische Artisan storefront is being prepared. The Hall of Artisans remains available as part of this same experience." },
  shop: { eyebrow: "The Shop", title: "The collection is taking shape.", body: "Product catalog, bag, and checkout will arrive here without a separate application or account." },
  cart: { eyebrow: "Indische Bag", title: "Your bag is ready for future pieces.", body: "Commerce has intentionally not been implemented in this structural phase." },
  checkout: { eyebrow: "Checkout", title: "Checkout is being prepared.", body: "Existing Hall commission checkout remains available through its current workflow." },
  account: { eyebrow: "My Indische", title: "One identity, across Indische.", body: "Your existing Artisan account is shared by the storefront and The Hall." }
};

export default function IndischePlaceholderPage({ kind }: { kind: PlaceholderKind }) {
  const { slug } = useParams();
  const page = kind === "product"
    ? { eyebrow: "Product", title: slug ? `Product: ${slug}` : "Product detail", body: "Product data will be introduced in a later commerce phase." }
    : content[kind];

  return <EditorialSection className={`indische-placeholder indische-placeholder--${kind}`}>
    <SectionHeading eyebrow={page.eyebrow} title={page.title} body={page.body} />
    {kind === "home" ? <div className="indische-placeholder__actions"><PrimaryButton to="/hall">Enter The Hall</PrimaryButton><SecondaryButton to="/shop">Explore the shop</SecondaryButton></div> : null}
    {kind === "product" ? <ProductCard title={slug ?? "Untitled fragrance"} detail="A product page shell for a future collection." /> : null}
    {kind === "shop" ? <div className="indische-placeholder__note"><span>01</span><p>The collection will arrive here with room to breathe.</p></div> : null}
    {kind !== "home" && kind !== "shop" && kind !== "product" ? <Link className="indische-text-link" to="/">Return to Indische Artisan</Link> : null}
  </EditorialSection>;
}
