import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { authService } from "../features/auth/authService";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase";
import type { AppRole, Tables } from "../types/database.types";

type Profile = Pick<Tables<"profiles">, "id" | "display_name" | "preferred_locale" | "certificate_name">;
type ArtisanId = Pick<Tables<"artisan_ids">, "id" | "user_id" | "public_id">;

const AUTH_PROFILE_COLUMNS = "id,display_name,preferred_locale,certificate_name";
const AUTH_ARTISAN_ID_COLUMNS = "id,user_id,public_id";

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  artisanId: ArtisanId | null;
  roles: AppRole[];
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [artisanId, setArtisanId] = useState<ArtisanId | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const sessionRef = useRef<Session | null>(null);
  const requestIdRef = useRef(0);

  const loadIdentity = useCallback(async (activeSession: Session | null) => {
    const requestId = ++requestIdRef.current;
    sessionRef.current = activeSession;
    setSession(activeSession);

    if (!activeSession) {
      setProfile(null);
      setArtisanId(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const client = getSupabaseClient();
    const userId = activeSession.user.id;
    const [profileResult, artisanIdResult, rolesResult] = await Promise.all([
      client.from("profiles").select(AUTH_PROFILE_COLUMNS).eq("id", userId).maybeSingle(),
      client.from("artisan_ids").select(AUTH_ARTISAN_ID_COLUMNS).eq("user_id", userId).maybeSingle(),
      client.from("user_roles").select("role").eq("user_id", userId).is("revoked_at", null)
    ]);

    if (requestId !== requestIdRef.current) return;
    setProfile(profileResult.error ? null : profileResult.data);
    setArtisanId(artisanIdResult.error ? null : artisanIdResult.data);
    setRoles(rolesResult.error ? [] : (rolesResult.data ?? []).map((item) => item.role));
    setLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadIdentity(sessionRef.current);
  }, [loadIdentity]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    return authService.observeSession((nextSession) => {
      window.setTimeout(() => { void loadIdentity(nextSession); }, 0);
    });
  }, [loadIdentity]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    artisanId,
    roles,
    loading,
    refreshProfile
  }), [artisanId, loading, profile, refreshProfile, roles, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
