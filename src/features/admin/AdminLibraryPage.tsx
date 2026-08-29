import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "./AdminHeader";
import { staffService, type StaffAccess } from "./staffService";
import { materialCatalogAdminService, type CatalogMaterial, type MaterialCategory, type MaterialInput } from "./materialCatalogAdminService";

const emptyForm = { name: "", slug: "", categoryId: "", materialType: "", family: "", status: "active", description: "", imagePath: "", imageAlt: "", isFeatured: false, displayOrder: "0", moods: "", tags: "", layers: "", bestUsedFor: "", pairsWellWith: "", avoidIf: "" };
type EditorForm = typeof emptyForm;
const listValue = (value: string) => value.split(/[,\n]/).map(item => item.trim()).filter(Boolean);
const textValue = (value: string) => value.trim() || null;
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const imageSource = (value: string | null) => value && (/^(https?:|\/)/.test(value) ? value : `/${value}`);

function fromMaterial(item: CatalogMaterial): EditorForm {
  return { name: item.name, slug: item.slug, categoryId: item.category_id, materialType: item.material_type ?? "", family: item.family ?? "", status: item.status, description: item.description ?? "", imagePath: item.image_path ?? "", imageAlt: item.image_alt ?? "", isFeatured: item.is_featured, displayOrder: String(item.display_order), moods: item.moods.join(", "), tags: item.tags.join(", "), layers: item.layers.join(", "), bestUsedFor: item.best_used_for.join("\n"), pairsWellWith: item.pairs_well_with.join("\n"), avoidIf: item.avoid_if.join("\n") };
}

function AccessGate({ access }: { access: StaffAccess | null }) {
  const navigate = useNavigate();
  return <><GlobalHeader variant="light"/><main className="admin-access"><span>Material Catalog</span><h1>Administrator access is required.</h1><p>This catalog controls the materials visible in both The Library and Artisan Bench.</p><div><button onClick={() => navigate("/admin/login?returnTo=/admin/library")}>Admin Sign In</button><button className="secondary" onClick={() => navigate("/library")}>Open Public Library</button></div></main></>;
}

