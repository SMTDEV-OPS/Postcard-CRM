import { useState, useEffect, useCallback } from "react";
import {
  Phone,
  Search,
  Loader2,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/patterns";
import { useToast } from "@/hooks/use-toast";
import { searchGuestByPhone, type GuestSearchResult } from "@/services/calls";
import { createLead, type CreateLeadPayload } from "@/services/leads";
import { API_BASE_URL, withAuthHeaders } from "@/services/api";
import { getPmsCustomerDisplayFields } from "@/config/pmsCustomerFieldMap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CallCenterScreenProps {
  agentName: string;
  incomingPhoneNumber?: string;
  incomingCallActive?: boolean;
  onLeadCreated?: (leadId: string) => void;
}

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildLeadPrefill(
  phone: string,
  result: GuestSearchResult | null
): Partial<CreateLeadPayload & { callStatus?: string }> {
  const pms = result?.pmsCustomer;
  const guest = result?.guest;

  const customData: Record<string, unknown> = {};
  if (pms?.customerId) customData.pms_customer_id = pms.customerId;
  if (pms?.loyaltyTier) customData.pms_loyalty_tier = pms.loyaltyTier;
  if (pms?.preferredProperty) customData.pms_preferred_property = pms.preferredProperty;
  if (pms?.lastStay) customData.pms_last_stay = pms.lastStay;
  if (pms?.totalStays !== undefined) customData.pms_total_stays = pms.totalStays;

  return {
    guestId: guest?._id,
    guestContact: {
      name: guest?.name || pms?.name || "",
      phone: guest?.phone || pms?.phone || phone,
      email: guest?.email || pms?.email || "",
    },
    source: "DIRECT_CALL",
    leadType: "STAY",
    heatLevel: "WARM",
    hotels: [
      {
        checkInDate: "",
        checkOutDate: "",
        numberOfGuests: "2 Adults",
        roomCategory: "",
      },
    ],
    occasion: "",
    customData,
  };
}

