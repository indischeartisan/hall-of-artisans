import type { AcademyLessonBlock, AcademyLessonBlockTranslation } from "../services/academyCatalogService";
import { parseAcademyBlockContent } from "../types/academyBlockContent";

type Props = { block: AcademyLessonBlock; translation: AcademyLessonBlockTranslation | null };

export default function LessonBlockRenderer({ block, translation }: Props) {
  const content = parseAcademyBlockContent(block.block_type, translation?.content);
  if (!content) {
    if (import.meta.env.DEV) console.warn("Academy block omitted because its content is deferred or invalid.", { blockId: block.id, blockType: block.block_type });
    return null;
  }

  switch (content.type) {
    case "rich_text": return <section className="academy-block academy-rich-text">{content.sections.map((section, index) => {
      if (section.type === "heading") return section.level === 2 ? <h2 key={index}>{section.text}</h2> : <h3 key={index}>{section.text}</h3>;
      if (section.type === "paragraph") return <p key={index}>{section.runs.map((run, runIndex) => run.emphasis ? <em key={runIndex}>{run.text}</em> : <span key={runIndex}>{run.text}</span>)}</p>;
      const List = section.type === "numbered_list" ? "ol" : "ul";
      return <List key={index}>{section.items.map((item) => <li key={item}>{item}</li>)}</List>;
    })}</section>;
    case "image": return <figure className="academy-block academy-image"><img src={content.src} alt={content.alt} loading="lazy" />{content.caption ? <figcaption>{content.caption}</figcaption> : null}</figure>;
    case "diagram": return <section className="academy-block academy-diagram" aria-labelledby={`block-${block.id}`}><h2 id={`block-${block.id}`}>{content.title}</h2><div>{content.stages.map((stage) => <article key={stage.label}><strong>{stage.label}</strong><span>{stage.time}</span><p>{stage.description}</p></article>)}</div></section>;
    case "quote": return <blockquote className="academy-block"><p>{content.quote}</p>{content.attribution ? <cite>{content.attribution}</cite> : null}</blockquote>;
    case "perfumer_note": return <aside className="academy-block academy-note"><h2>{content.title}</h2><p>{content.note}</p></aside>;
    case "exercise": return <section className="academy-block academy-exercise"><h2>{content.title}</h2><ol>{content.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol></section>;
    case "summary": return <section className="academy-block academy-summary"><h2>{content.title}</h2><ul>{content.points.map((point) => <li key={point}>{point}</li>)}</ul></section>;
    case "divider": return <hr className="academy-divider" />;
  }
}
