type ProductCardProps = { label?: string; title: string; detail: string };

// Presentational shell only: catalog data and commerce behavior come later.
export default function ProductCard({ label = "Object of scent", title, detail }: ProductCardProps) {
  return <article className="indische-product-card">
    <div className="indische-product-card__image" aria-hidden="true"><span /></div>
    <p>{label}</p><h2>{title}</h2><small>{detail}</small>
  </article>;
}
