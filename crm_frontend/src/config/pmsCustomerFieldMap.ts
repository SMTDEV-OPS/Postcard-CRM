import type { PmsCustomerSummary } from "@/services/calls";

export interface PmsFieldDisplay {
  label: string;
  value: string;
}

const FIELD_LABELS: Record<string, string> = {
  customerId: "Customer ID",
  name: "Name",
  phone: "Phone",
  email: "Email",
  loyaltyTier: "Loyalty tier",
  lastStay: "Last stay",
  totalStays: "Total stays",
  preferredProperty: "Preferred property",
};

/**
 * Map PMS customer summary to labeled display rows for the call center panel.
 */
export function getPmsCustomerDisplayFields(
  customer: PmsCustomerSummary
): PmsFieldDisplay[] {
  const rows: PmsFieldDisplay[] = [];

  const entries: Array<[keyof PmsCustomerSummary, string | number | undefined]> = [
    ["customerId", customer.customerId],
    ["name", customer.name],
    ["phone", customer.phone],
    ["email", customer.email],
    ["loyaltyTier", customer.loyaltyTier],
    ["lastStay", customer.lastStay],
    ["totalStays", customer.totalStays],
    ["preferredProperty", customer.preferredProperty],
  ];

  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === "") continue;
    rows.push({
      label: FIELD_LABELS[key] ?? key,
      value: String(value),
    });
  }

  return rows;
}
