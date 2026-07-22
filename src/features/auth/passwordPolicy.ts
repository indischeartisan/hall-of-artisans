export const MIN_PASSWORD_LENGTH = 8;

export const passwordRequirement = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;

export function validatePassword(password: string): string | null {
  return password.length >= MIN_PASSWORD_LENGTH ? null : passwordRequirement;
}
