const INVISIBLE_EMAIL_CHARS = /[\u200B-\u200D\uFEFF\u2060\u00AD]/g;

/** Strip invisible Unicode (word joiner, zero-width space, BOM) and normalize casing. */
export function sanitizeEmailInput(email: string): string {
  return email.replace(INVISIBLE_EMAIL_CHARS, "").trim().toLowerCase();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(sanitizeEmailInput(email));
}
