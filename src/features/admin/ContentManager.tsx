import { useEffect, useMemo, useState } from "react";
import { cmsService, type CmsContentType, type CmsEntry, type CmsEntryInput, type CmsStatus } from "./cmsService";

const labels: Record<CmsContentType, string> = {
  page: "Page",
  academy_lesson: "Academy Lesson",
  library_entry: "Library Entry",
  archive_record: "Archive Record"
};

const emptyForm = {
  contentType: "page" as CmsContentType,
  slug: "",
  locale: "en",
  title: "",
  summary: "",
  body: "",
  seoTitle: "",
  seoDescription: "",
  status: "draft" as CmsStatus
};

const objectValue = (value: unknown, key: string) => {
  if (!value || Array.isArray(value) || typeof value !== "object") return "";
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" ? candidate : "";
};

const fromEntry = (entry: CmsEntry) => ({
  contentType: entry.content_type as CmsContentType,
  slug: entry.slug,
  locale: entry.locale,
  title: entry.title,
  summary: entry.summary ?? "",
  body: objectValue(entry.content, "body"),
  seoTitle: objectValue(entry.seo, "title"),
  seoDescription: objectValue(entry.seo, "description"),
  status: entry.status as CmsStatus
});

export default function ContentManager() {
  const [entries, setEntries] = useState<CmsEntry[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const selected = useMemo(() => entries.find(item => item.id === selectedId) ?? null, [entries, selectedId]);

  const load = async (preferredId?: string) => {
    const rows = await cmsService.list();
    setEntries(rows);
    const nextId = preferredId ?? selectedId;
    if (nextId && rows.some(item => item.id === nextId)) setSelectedId(nextId);
  };

  useEffect(() => { void load().catch(cause => setError(cause instanceof Error ? cause.message : "Content could not be loaded.")); }, []);

  const choose = (entry: CmsEntry) => { setSelectedId(entry.id); setForm(fromEntry(entry)); setError(""); setNotice(""); };
  const createNew = () => { setSelectedId(""); setForm(emptyForm); setError(""); setNotice(""); };
  const change = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm(current => ({ ...current, [key]: value }));
  const save = async (event: { preventDefault(): void }, nextStatus: CmsStatus) => {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const input: CmsEntryInput = {
        contentType: form.contentType, slug: form.slug, locale: form.locale,
        title: form.title, summary: form.summary, status: nextStatus,
        content: { body: form.body },
        seo: { title: form.seoTitle || form.title, description: form.seoDescription || form.summary }
      };
      const saved = selected ? await cmsService.update(selected.id, input) : await cmsService.create(input);
      setSelectedId(saved.id); setForm(fromEntry(saved)); await load(saved.id);
      setNotice(nextStatus === "published" ? "Content published." : "Draft saved.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Content could not be saved."); }
    finally { setBusy(false); }
  };

  const archive = async () => {
    if (!selected) return;
    setBusy(true); setError(""); setNotice("");
    try { const saved = await cmsService.archive(selected.id); setForm(fromEntry(saved)); await load(saved.id); setNotice("Content archived."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Content could not be archived."); }
    finally { setBusy(false); }
  };

  return <div className="cms-layout">
    <aside className="cms-list">
      <header><span>Editorial CMS</span><h2>Content</h2><a className="cms-library-link" href="/admin/library">Manage Library Materials</a><a className="cms-library-link" href="/admin/hall-archive">Manage Hall Archive</a><button type="button" onClick={createNew}>+ New Content</button></header>
      {entries.length ? entries.map(entry => <button type="button" className={entry.id === selectedId ? "active" : ""} key={entry.id} onClick={() => choose(entry)}><span><strong>{entry.title}</strong><small>{labels[entry.content_type as CmsContentType]} · /{entry.slug}</small></span><em className={entry.status}>{entry.status}</em></button>) : <p>No content has been created yet.</p>}
    </aside>
    <main className="cms-editor">
      <header><div><span>{selected ? "Edit Content" : "New Content"}</span><h1>{selected ? selected.title : "Create an editorial record"}</h1></div>{selected && <strong className={selected.status}>{selected.status}</strong>}</header>
      {error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="cms-notice">{notice}</p>}
      <form onSubmit={event => void save(event, "draft")}>
        <section className="admin-panel cms-fields"><div className="cms-field-grid"><label>Content type<select value={form.contentType} onChange={e => change("contentType", e.target.value as CmsContentType)}>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Locale<input required value={form.locale} onChange={e => change("locale", e.target.value)} /></label><label>Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="about-the-hall" value={form.slug} onChange={e => change("slug", e.target.value)} /></label></div><label>Title<input required maxLength={200} value={form.title} onChange={e => change("title", e.target.value)} /></label><label>Summary<textarea maxLength={1000} value={form.summary} onChange={e => change("summary", e.target.value)} /></label></section>
        <section className="admin-panel cms-copy"><label>Content body <small>Write the text visitors will read.</small><textarea required placeholder="Write your content here…" value={form.body} onChange={e => change("body", e.target.value)} /></label></section>
        <section className="admin-panel cms-seo"><header><span>Search Preview</span><h2>Google title and description</h2><p>These fields help people understand the page in search results. Leave them empty to reuse the title and summary above.</p></header><label>Google title<input maxLength={200} placeholder={form.title || "Page title"} value={form.seoTitle} onChange={e => change("seoTitle", e.target.value)} /></label><label>Google description<textarea maxLength={1000} placeholder={form.summary || "Short page description"} value={form.seoDescription} onChange={e => change("seoDescription", e.target.value)} /></label></section>
        <div className="cms-actions"><button type="submit" disabled={busy}>{busy ? "Saving…" : "Save Draft"}</button><button type="button" className="publish" disabled={busy} onClick={event => void save(event, "published")}>Publish</button>{selected && selected.status !== "archived" && <button type="button" className="archive" disabled={busy} onClick={() => void archive()}>Archive</button>}</div>
      </form>
    </main>
  </div>;
}