export function CallCenterScreen({
  agentName,
  incomingPhoneNumber,
  incomingCallActive = false,
  onLeadCreated,
}: CallCenterScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState(incomingPhoneNumber || "");
  const [searchResult, setSearchResult] = useState<GuestSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showRawPms, setShowRawPms] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<Array<Record<string, unknown>>>([]);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [leadFormData, setLeadFormData] = useState<
    Partial<CreateLeadPayload & { callStatus?: string }>
  >(buildLeadPrefill("", null));

  const { toast } = useToast();

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/fields?entity_type=lead&is_active=true`, {
      headers: withAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const sorted = (data || []).sort(
          (a: { display_order?: number }, b: { display_order?: number }) =>
            (a.display_order || 0) - (b.display_order || 0)
        );
        setDynamicFields(sorted);
      })
      .catch(console.error);
  }, []);

  const handleSearch = useCallback(
    async (phone: string) => {
      const trimmed = phone.trim();
      const digits = trimmed.replace(/\D/g, "");
      if (digits.length < 10) {
        toast({
          title: "Invalid phone",
          description: "Enter a valid phone number (10+ digits)",
          variant: "destructive",
        });
        return;
      }

      setIsSearching(true);
      setHasSearched(true);
      setSearchResult(null);

      try {
        const result = await searchGuestByPhone(trimmed);
        setSearchResult(result);
        setLeadFormData(buildLeadPrefill(trimmed, result));
      } catch (error) {
        toast({
          title: "Search failed",
          description: error instanceof Error ? error.message : "Failed to search guest",
          variant: "destructive",
        });
        setLeadFormData(buildLeadPrefill(trimmed, null));
      } finally {
        setIsSearching(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (incomingPhoneNumber && incomingPhoneNumber !== phoneNumber) {
      setPhoneNumber(incomingPhoneNumber);
      void handleSearch(incomingPhoneNumber);
    }
  }, [incomingPhoneNumber, phoneNumber, handleSearch]);

  const handleCreateLead = async () => {
    if (!leadFormData.guestContact?.name?.trim()) {
      toast({
        title: "Validation error",
        description: "Guest name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingLead(true);
    try {
      const payload: CreateLeadPayload = {
        guestContact: {
          name: leadFormData.guestContact.name,
          phone: leadFormData.guestContact.phone || phoneNumber,
          email: leadFormData.guestContact.email,
        },
        source: leadFormData.source || "DIRECT_CALL",
        leadType: leadFormData.leadType || "STAY",
        heatLevel: leadFormData.heatLevel || "WARM",
        hotels: leadFormData.hotels?.filter((h) => h.checkInDate || h.checkOutDate) || [],
        occasion: leadFormData.occasion,
        customData: leadFormData.customData || {},
        assignmentMode: "auto",
      };

      const lead = await createLead(payload);

      if (leadFormData.callStatus) {
        try {
          await fetch(`${API_BASE_URL}/leads/${lead.id}/call-status`, {
            method: "PATCH",
            headers: withAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ callStatus: leadFormData.callStatus }),
          });
        } catch {
          // non-fatal
        }
      }

      toast({
        title: "Lead created",
        description: `Lead ${lead.leadNumber} created successfully`,
      });

      onLeadCreated?.(lead.id);
      setSearchResult(null);
      setHasSearched(false);
      setPhoneNumber("");
      setLeadFormData(buildLeadPrefill("", null));
    } catch (error) {
      toast({
        title: "Failed to create lead",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsCreatingLead(false);
    }
  };

  const pmsFields = searchResult?.pmsCustomer
    ? getPmsCustomerDisplayFields(searchResult.pmsCustomer)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call center"
        subtitle="PMS guest lookup, CRM history, and lead capture in one screen"
      />

      {incomingCallActive && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <Phone className="h-4 w-4 text-red-600 animate-pulse" />
          <div>
            <p className="text-sm font-medium text-red-800">Incoming call</p>
            <p className="text-sm text-red-700">{phoneNumber || "Unknown caller"}</p>
          </div>
        </div>
      )}

      <div className="flex max-w-xl gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone number"
            className="h-10 border-border bg-surface pl-9"
            onKeyDown={(e) => e.key === "Enter" && void handleSearch(phoneNumber)}
          />
        </div>
        <Button
          variant="primary"
          onClick={() => void handleSearch(phoneNumber)}
          loading={isSearching}
        >
          Look up
        </Button>
      </div>

      {!hasSearched ? (
        <EmptyState
          icon={Phone}
          title="Enter a phone number"
          description="PMS customer profile, CRM history, and a pre-filled lead form will appear here."
        />
      ) : isSearching ? (
        <div className="flex items-center gap-2 py-12 text-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading guest…
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* PMS Customer Panel */}
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-text">PMS customer</h3>
                {searchResult?.pmsCustomer ? (
                  <Badge variant="outline">{searchResult.pmsCustomer.customerId}</Badge>
                ) : (
                  <Badge variant="outline">Not found</Badge>
                )}
              </div>

              {searchResult?.pmsCustomer ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {pmsFields.map((field) => (
                      <div key={field.label}>
                        <p className="text-xs text-text-muted">{field.label}</p>
                        <p className="font-medium">{field.value}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-text"
                    onClick={() => setShowRawPms((v) => !v)}
                  >
                    {showRawPms ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                    Raw PMS response
                  </button>
                  {showRawPms && (
                    <Textarea
                      readOnly
                      className="font-mono text-xs"
                      rows={6}
                      value={JSON.stringify(searchResult.pmsCustomer.raw, null, 2)}
                    />
                  )}
                </div>
              ) : (
                <p className="text-sm text-text-muted">
                  No matching customer in Postcard PMS for this number.
                </p>
              )}
            </div>

            {/* CRM Guest History */}
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-text">CRM history</h3>
                {searchResult?.guest && (
                  <Badge variant="outline">
                    {searchResult.source === "both"
                      ? "Local + PMS"
                      : searchResult.source === "external"
                        ? "PMS only"
                        : "Local"}
                  </Badge>
                )}
              </div>

              {searchResult?.guest ? (
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 text-text-muted" />
                    <div>
                      <p className="font-medium">{searchResult.guest.name}</p>
                      <p className="text-text-muted">
                        {searchResult.guest.phone || "—"} · {searchResult.guest.email || "—"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {searchResult.guest.totalLeadsCount ?? 0} leads ·{" "}
                        {searchResult.guest.totalReservationsCount ?? 0} reservations
                      </p>
                    </div>
                  </div>

                  {searchResult.previousLeads && searchResult.previousLeads.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-text-muted">Previous leads</p>
                      <div className="max-h-32 space-y-2 overflow-y-auto">
                        {searchResult.previousLeads.map((lead) => (
                          <div
                            key={String(lead._id)}
                            className="rounded border border-border px-2 py-1.5"
                          >
                            <p className="font-medium">Lead #{String(lead.leadNumber)}</p>
                            <p className="text-xs text-text-muted">
                              {String(lead.status)} · {String(lead.heatLevel)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResult.communicationHistory &&
                    searchResult.communicationHistory.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-medium text-text-muted">
                          Communications
                        </p>
                        <div className="max-h-32 space-y-2 overflow-y-auto">
                          {searchResult.communicationHistory.map((comm) => (
                            <div
                              key={String(comm._id)}
                              className="rounded border border-border px-2 py-1.5"
                            >
                              <div className="flex justify-between text-xs">
                                <span>{String(comm.channel)}</span>
                                <span className="text-text-muted">
                                  {formatDate(String(comm.createdAt))}
                                </span>
                              </div>
                              {comm.summary ? (
                                <p className="mt-1 text-xs text-text-muted">
                                  {String(comm.summary)}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <p className="text-sm text-text-muted">
                  No local CRM guest record. Lead form is pre-filled from PMS when available.
                </p>
              )}
            </div>
          </div>

          {/* Lead Form */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <h3 className="text-sm font-medium text-text">Create lead</h3>
              <span className="text-xs text-text-muted">Agent: {agentName}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guestName">Guest name *</Label>
                <Input
                  id="guestName"
                  value={leadFormData.guestContact?.name || ""}
                  onChange={(e) =>
                    setLeadFormData({
                      ...leadFormData,
                      guestContact: {
                        ...leadFormData.guestContact,
                        name: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="guestPhone">Phone</Label>
                <Input
                  id="guestPhone"
                  value={leadFormData.guestContact?.phone || phoneNumber}
                  onChange={(e) =>
                    setLeadFormData({
                      ...leadFormData,
                      guestContact: {
                        ...leadFormData.guestContact,
                        phone: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="guestEmail">Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={leadFormData.guestContact?.email || ""}
                  onChange={(e) =>
                    setLeadFormData({
                      ...leadFormData,
                      guestContact: {
                        ...leadFormData.guestContact,
                        email: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Heat level</Label>
                <Select
                  value={leadFormData.heatLevel || "WARM"}
                  onValueChange={(value) =>
                    setLeadFormData({ ...leadFormData, heatLevel: value as "COLD" | "WARM" | "HOT" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOT">Hot</SelectItem>
                    <SelectItem value="WARM">Warm</SelectItem>
                    <SelectItem value="COLD">Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Call status</Label>
                <Select
                  value={leadFormData.callStatus || ""}
                  onValueChange={(value) =>
                    setLeadFormData({ ...leadFormData, callStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUOTATION_SHARED">Quotation shared</SelectItem>
                    <SelectItem value="PAYMENT_PENDING">Payment pending</SelectItem>
                    <SelectItem value="NOT_INTERESTED">Not interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="checkInDate">Check-in</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={leadFormData.hotels?.[0]?.checkInDate || ""}
                  onChange={(e) => {
                    const newHotels = [...(leadFormData.hotels || [])];
                    if (!newHotels[0]) newHotels[0] = {};
                    newHotels[0].checkInDate = e.target.value;
                    setLeadFormData({ ...leadFormData, hotels: newHotels });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="checkOutDate">Check-out</Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  min={leadFormData.hotels?.[0]?.checkInDate || undefined}
                  value={leadFormData.hotels?.[0]?.checkOutDate || ""}
                  onChange={(e) => {
                    const newHotels = [...(leadFormData.hotels || [])];
                    if (!newHotels[0]) newHotels[0] = {};
                    newHotels[0].checkOutDate = e.target.value;
                    setLeadFormData({ ...leadFormData, hotels: newHotels });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="occasion">Occasion</Label>
                <Input
                  id="occasion"
                  value={leadFormData.occasion || ""}
                  onChange={(e) =>
                    setLeadFormData({ ...leadFormData, occasion: e.target.value })
                  }
                />
              </div>

              {dynamicFields.length > 0 && (
                <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-border pt-4">
                  {dynamicFields.map((field) => {
                    const slug = String(field.slug);
                    return (
                      <div key={slug}>
                        <Label>
                          {String(field.name)}
                          {field.is_required ? " *" : ""}
                        </Label>
                        <Input
                          value={String(leadFormData.customData?.[slug] ?? "")}
                          onChange={(e) =>
                            setLeadFormData({
                              ...leadFormData,
                              customData: {
                                ...(leadFormData.customData || {}),
                                [slug]: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="primary"
                onClick={() => void handleCreateLead()}
                loading={isCreatingLead}
                disabled={!leadFormData.guestContact?.name?.trim()}
              >
                Create lead
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
