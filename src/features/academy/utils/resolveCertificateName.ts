export function resolveCertificateName(certificateName: string | null | undefined, displayName: string): string {
  return certificateName?.trim() || displayName.trim() || "Artisan";
}
