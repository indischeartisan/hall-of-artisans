import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import GlobalHeader from "./AdminHeader";
import { staffService, type StaffAccess } from "./staffService";
import { archiveCatalogAdminService, type ArchiveRecordInput, type CatalogArchiveRecord } from "./archiveCatalogAdminService";
import { adminDashboardService, type AdminCreation, type AdminOrder, type AdminOrderItem } from "./adminDashboardService";

const emptyForm = { archiveNumber: "", title: "", slug: "", creator: "", moods: "", story: "", imagePath: "", imageAlt: "", status: "active", featured: false, displayOrder: "0" };
type EditorForm = typeof emptyForm;
type ArchiveSeed = Partial<EditorForm>;
type ArchiveCandidate = { order: AdminOrder; item: AdminOrderItem; creation?: AdminCreation };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const listValue = (value: string) => value.split(/[,\n]/).map(item => item.trim()).filter(Boolean);
const fromRecord = (item: CatalogArchiveRecord): EditorForm => ({ archiveNumber: item.archive_number, title: item.title, slug: item.slug, creator: item.creator, moods: item.moods.join(", "), story: item.story, imagePath: item.image_path ?? "", imageAlt: item.image_alt ?? "", status: item.status, featured: item.is_featured, displayOrder: String(item.display_order) });
const nextArchiveNumber = (records: CatalogArchiveRecord[]) => {
  const next = Math.max(0, ...records.map(item => Number(item.archive_number.match(/\d+/)?.[0] ?? 0))) + 1;
  return `HOA-${String(next).padStart(4, "0")}`;
};
const seedFromCandidate = (candidate: ArchiveCandidate, records: CatalogArchiveRecord[]): ArchiveSeed => {
  const request = candidate.creation?.request;
  const snapshot = request?.submissionSnapshot ?? request?.previewSnapshot;
  const story = request?.fragranceBrief || snapshot?.writtenStory || request?.artisanReview?.summary || `A completed bespoke commission preserved from order ${candidate.order.orderNumber}.`;
  const moods = request?.fragranceDirection?.length ? request.fragranceDirection : [...(request?.topNotes ?? []), ...(request?.heartNotes ?? []), ...(request?.baseNotes ?? [])].slice(0, 6);
  return {
    archiveNumber: nextArchiveNumber(records),
    title: candidate.item.creationName,
    slug: slugify(candidate.item.creationName),
    creator: candidate.order.customer.name,
    moods: moods.join(", "),
    story,
    imagePath: request?.storyCardData?.imageUrl ?? "",
    imageAlt: `${candidate.item.creationName} perfume bottle`,
    status: "active",
    displayOrder: String(Math.max(-1, ...records.map(item => item.display_order)) + 1)
  };
};

function AccessGate({ access }: { access: StaffAccess | null }) {
  const navigate = useNavigate();
  return <><GlobalHeader variant="light"/><main className="admin-access"><span>Hall Archive CMS</span><h1>Administrator access is required.</h1><p>This workspace controls the records visible in the public Hall Archive.</p><div><button onClick={() => navigate("/admin/login?returnTo=/admin/hall-archive")}>Admin Sign In</button><button className="secondary" onClick={() => navigate("/hall-archive")}>Open Hall Archive</button></div></main></>;
}

