import { getSupabaseClient, isSupabaseConfigured } from "../../lib/supabase";

export type LibraryMaterial = {
  id: string;
  name: string;
  category: string;
  type: string;
  families: string[];
  mood: string[];
  suggestedRole: string[];
  description: string;
  bestUsedFor: string[];
  pairsWellWith: string[];
  avoidIf: string[];
  status: "active" | "coming-soon";
  iconImage: string;
  imageAlt: string;
  icon: string;
};

export type LibraryCatalog = {
  categories: string[];
  featuredIds: string[];
  materials: LibraryMaterial[];
};

const titleCase = (value: string) => value
  .split(/[_-]/g)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

const iconFor = (category: string) => category
  .split(/\s+/g)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part.charAt(0).toUpperCase())
  .join("") || "M";

export async function loadLibraryCatalog(): Promise<LibraryCatalog | null> {
  if (!isSupabaseConfigured) return null;

  const client = getSupabaseClient();
  const [categoryResult, materialResult] = await Promise.all([
    client
      .from("material_categories")
      .select("id,name,display_order")
      .eq("status", "active")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    client
      .from("materials")
      .select("id,slug,legacy_library_id,category_id,name,material_type,family,layers,moods,description,best_used_for,pairs_well_with,avoid_if,image_path,image_alt,is_featured,display_order,status")
      .in("status", ["active", "coming_soon"])
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (categoryResult.error) throw categoryResult.error;
  if (materialResult.error) throw materialResult.error;
  if (!categoryResult.data?.length || !materialResult.data?.length) return null;

  const categoryNames = new Map(categoryResult.data.map((category) => [category.id, category.name]));
  const materials = materialResult.data.map((material): LibraryMaterial => {
    const category = categoryNames.get(material.category_id) || material.family || "Materials";
    const id = material.legacy_library_id || material.slug;
    return {
      id,
      name: material.name,
      category,
      type: material.material_type || material.family || "Material",
      families: [material.family || category],
      mood: material.moods || [],
      suggestedRole: (material.layers || []).map(titleCase),
      description: material.description || "This material is being catalogued inside The Hall.",
      bestUsedFor: material.best_used_for || [],
      pairsWellWith: material.pairs_well_with || [],
      avoidIf: material.avoid_if || [],
      status: material.status === "coming_soon" ? "coming-soon" : "active",
      iconImage: material.image_path || "",
      imageAlt: material.image_alt || `${material.name} material illustration`,
      icon: iconFor(category),
    };
  });

  return {
    categories: ["Featured Materials", "All", ...categoryResult.data.map((category) => category.name)],
    featuredIds: materialResult.data
      .filter((material) => material.is_featured)
      .map((material) => material.legacy_library_id || material.slug),
    materials,
  };
}
