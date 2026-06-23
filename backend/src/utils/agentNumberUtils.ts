import { normalizePhone } from "./phoneUtils";

/** Normalize Knowlarity agent/caller numbers for storage and lookup. */
export function normalizeAgentNumber(phone: string): { primary: string; digits: string } {
  const trimmed = phone.trim();
  const e164 = normalizePhone(trimmed);
  const digits = trimmed.replace(/\D/g, "");
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
  return {
    primary: e164 ?? (last10 || trimmed),
    digits: last10 || digits,
  };
}
