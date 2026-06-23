import { API_BASE_URL, withAuthHeaders } from "./api";

export interface KnowlarityAgentMapping {
  _id: string;
  agentNumber: string;
  agentNumberDigits: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    status?: string;
  };
  isActive: boolean;
  label?: string;
}

export interface CallCenterUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export async function listKnowlarityAgentMappings(): Promise<KnowlarityAgentMapping[]> {
  const res = await fetch(`${API_BASE_URL}/admin/knowlarity/agent-mappings`, {
    headers: withAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load Knowlarity agent mappings");
  return res.json();
}

export async function listCallCenterUsers(): Promise<CallCenterUser[]> {
  const res = await fetch(`${API_BASE_URL}/admin/knowlarity/agent-mappings/call-center-users`, {
    headers: withAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load call center users");
  return res.json();
}

export async function createKnowlarityAgentMapping(body: {
  agentNumber: string;
  userId: string;
  label?: string;
  isActive?: boolean;
}): Promise<KnowlarityAgentMapping> {
  const res = await fetch(`${API_BASE_URL}/admin/knowlarity/agent-mappings`, {
    method: "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to create mapping");
  }
  return res.json();
}

export async function updateKnowlarityAgentMapping(
  id: string,
  body: Partial<{ agentNumber: string; userId: string; label: string; isActive: boolean }>
): Promise<KnowlarityAgentMapping> {
  const res = await fetch(`${API_BASE_URL}/admin/knowlarity/agent-mappings/${id}`, {
    method: "PUT",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to update mapping");
  }
  return res.json();
}

export async function deleteKnowlarityAgentMapping(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/knowlarity/agent-mappings/${id}`, {
    method: "DELETE",
    headers: withAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete mapping");
}
