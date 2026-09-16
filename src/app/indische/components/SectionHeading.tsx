export default function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return <header className="indische-section-heading">
    <p>{eyebrow}</p><h1>{title}</h1>{body ? <span>{body}</span> : null}
  </header>;
}
