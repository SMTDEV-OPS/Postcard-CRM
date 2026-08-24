import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL, withAuthHeaders } from "@/services/api";
import { listUsers, type User } from "@/services/users";
import {
  exportReportCsv,
  exportReportExcel,
  type ExportColumn,
} from "@/lib/reportExport";

type LeadRow = {
  leadId: string;
  accountId?: string;
  executiveName: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  bookerName: string;
  city: string;
  country: string;
  mobile: string;
  email: string;
  company: string;
  companyType: string;
  roomNights: number;
  adr: number;
  revenue: number;
  status: string;
};

type ContactRow = {
  contactId: string;
  contactType: string;
  salutation: string;
  firstName: string;
  lastName: string;
  companyName: string;
  jobTitle: string;
  address: string;
  city: string;
  mobile: string;
  email: string;
  website: string;
  notes: string;
  dataUploadedOn: string;
  executiveName: string;
  zone: string;
};

type AccountRow = {
  accountId: string;
  name: string;
  type: string;
  city: string;
  zone: string;
  role: "PAM" | "SAM";
};

type Preview = {
  leads: LeadRow[];
  contacts: ContactRow[];
  accounts: AccountRow[];
};

const LEAD_COLS: ExportColumn[] = [
  { key: "executiveName", label: "Executive Name" },
  { key: "hotelName", label: "Hotel Name" },
  { key: "checkIn", label: "Check In" },
  { key: "checkOut", label: "Check Out" },
  { key: "bookerName", label: "Booker Name" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "mobile", label: "Mobile" },
  { key: "email", label: "Email" },
  { key: "company", label: "Company" },
  { key: "companyType", label: "Company Type" },
  { key: "roomNights", label: "Room Nights" },
  { key: "adr", label: "ADR" },
  { key: "revenue", label: "Revenue" },
  { key: "status", label: "Status" },
];

const CONTACT_COLS: ExportColumn[] = [
  { key: "contactType", label: "Contact Type" },
  { key: "salutation", label: "Salutation" },
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "companyName", label: "Company Name" },
  { key: "jobTitle", label: "Job Title" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "mobile", label: "Mobile" },
  { key: "email", label: "Email" },
  { key: "website", label: "Website" },
  { key: "notes", label: "Notes" },
  { key: "dataUploadedOn", label: "Data uploaded on" },
  { key: "executiveName", label: "Executive Name" },
  { key: "zone", label: "Zone" },
];

