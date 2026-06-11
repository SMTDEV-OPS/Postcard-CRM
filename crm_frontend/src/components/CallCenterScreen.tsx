import { useState, useCallback, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/patterns";
import { useToast } from "@/hooks/use-toast";
import { searchGuestByPhone, type GuestSearchResult, type PmsLookupStatus } from "@/services/calls";
import { API_BASE_URL, withAuthHeaders } from "@/services/api";
import { getPmsCustomerDisplayFields } from "@/config/pmsCustomerFieldMap";
import { useLeadForm } from "@/components/leads/useLeadForm";
import { LeadCreationWizardForm } from "@/components/leads/LeadCreationWizardForm";
import { mapGuestSearchToLeadPrefill } from "@/utils/callCenterLeadPrefill";

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

function pmsStatusMessage(status?: PmsLookupStatus): string {
  switch (status) {
    case "not_configured":
      return "PMS lookup is not configured on the server. Set PMS_CRM_BASE_URL, PMS_CRM_API_KEY, and PMS_CRM_SECRET_KEY on Render, then redeploy.";
    case "error":
      return "PMS lookup failed. Check backend logs and API credentials.";
    case "not_found":
      return "No matching customer in Postcard PMS for this number.";
    case "found":
      return "";
    default:
      return "No matching customer in Postcard PMS for this number.";
  }
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
  const [callStatus, setCallStatus] = useState("");
  const [prefillKey, setPrefillKey] = useState(0);

  const { toast } = useToast();

  const {
    form,
    hotelFields,
    hotelOptions,
    customFields,
    customData,
    setCustomData,
    isSubmitting,
    addNewHotel,
    removeHotel,
    addRoom,
    removeRoom,
    refreshCustomFields,
    applyPrefill,
    resetForm,
    submitLead,
  } = useLeadForm({
    onCreated: (lead) => {
      onLeadCreated?.(lead.id);
    },
  });

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
        await refreshCustomFields();
        const result = await searchGuestByPhone(trimmed);
        setSearchResult(result);

        const { form: prefill, customData: prefillCustom } = mapGuestSearchToLeadPrefill(
          result,
          trimmed,
          hotelOptions
        );
        applyPrefill(prefill, prefillCustom);
        setPrefillKey((k) => k + 1);
      } catch (error) {
        toast({
          title: "Search failed",
          description: error instanceof Error ? error.message : "Failed to search guest",
          variant: "destructive",
        });
        const fallback = mapGuestSearchToLeadPrefill(null, trimmed, hotelOptions);
        applyPrefill(fallback.form, fallback.customData);
        setPrefillKey((k) => k + 1);
      } finally {
        setIsSearching(false);
      }
    },
    [toast, refreshCustomFields, applyPrefill, hotelOptions]
  );

  useEffect(() => {
    if (incomingPhoneNumber && incomingPhoneNumber !== phoneNumber) {
      setPhoneNumber(incomingPhoneNumber);
      void handleSearch(incomingPhoneNumber);
    }
  }, [incomingPhoneNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLeadSubmit = async (data: Parameters<typeof submitLead>[0]) => {
    try {
      const lead = await submitLead(data);

      if (callStatus && lead?.id) {
        try {
          await fetch(`${API_BASE_URL}/leads/${lead.id}/call-status`, {
            method: "PATCH",
            headers: withAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ callStatus }),
          });
        } catch {
          // non-fatal
        }
      }

      toast({
        title: "Lead created",
        description: `Lead ${lead.leadNumber} created successfully`,
      });

      setSearchResult(null);
      setHasSearched(false);
      setPhoneNumber("");
      setCallStatus("");
      resetForm();
      setPrefillKey((k) => k + 1);
    } catch (error) {
      toast({
        title: "Failed to create lead",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const pmsFields = searchResult?.pmsCustomer
    ? getPmsCustomerDisplayFields(searchResult.pmsCustomer)
    : [];
  const pmsStatus = searchResult?.pmsLookupStatus;
  const pmsMessage = pmsStatusMessage(pmsStatus);

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
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-text">PMS customer</h3>
                {searchResult?.pmsCustomer ? (
                  <Badge variant="outline">{searchResult.pmsCustomer.customerId}</Badge>
                ) : (
                  <Badge variant="outline">
                    {pmsStatus === "not_configured" ? "Not configured" : "Not found"}
                  </Badge>
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
                <p className="text-sm text-text-muted">{pmsMessage}</p>
              )}
            </div>

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
                        <p className="mb-2 text-xs font-medium text-text-muted">Communications</p>
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

          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="text-xs text-text-muted">Agent: {agentName}</span>
            </div>

            <LeadCreationWizardForm
              variant="inline"
              title="Create lead"
              form={form}
              hotelFields={hotelFields}
              onAddHotel={addNewHotel}
              onRemoveHotel={removeHotel}
              onAddRoom={addRoom}
              onRemoveRoom={removeRoom}
              hotelOptions={hotelOptions}
              customFields={customFields as Array<Record<string, unknown>>}
              customData={customData}
              setCustomData={setCustomData}
              onSubmit={handleLeadSubmit}
              isSubmitting={isSubmitting}
              showCallStatus
              callStatus={callStatus}
              onCallStatusChange={setCallStatus}
              resetKey={prefillKey}
            />
          </div>
        </div>
      )}
    </div>
  );
}