function ArchiveEditor({ record, seed, onClose, onSaved }: { record: CatalogArchiveRecord | null; seed?: ArchiveSeed; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState<EditorForm>(() => record ? fromRecord(record) : { ...emptyForm, ...seed });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = useMemo(() => file ? URL.createObjectURL(file) : form.imagePath, [file, form.imagePath]);
  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => {
    if (record || seed) return;
    const candidateId = new URLSearchParams(window.location.search).get("candidate");
    if (!candidateId) return;
    void Promise.all([adminDashboardService.getSnapshot(), archiveCatalogAdminService.list()]).then(([snapshot, archiveRecords]) => {
      const order = snapshot.orders.find(entry => entry.items.some(item => item.reviewRequestId === candidateId));
      const item = order?.items.find(entry => entry.reviewRequestId === candidateId);
      if (!order || !item) return;
      const creation = snapshot.creations.find(entry => entry.request.id === candidateId);
      setForm(current => ({ ...current, ...seedFromCandidate({ order, item, creation }, archiveRecords) }));
    }).catch(cause => setError(cause instanceof Error ? cause.message : "Completed creation could not be prepared."));
  }, [record, seed]);
  const change = <K extends keyof EditorForm>(key: K, value: EditorForm[K]) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      let imagePath = form.imagePath.trim() || null;
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");
        if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
        imagePath = await archiveCatalogAdminService.uploadImage(file, slugify(form.slug || form.title));
      }
      const input: ArchiveRecordInput = { archive_number: form.archiveNumber.trim(), title: form.title.trim(), slug: slugify(form.slug || form.title), creator: form.creator.trim(), moods: listValue(form.moods), story: form.story.trim(), image_path: imagePath, image_alt: form.imageAlt.trim() || form.title.trim() + " perfume bottle", status: form.status, is_featured: form.featured, display_order: Number(form.displayOrder) || 0 };
      if (record) await archiveCatalogAdminService.update(record.id, input); else await archiveCatalogAdminService.create(input);
      await onSaved(); onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Archive record could not be saved."); }
    finally { setBusy(false); }
  };
  return <div className="admin-library-modal admin-archive-modal" role="presentation" onMouseDown={event => event.currentTarget === event.target && onClose()}><section role="dialog" aria-modal="true" aria-labelledby="archive-editor-title"><header><div><span>{record ? "Edit Archive Record" : "New Archive Record"}</span><h2 id="archive-editor-title">{record?.title ?? "Add to Hall Archive"}</h2></div><button type="button" onClick={onClose} aria-label="Close">×</button></header>{error && <p className="admin-error" role="alert">{error}</p>}<form onSubmit={submit}><div className="material-editor-grid"><label>Archive number<input required placeholder="HOA-0139" value={form.archiveNumber} onChange={e => change("archiveNumber", e.target.value.toUpperCase())}/></label><label>Title<input required value={form.title} onChange={e => change("title", e.target.value)}/></label><label>Slug<input required placeholder={slugify(form.title)} value={form.slug} onChange={e => change("slug", e.target.value)}/></label><label>Creator<input required value={form.creator} onChange={e => change("creator", e.target.value)}/></label><label>Status<select value={form.status} onChange={e => change("status", e.target.value)}><option value="active">Active</option><option value="archived">Archived / hidden</option></select></label><label>Display order<input min="0" type="number" value={form.displayOrder} onChange={e => change("displayOrder", e.target.value)}/></label><label className="material-check"><input type="checkbox" checked={form.featured} onChange={e => change("featured", e.target.checked)}/> Featured record</label></div><label>Moods <small>Separate with commas</small><input value={form.moods} onChange={e => change("moods", e.target.value)}/></label><label>Archive story<textarea required value={form.story} onChange={e => change("story", e.target.value)}/></label><div className="material-editor-grid material-image-fields"><label>Upload bottle image from computer<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml" onChange={e => setFile(e.target.files?.[0] ?? null)}/><small>PNG, JPG, WebP, GIF, AVIF, or SVG · maximum 5 MB</small></label><label>Image description<input value={form.imageAlt} onChange={e => change("imageAlt", e.target.value)}/></label>{preview && <figure className="material-upload-preview"><img src={preview} alt="Selected archive preview"/><figcaption>{file?.name ?? "Current image"}</figcaption></figure>}</div><footer><button type="button" className="secondary" onClick={onClose}>Cancel</button><button disabled={busy}>{busy ? "Uploading & saving…" : record ? "Save Changes" : "Add Record"}</button></footer></form></section></div>;
}

