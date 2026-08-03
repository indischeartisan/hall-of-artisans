import { getSupabaseClient } from "../../../lib/supabase";

export const academyClient = getSupabaseClient;

export function requireAcademyData<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error("Academy query returned no data.");
  return data;
}

export async function requireAcademyUserId(): Promise<string> {
  const { data, error } = await academyClient().auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Authentication required.");
  return data.user.id;
}