function MaterialEditor({ material, categories, onClose, onSaved }: { material: CatalogMaterial | null; categories: MaterialCategory[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState<EditorForm>(() => material ? fromMaterial(material) : { ...emptyForm, categoryId: categories[0]?.id ?? "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imagePreview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : imageSource(form.imagePath) || "", [imageFile, form.imagePath]);
  useEffect(() => () => { if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview); }, [imagePreview]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = <K extends keyof EditorForm>(key: K, value: EditorForm[K]) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      let imagePath = textValue(form.imagePath);
      if (imageFile) {
        if (imageFile.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");
        if (!imageFile.type.startsWith("image/")) throw new Error("Please choose an image file.");
        imagePath = (await materialCatalogAdminService.uploadImage(imageFile, slugify(form.slug || form.name))).publicUrl;
      }
      const input: MaterialInput = { name: form.name.trim(), slug: slugify(form.slug || form.name), category_id: form.categoryId, material_type: textValue(form.materialType), family: textValue(form.family), status: form.status, description: textValue(form.description), image_path: imagePath, image_alt: textValue(form.imageAlt) ?? `${form.name.trim()} material illustration`, is_featured: form.isFeatured, display_order: Number(form.displayOrder) || 0, moods: listValue(form.moods), tags: listValue(form.tags), layers: listValue(form.layers), best_used_for: listValue(form.bestUsedFor), pairs_well_with: listValue(form.pairsWellWith), avoid_if: listValue(form.avoidIf) };
      if (material) await materialCatalogAdminService.update(material.id, input); else await materialCatalogAdminService.create(input);
      await onSaved(); onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Material could not be saved."); }
    finally { setBusy(false); }
  };
  return <div className="admin-library-modal" role="presentation" onMouseDown={event => { if (event.currentTarget === event.target) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="material-editor-title">
      <header><div><span>{material ? "Edit Material" : "New Material"}</span><h2 id="material-editor-title">{material?.name ?? "Add to The Library"}</h2></div><button type="button" onClick={onClose} aria-label="Close">×</button></header>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <form onSubmit={submit}>
        <div className="material-editor-grid">
          <label>Name<input required value={form.name} onChange={e => change("name", e.target.value)} /></label>
          <label>Slug<input required value={form.slug} placeholder={slugify(form.name)} onChange={e => change("slug", e.target.value)} /></label>
          <label>Category<select required value={form.categoryId} onChange={e => change("categoryId", e.target.value)}>{categories.filter(item => item.status === "active").map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Status<select value={form.status} onChange={e => change("status", e.target.value)}><option value="active">Active</option><option value="coming_soon">Coming Soon</option><option value="archived">Archived</option></select></label>
          <label>Material type<input value={form.materialType} onChange={e => change("materialType", e.target.value)} /></label>
          <label>Family<input value={form.family} onChange={e => change("family", e.target.value)} /></label>
          <label>Display order<input min="0" type="number" value={form.displayOrder} onChange={e => change("displayOrder", e.target.value)} /></label>
          <label className="material-check"><input type="checkbox" checked={form.isFeatured} onChange={e => change("isFeatured", e.target.checked)} /> Featured material</label>
        </div>
        <label>Description<textarea value={form.description} onChange={e => change("description", e.target.value)} /></label>
        <div className="material-editor-grid material-image-fields">
          <label>Upload image from computer<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml" onChange={e => setImageFile(e.target.files?.[0] ?? null)} /><small>PNG, JPG, WebP, GIF, AVIF, or SVG · maximum 5 MB</small></label>
          <label>Image description<input value={form.imageAlt} onChange={e => change("imageAlt", e.target.value)} /></label>
          {imagePreview && <figure className="material-upload-preview"><img src={imagePreview} alt="Selected material preview"/><figcaption>{imageFile?.name ?? "Current image"}</figcaption></figure>}
        </div>
        <div className="material-editor-grid material-editor-lists">
          <label>Moods <small>Separate with commas</small><textarea value={form.moods} onChange={e => change("moods", e.target.value)} /></label>
          <label>Tags <small>Separate with commas</small><textarea value={form.tags} onChange={e => change("tags", e.target.value)} /></label>
          <label>Perfume layers <small>Top, Heart, Base</small><textarea value={form.layers} onChange={e => change("layers", e.target.value)} /></label>
          <label>Best used for <small>One item per line</small><textarea value={form.bestUsedFor} onChange={e => change("bestUsedFor", e.target.value)} /></label>
          <label>Pairs well with <small>One item per line</small><textarea value={form.pairsWellWith} onChange={e => change("pairsWellWith", e.target.value)} /></label>
          <label>Avoid if <small>One item per line</small><textarea value={form.avoidIf} onChange={e => change("avoidIf", e.target.value)} /></label>
        </div>
        <footer><button type="button" className="secondary" onClick={onClose}>Cancel</button><button disabled={busy}>{busy ? "Uploading & saving…" : material ? "Save Changes" : "Add Material"}</button></footer>
      </form>
    </section>
  </div>;
}

export default function AdminLibraryPage() {
  const navigate = useNavigate();
  const [access, setAccess] = useState<StaffAccess | null>(null);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [materials, setMaterials] = useState<CatalogMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("active");
  const [editing, setEditing] = useState<CatalogMaterial | "new" | null>(null);
  const load = async () => { const result = await materialCatalogAdminService.list(); setCategories(result.categories); setMaterials(result.materials); };
  useEffect(() => { void staffService.getAccess().then(async result => { setAccess(result); if (result.role === "admin" || result.role === "super_admin") await load(); }).catch(cause => setError(cause instanceof Error ? cause.message : "Catalog could not be loaded.")).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => materials.filter(item => (status === "all" || item.status === status) && (category === "all" || item.category_id === category) && `${item.name} ${item.family ?? ""} ${item.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase())), [materials, category, status, search]);
  const categoryNames = useMemo(() => new Map(categories.map(item => [item.id, item.name])), [categories]);
  const run = async (operation: () => Promise<unknown>) => { setError(""); try { await operation(); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Catalog action failed."); } };
  if (loading) return <div className="admin-loading">Opening the material catalog…</div>;
  if (access?.role !== "admin" && access?.role !== "super_admin") return <AccessGate access={access}/>;
  return <div className="admin-shell admin-library-shell"><GlobalHeader activeLabel="The Library" variant="light"/><header className="admin-library-hero"><div><span>Administrator Workspace</span><h1>The Library Catalog</h1><p>Edit the shared material source used by The Library and Artisan Bench.</p></div><div><button className="secondary" onClick={() => navigate("/admin")}>← Admin Portal</button><button onClick={() => setEditing("new")}>+ Add Material</button></div></header><section className="admin-library-toolbar"><label><span>Search</span><input type="search" value={search} placeholder="Material, family, or tag…" onChange={e => setSearch(e.target.value)} /></label><label><span>Status</span><select value={status} onChange={e => setStatus(e.target.value)}><option value="active">Active</option><option value="coming_soon">Coming Soon</option><option value="archived">Archived</option><option value="all">All statuses</option></select></label></section><nav className="admin-library-categories" aria-label="Material categories"><button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>All <em>{materials.length}</em></button>{categories.filter(item => item.status === "active").map(item => <button className={category === item.id ? "active" : ""} key={item.id} onClick={() => setCategory(item.id)}>{item.name}</button>)}</nav>{error && <p className="admin-error" role="alert">{error}</p>}<main className="admin-material-grid">{filtered.map(item => { const src = imageSource(item.image_path); return <article key={item.id} className={item.status === "archived" ? "archived" : ""}><div className="admin-material-image">{src ? <img loading="lazy" decoding="async" src={src} alt={item.image_alt ?? ""}/> : <span>{item.name.split(/\s+/).map(word => word[0]).join("").slice(0,2)}</span>}<em>{item.status.replace("_", " ")}</em></div><div className="admin-material-copy"><small>{categoryNames.get(item.category_id) ?? item.family ?? "Material"}</small><h2>{item.name}</h2><p>{item.description || "No description has been added yet."}</p><div>{item.tags.slice(0,3).map(tag => <span key={tag}>{tag}</span>)}</div></div><footer><button onClick={() => setEditing(item)}>Edit</button><button onClick={() => void run(() => item.status === "archived" ? materialCatalogAdminService.restore(item.id) : materialCatalogAdminService.archive(item.id))}>{item.status === "archived" ? "Restore" : "Archive"}</button><button className="danger" onClick={() => { if (window.confirm(`Permanently delete ${item.name}? Archive is safer for materials already used in drafts.`)) void run(() => materialCatalogAdminService.remove(item.id)); }}>Delete</button></footer></article>;})}{!filtered.length && <section className="admin-library-empty"><h2>No materials match this view.</h2><p>Change the filters or add a new material.</p></section>}</main>{editing && <MaterialEditor material={editing === "new" ? null : editing} categories={categories} onClose={() => setEditing(null)} onSaved={load}/>}</div>;
}