export default function AdminHallArchivePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [access, setAccess] = useState<StaffAccess | null>(null);
  const [records, setRecords] = useState<CatalogArchiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [editing, setEditing] = useState<CatalogArchiveRecord | "new" | null>(null);
  const [candidateSeed, setCandidateSeed] = useState<ArchiveSeed | null>(null);
  const [completedOrders, setCompletedOrders] = useState<AdminOrder[]>([]);
  const [creations, setCreations] = useState<AdminCreation[]>([]);
  const [handledCandidate, setHandledCandidate] = useState("");
  const load = async () => setRecords(await archiveCatalogAdminService.list());
  useEffect(() => { void staffService.getAccess().then(async result => { setAccess(result); if (result.role === "admin" || result.role === "super_admin") { const [, snapshot] = await Promise.all([load(), adminDashboardService.getSnapshot()]); setCompletedOrders(snapshot.orders.filter(order => order.productionStatus === "completed" || order.shippingStatus === "delivered")); setCreations(snapshot.creations); } }).catch(cause => setError(cause instanceof Error ? cause.message : "Archive could not be loaded.")).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => records.filter(item => (status === "all" || item.status === status) && (item.archive_number + " " + item.title + " " + item.creator + " " + item.moods.join(" ")).toLowerCase().includes(search.toLowerCase())), [records, search, status]);
  const run = async (operation: () => Promise<unknown>) => { setError(""); try { await operation(); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Archive action failed."); } };
  const candidates: ArchiveCandidate[] = completedOrders.flatMap(order => order.items.map(item => ({ order, item, creation: creations.find(entry => entry.request.id === item.reviewRequestId) })));
  const openCandidate = (candidate: ArchiveCandidate) => {
    setCandidateSeed(seedFromCandidate(candidate, records));
    setHandledCandidate(candidate.item.reviewRequestId);
    setEditing("new");
    setSearchParams(current => { const next = new URLSearchParams(current); next.set("candidate", candidate.item.reviewRequestId); return next; }, { replace: true });
  };
  useEffect(() => {
    const candidateId = searchParams.get("candidate");
    if (loading || editing || !candidateId || candidateId === handledCandidate || !candidates.length) return;
    const candidate = candidates.find(entry => entry.item.reviewRequestId === candidateId);
    if (candidate) openCandidate(candidate);
  }, [loading, candidates.length, searchParams, records.length, handledCandidate]);
  if (loading) return <div className="admin-loading">Opening Hall Archive CMS…</div>;
  if (access?.role !== "admin" && access?.role !== "super_admin") return <AccessGate access={access}/>;
  return <div className="admin-shell admin-library-shell admin-archive-shell"><GlobalHeader activeLabel="Hall Archive" variant="light"/><header className="admin-library-hero"><div><span>Administrator Workspace</span><h1>Hall Archive CMS</h1><p>Edit the same official records shown in the public Hall Archive.</p></div><div><button className="secondary" onClick={() => navigate("/admin")}>← Admin Portal</button><button onClick={() => setEditing("new")}>+ Add Record</button></div></header><section className="admin-library-toolbar"><label><span>Search</span><input type="search" value={search} placeholder="Number, title, creator, or mood…" onChange={e => setSearch(e.target.value)}/></label><label><span>Status</span><select value={status} onChange={e => setStatus(e.target.value)}><option value="active">Active</option><option value="archived">Archived</option><option value="all">All statuses</option></select></label></section>{error && <p className="admin-error" role="alert">{error}</p>}<main className="admin-material-grid admin-archive-grid">{filtered.map(item => <article key={item.id} className={item.status === "archived" ? "archived" : ""}><div className="admin-material-image">{item.image_path ? <img loading="lazy" decoding="async" src={item.image_path} alt={item.image_alt ?? ""}/> : <span>HA</span>}<em>{item.status}</em></div><div className="admin-material-copy"><small>{item.archive_number}</small><h2>{item.title}</h2><p>Created by {item.creator}</p><div>{item.moods.slice(0,3).map(mood => <span key={mood}>{mood}</span>)}</div></div><footer><button onClick={() => setEditing(item)}>Edit</button><button onClick={() => void run(() => item.status === "archived" ? archiveCatalogAdminService.restore(item.id) : archiveCatalogAdminService.archive(item.id))}>{item.status === "archived" ? "Restore" : "Archive"}</button><button className="danger" onClick={() => { if (window.confirm("Permanently delete " + item.title + "?")) void run(() => archiveCatalogAdminService.remove(item.id)); }}>Delete</button></footer></article>)}{!filtered.length && <section className="admin-library-empty"><h2>No archive records match this view.</h2><p>Change the filters or add a new official record.</p></section>}</main>{editing && <ArchiveEditor record={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={load}/>}</div>;
}