export default function HandoverPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [fromUserId, setFromUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());

  useEffect(() => {
    void listUsers()
      .then(setUsers)
      .catch((err) =>
        toast({
          title: "Could not load users",
          description: err instanceof Error ? err.message : "Error",
          variant: "destructive",
        })
      );
  }, [toast]);

  const loadPreview = useCallback(async () => {
    if (!fromUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/handover/${fromUserId}/preview`, {
        headers: withAuthHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to load handover preview");
      }
      const data = (await res.json()) as Preview;
      setPreview(data);
      setSelectedLeads(new Set(data.leads.map((l) => l.leadId)));
      setSelectedContacts(new Set(data.contacts.map((c) => c.contactId)));
      setSelectedAccounts(new Set(data.accounts.map((a) => a.accountId)));
    } catch (err) {
      setPreview(null);
      toast({
        title: "Preview failed",
        description: err instanceof Error ? err.message : "Error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fromUserId, toast]);

  useEffect(() => {
    if (fromUserId) void loadPreview();
    else {
      setPreview(null);
      setSelectedLeads(new Set());
      setSelectedContacts(new Set());
      setSelectedAccounts(new Set());
    }
  }, [fromUserId, loadPreview]);

  const toggleAll = (
    ids: string[],
    selected: Set<string>,
    setter: (s: Set<string>) => void
  ) => {
    if (ids.every((id) => selected.has(id))) setter(new Set());
    else setter(new Set(ids));
  };

  const toggleOne = (
    id: string,
    selected: Set<string>,
    setter: (s: Set<string>) => void
  ) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const toUsers = useMemo(
    () => users.filter((u) => u.id !== fromUserId),
    [users, fromUserId]
  );

  const confirmHandover = async () => {
    if (!fromUserId || !toUserId) {
      toast({ title: "Select From and To users", variant: "destructive" });
      return;
    }
    if (
      selectedLeads.size === 0 &&
      selectedContacts.size === 0 &&
      selectedAccounts.size === 0
    ) {
      toast({ title: "Select at least one row", variant: "destructive" });
      return;
    }
    if (
      !window.confirm(
        `Reassign ${selectedLeads.size} lead(s), ${selectedAccounts.size} account(s), and ${selectedContacts.size} contact(s) to the selected user?`
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/handover`, {
        method: "POST",
        headers: withAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          fromUserId,
          toUserId,
          leadIds: [...selectedLeads],
          accountIds: [...selectedAccounts],
          contactIds: [...selectedContacts],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Handover failed");
      toast({
        title: "Handover complete",
        description: `Leads ${data.leadsUpdated ?? 0}, accounts ${data.accountsUpdated ?? 0}, contacts ${data.contactsUpdated ?? 0}.`,
      });
      await loadPreview();
    } catch (err) {
      toast({
        title: "Handover failed",
        description: err instanceof Error ? err.message : "Error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const exportSelected = (kind: "csv" | "xlsx") => {
    if (!preview) return;
    const leads = preview.leads.filter((l) => selectedLeads.has(l.leadId));
    const contacts = preview.contacts.filter((c) =>
      selectedContacts.has(c.contactId)
    );
    if (kind === "csv") {
      if (leads.length) exportReportCsv("Handover Leads", LEAD_COLS, leads, []);
      if (contacts.length)
        exportReportCsv("Handover Contacts", CONTACT_COLS, contacts, []);
    } else {
      if (leads.length) exportReportExcel("Handover Leads", LEAD_COLS, leads, []);
      if (contacts.length)
        exportReportExcel("Handover Contacts", CONTACT_COLS, contacts, []);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Handover"
        subtitle="Reassign leads, accounts (PAM/SAM), and contacts from one user to another."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadPreview()}
              disabled={!fromUserId || loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!preview}
              onClick={() => exportSelected("csv")}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!preview}
              onClick={() => exportSelected("xlsx")}
            >
              Export Excel
            </Button>
            <Button
              size="sm"
              onClick={() => void confirmHandover()}
              disabled={submitting || !fromUserId || !toUserId}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRightLeft className="mr-2 h-4 w-4" />
              )}
              Confirm handover
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
          <div>
            <Label>From user</Label>
            <Select value={fromUserId} onValueChange={setFromUserId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select source user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>To user</Label>
            <Select value={toUserId} onValueChange={setToUserId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select target user" />
              </SelectTrigger>
              <SelectContent>
                {toUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading preview…
        </div>
      )}

      {preview && !loading && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">
                Bookings / leads ({preview.leads.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toggleAll(
                    preview.leads.map((l) => l.leadId),
                    selectedLeads,
                    setSelectedLeads
                  )
                }
              >
                Select all
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-2 w-10" />
                    {LEAD_COLS.map((c) => (
                      <th key={c.key} className="p-2 font-medium">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.leads.map((row) => (
                    <tr key={row.leadId} className="border-b border-border/60">
                      <td className="p-2">
                        <Checkbox
                          checked={selectedLeads.has(row.leadId)}
                          onCheckedChange={() =>
                            toggleOne(row.leadId, selectedLeads, setSelectedLeads)
                          }
                        />
                      </td>
                      {LEAD_COLS.map((c) => (
                        <td key={c.key} className="p-2 whitespace-nowrap">
                          {String((row as Record<string, unknown>)[c.key] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {preview.leads.length === 0 && (
                    <tr>
                      <td colSpan={LEAD_COLS.length + 1} className="p-4 text-muted-foreground">
                        No leads assigned to this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">
                Accounts PAM/SAM ({preview.accounts.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toggleAll(
                    preview.accounts.map((a) => a.accountId),
                    selectedAccounts,
                    setSelectedAccounts
                  )
                }
              >
                Select all
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-2 w-10" />
                    <th className="p-2">Name</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">City</th>
                    <th className="p-2">Zone</th>
                    <th className="p-2">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.accounts.map((row) => (
                    <tr key={row.accountId} className="border-b border-border/60">
                      <td className="p-2">
                        <Checkbox
                          checked={selectedAccounts.has(row.accountId)}
                          onCheckedChange={() =>
                            toggleOne(
                              row.accountId,
                              selectedAccounts,
                              setSelectedAccounts
                            )
                          }
                        />
                      </td>
                      <td className="p-2">{row.name}</td>
                      <td className="p-2">{row.type}</td>
                      <td className="p-2">{row.city}</td>
                      <td className="p-2">{row.zone}</td>
                      <td className="p-2">{row.role}</td>
                    </tr>
                  ))}
                  {preview.accounts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-muted-foreground">
                        No PAM/SAM accounts for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">
                Contacts ({preview.contacts.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toggleAll(
                    preview.contacts.map((c) => c.contactId),
                    selectedContacts,
                    setSelectedContacts
                  )
                }
              >
                Select all
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-2 w-10" />
                    {CONTACT_COLS.map((c) => (
                      <th key={c.key} className="p-2 font-medium">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.contacts.map((row) => (
                    <tr key={row.contactId} className="border-b border-border/60">
                      <td className="p-2">
                        <Checkbox
                          checked={selectedContacts.has(row.contactId)}
                          onCheckedChange={() =>
                            toggleOne(
                              row.contactId,
                              selectedContacts,
                              setSelectedContacts
                            )
                          }
                        />
                      </td>
                      {CONTACT_COLS.map((c) => (
                        <td key={c.key} className="p-2 whitespace-nowrap">
                          {String((row as Record<string, unknown>)[c.key] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {preview.contacts.length === 0 && (
                    <tr>
                      <td
                        colSpan={CONTACT_COLS.length + 1}
                        className="p-4 text-muted-foreground"
                      >
                        No contacts created by this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
