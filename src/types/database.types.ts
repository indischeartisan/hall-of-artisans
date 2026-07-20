/**
 * TEMPORARY HAND-MAINTAINED PHASE 1 TYPES.
 * Replace this file with `supabase gen types typescript` after migrations run.
 * It is deliberately not labelled as generated.
 */
export type Json=string|number|boolean|null|{[key:string]:Json|undefined}|Json[];
export type AppRole="customer"|"reviewer"|"admin"|"super_admin";
export type ArtisanIdStatus="active"|"suspended"|"revoked";

type ProfileRow={id:string;display_name:string;portrait_path:string|null;is_profile_complete:boolean;profile_completed_at:string|null;suspended_at:string|null;deleted_at:string|null;created_at:string;updated_at:string};
type UserRoleRow={id:string;user_id:string;role:AppRole;assigned_by:string|null;reason:string|null;created_at:string;revoked_at:string|null};
type ArtisanIdRow={id:string;user_id:string;public_id:string;status:ArtisanIdStatus;display_name_snapshot:string;issued_at:string;suspended_at:string|null;revoked_at:string|null;created_at:string;updated_at:string};
export interface Database { public:{Tables:{
  profiles:{Row:ProfileRow;Insert:Omit<ProfileRow,"created_at"|"updated_at">&{created_at?:string;updated_at?:string};Update:Partial<Pick<ProfileRow,"display_name"|"portrait_path">>;Relationships:[]};
  user_roles:{Row:UserRoleRow;Insert:Omit<UserRoleRow,"id"|"created_at"|"revoked_at">&{id?:string;created_at?:string;revoked_at?:string|null};Update:Partial<UserRoleRow>;Relationships:[]};
  artisan_ids:{Row:ArtisanIdRow;Insert:Omit<ArtisanIdRow,"id"|"public_id"|"issued_at"|"created_at"|"updated_at">&{id?:string;public_id?:string;issued_at?:string;created_at?:string;updated_at?:string};Update:Partial<ArtisanIdRow>;Relationships:[]};
};Views:Record<string,never>;Functions:{
  has_role:{Args:{required_role:AppRole};Returns:boolean};is_reviewer_or_admin:{Args:Record<PropertyKey,never>;Returns:boolean};is_admin:{Args:Record<PropertyKey,never>;Returns:boolean};is_super_admin:{Args:Record<PropertyKey,never>;Returns:boolean};
  complete_profile:{Args:{new_display_name:string};Returns:ProfileRow};issue_artisan_id:{Args:Record<PropertyKey,never>;Returns:ArtisanIdRow};manage_artisan_id:{Args:{target_user_id:string;new_status:ArtisanIdStatus};Returns:ArtisanIdRow};assign_app_role:{Args:{target_user_id:string;new_role:AppRole;assignment_reason?:string|null};Returns:UserRoleRow};revoke_app_role:{Args:{target_user_id:string;role_to_revoke:AppRole};Returns:undefined};
};Enums:{app_role:AppRole;artisan_id_status:ArtisanIdStatus};CompositeTypes:Record<string,never>}; }
