/**
 * Stable application-facing exports for the generated Supabase schema.
 * Regenerate database.generated.types.ts whenever the remote schema changes.
 */
import type { Database } from "./database.generated.types";

export type {
  CompositeTypes,
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate
} from "./database.generated.types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type ArtisanIdStatus = Database["public"]["Enums"]["artisan_id_status"];
