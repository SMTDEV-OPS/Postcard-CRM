import type { ClientStatus, Contact } from "@/services/contacts";

export const emptyContactForm: Partial<Contact> = {
  name: "",
  title: "Mr.",
  designation: "",
  isKeyPersonnel: false,
  keyPersonnelRole: undefined,
  email: "",
  mobileNumber1: "",
  mobileNumber2: "",
  boardNumber: "",
  officeNumber: "",
  clientStatus: "NEUTRAL",
  isLoyaltyMember: false,
  loyaltyProgramName: "",
  loyaltyNumber: "",
  dateOfBirth: "",
  weddingAnniversary: "",
};

export const CLIENT_STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: "PROMOTER", label: "Promoter (High Support)" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "DETRACTOR", label: "Detractor (Risk)" },
];

export function cleanContactPayload(data: Partial<Contact>): Partial<Contact> {
  const cleaned = { ...data };
  if (!cleaned.email) delete cleaned.email;
  if (!cleaned.mobileNumber1) delete cleaned.mobileNumber1;
  if (!cleaned.mobileNumber2) delete cleaned.mobileNumber2;
  if (!cleaned.boardNumber) delete cleaned.boardNumber;
  if (!cleaned.officeNumber) delete cleaned.officeNumber;
  if (!cleaned.dateOfBirth) delete cleaned.dateOfBirth;
  if (!cleaned.weddingAnniversary) delete cleaned.weddingAnniversary;
  if (!cleaned.loyaltyProgramName) delete cleaned.loyaltyProgramName;
  if (!cleaned.loyaltyNumber) delete cleaned.loyaltyNumber;
  if (!cleaned.designation) delete cleaned.designation;
  if (!cleaned.isKeyPersonnel) delete cleaned.keyPersonnelRole;
  if (cleaned.keyPersonnelRole) {
    cleaned.keyPersonnelRole = String(cleaned.keyPersonnelRole).trim();
    if (!cleaned.keyPersonnelRole) delete cleaned.keyPersonnelRole;
  }
  return cleaned;
}
