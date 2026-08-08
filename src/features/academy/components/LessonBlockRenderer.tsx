import type { AcademyLessonBlock, AcademyLessonBlockTranslation } from "../services/academyCatalogService";
import { parseAcademyBlockContent, type RichSection } from "../types/academyBlockContent";

type Props = { block: AcademyLessonBlock; translation: AcademyLessonBlockTranslation | null };

function StructuredSections({ sections }: { sections: RichSection[] }) {
  return sections.map((section, index) => {
    if (section.type === "heading") {
      if (section.level === 2) return <h2 key={index}>{section.text}</h2>;
      if (section.level === 3) return <h3 key={index}>{section.text}</h3>;
      return <h4 key={index}>{section.text}</h4>;
    }
    if (section.type === "paragraph") return <p key={index}>{section.runs.map((run, runIndex) => run.emphasis ? <em key={runIndex}>{run.text}</em> : <span key={runIndex}>{run.text}</span>)}</p>;
    if (section.type === "quote") return <blockquote key={index}>{section.runs.map((run, runIndex) => run.emphasis ? <em key={runIndex}>{run.text}</em> : <span key={runIndex}>{run.text}</span>)}</blockquote>;
    const List = section.type === "numbered_list" ? "ol" : "ul";
    return <List key={index}>{section.items.map((item) => <li key={item}>{item}</li>)}</List>;
  });
}

export default function LessonBlockRenderer({ block, translation }: Props) {
  const content = parseAcademyBlockContent(block.block_type, translation?.content, block.settings);
  if (!content) {
    if (import.meta.env.DEV) console.warn("Academy block omitted because its content is deferred or invalid.", { blockId: block.id, blockType: block.block_type });
    return null;
  }

  switch (content.type) {
    case "rich_text": return <section className="academy-block academy-rich-text">{content.sections ? <StructuredSections sections={content.sections} /> : null}{!content.sections && content.heading ? <h2>{content.heading}</h2> : null}{content.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{content.subheading ? <h3>{content.subheading}</h3> : null}{content.exampleParagraphs?.map((paragraph) => <p className="academy-rich-text__example" key={paragraph}>{paragraph}</p>)}{content.misconception ? <aside className="academy-misconception"><strong>{translation?.locale === "id" ? "Kesalahpahaman umum" : "Common misconception"}</strong><p><s>{content.misconception.claim}</s></p><p>{content.misconception.correction}</p></aside> : null}{content.items ? <div className="academy-rich-text__items">{content.items.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div> : null}{content.closing ? <p className="academy-rich-text__closing">{content.closing}</p> : null}{content.nextLesson ? <aside className="academy-next-study"><span>{translation?.locale === "id" ? "Berikutnya" : "Coming next"}</span><h3>{content.nextLesson.title}</h3><p>{content.nextLesson.question}</p></aside> : null}</section>;
    case "image": return <figure className="academy-block academy-image"><img src={content.src} alt={content.alt} loading="lazy" />{content.caption ? <figcaption>{content.caption}</figcaption> : null}</figure>;
    case "diagram": return <section className={`academy-block academy-diagram academy-diagram--${content.layout}`} aria-labelledby={`block-${block.id}`}><h2 id={`block-${block.id}`}>{content.title}</h2>{content.stages ? <div>{content.stages.map((stage) => <article key={stage.label}><strong>{stage.label}</strong><span>{stage.time}</span><p>{stage.description}</p></article>)}</div> : null}{content.steps ? <ol>{content.steps.map((step, index) => <li key={step}><span>{index + 1}</span><strong>{step}</strong></li>)}</ol> : null}{content.center && content.nodes ? <div className="academy-diagram__radial"><strong>{content.center}</strong><ul>{content.nodes.map((node) => <li key={node}>{node}</li>)}</ul></div> : null}</section>;
    case "quote": return <blockquote className="academy-block"><p>{content.quote}</p>{content.attribution ? <cite>{content.attribution}</cite> : null}</blockquote>;
    case "perfumer_note": return <aside className="academy-block academy-note"><h2>{content.title}</h2>{content.sections ? <StructuredSections sections={content.sections} /> : <p>{content.note}</p>}</aside>;
    case "exercise": return <section className="academy-block academy-exercise"><h2>{content.title}</h2>{content.sections ? <StructuredSections sections={content.sections} /> : <>{content.purpose ? <p className="academy-exercise__purpose">{content.purpose}</p> : null}{content.materials ? <><h3>{translation?.locale === "id" ? "Yang dibutuhkan" : "Materials"}</h3><ul>{content.materials.map((item) => <li key={item}>{item}</li>)}</ul></> : null}<ol>{content.instructions?.map((instruction) => <li key={instruction}>{instruction}</li>)}{content.steps?.map((step) => <li key={step.title}><strong>{step.title}</strong><p>{step.body}</p></li>)}</ol>{content.closing ? <p>{content.closing}</p> : null}</>}</section>;
    case "journal_prompt": return <aside className="academy-block academy-journal-prompt"><h2>{content.title}</h2>{content.sections ? <StructuredSections sections={content.sections} /> : <><ol>{content.prompts?.map((prompt) => <li key={prompt}>{prompt}</li>)}</ol><p className="academy-journal-prompt__note">{content.note}</p></>}</aside>;
    case "summary": return <section className="academy-block academy-summary"><h2>{content.title}</h2>{content.sections ? <StructuredSections sections={content.sections} /> : <>{content.points ? <ul>{content.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}{content.items ? <ol>{content.items.map((item) => <li key={item.title}><strong>{item.title}</strong><p>{item.body}</p></li>)}</ol> : null}</>}</section>;
    case "divider": return <hr className="academy-divider" />;
  }
}
