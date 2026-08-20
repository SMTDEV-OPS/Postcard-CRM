import { useEffect, useRef, useState } from "react";
import { UseFormReturn, FieldArrayWithId } from "react-hook-form";
import { format } from "date-fns";
import {
  Plus,
  Hotel,
  BedDouble,
  Trash2,
  User as UserIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Property } from "@/services/properties";
import { AddLeadStepIndicator, ADD_LEAD_STEP_SUBTITLES } from "./AddLeadStepIndicator";
import {
  BOOKING_SOURCE_OPTIONS,
  GUEST_SEGMENT_OPTIONS,
  LEAD_CHANNEL_OPTIONS,
} from "@/constants/leadDropdownOptions";
import { HotelStayDateFields } from "./HotelStayDateFields";
import { FormFieldLabelHelp, FormLabelHelp } from "@/components/help/FormLabelHelp";
import type { LeadFormData } from "./useLeadForm";
import { cn } from "@/lib/utils";
import { formGrid2 } from "@/lib/responsive";

export const LEAD_WIZARD_STEP_FIELDS: Record<number, string[]> = {
  1: ["firstName", "lastName", "guestContactNumber"],
  2: ["hotels"],
  3: ["bookingSource", "heatLevel"],
};

export interface LeadCreationWizardFormProps {
  variant?: "dialog" | "inline";
  form: UseFormReturn<LeadFormData>;
  hotelFields: FieldArrayWithId<LeadFormData, "hotels", "id">[];
  onAddHotel: () => void;
  onRemoveHotel: (index: number) => void;
  onAddRoom: (hotelIndex: number) => void;
  onRemoveRoom: (hotelIndex: number, roomIndex: number) => void;
  hotelOptions: Property[];
  customFields: Array<Record<string, unknown>>;
  customData: Record<string, unknown>;
  setCustomData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  onSubmit: (data: LeadFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel?: () => void;
  showCallStatus?: boolean;
  callStatus?: string;
  onCallStatusChange?: (value: string) => void;
  resetKey?: number;
  title?: string;
}

function CustomFieldsSection({
  customFields,
  customData,
  setCustomData,
}: {
  customFields: Array<Record<string, unknown>>;
  customData: Record<string, unknown>;
  setCustomData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}) {
  if (customFields.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
      <h4 className="text-sm font-semibold text-text">Additional information</h4>
      <div className={cn(formGrid2, "gap-4")}>
        {customFields.map((field) => {
          const slug = String(field.slug || field.fieldName);
          const isRequired = field.is_required || field.isRequired;
          const fieldName = String(field.name);
          const label = (
            <Label htmlFor={`custom_${slug}`}>
              {fieldName} {isRequired ? "*" : ""}
            </Label>
          );
          const options = (field.options as string[] | undefined) ?? [];

          if (field.type === "dropdown") {
            return (
              <div key={slug} className="space-y-2">
                {label}
                <Select
                  value={customData[slug]?.toString() || ""}
                  onValueChange={(value) =>
                    setCustomData((prev) => ({ ...prev, [slug]: value }))
                  }
                >
                  <SelectTrigger id={`custom_${slug}`}>
                    <SelectValue placeholder={`Select ${fieldName}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }

          if (field.type === "number") {
            return (
              <div key={slug} className="space-y-2">
                {label}
                <Input
                  id={`custom_${slug}`}
                  type="number"
                  placeholder={fieldName}
                  value={String(customData[slug] ?? "")}
                  onChange={(e) =>
                    setCustomData((prev) => ({
                      ...prev,
                      [slug]: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            );
          }

          if (field.type === "boolean") {
            return (
              <div key={slug} className="space-y-2">
                {label}
                <Select
                  value={customData[slug] !== undefined ? String(customData[slug]) : ""}
                  onValueChange={(value) =>
                    setCustomData((prev) => ({ ...prev, [slug]: value === "true" }))
                  }
                >
                  <SelectTrigger id={`custom_${slug}`}>
                    <SelectValue placeholder={`Select ${fieldName}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          }

          return (
            <div key={slug} className="space-y-2">
              {label}
              <Input
                id={`custom_${slug}`}
                placeholder={fieldName}
                value={String(customData[slug] ?? "")}
                onChange={(e) =>
                  setCustomData((prev) => ({ ...prev, [slug]: e.target.value }))
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewSummary({ form }: { form: UseFormReturn<LeadFormData> }) {
  const data = form.watch();
  const guestName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ");
  const primaryHotel = data.hotels?.[0];

  return (
    <div className="rounded-lg border border-border bg-hover/50 p-4 space-y-3 text-sm">
      <div className={cn(formGrid2, "gap-x-4 gap-y-2")}>
        <div>
          <span className="text-text-muted">Guest</span>
          <p className="font-medium text-text">{guestName || "—"}</p>
        </div>
        <div>
          <span className="text-text-muted">Contact</span>
          <p className="font-medium text-text">{data.guestContactNumber || "—"}</p>
        </div>
        <div>
          <span className="text-text-muted">Email</span>
          <p className="font-medium text-text">{data.guestEmail || "—"}</p>
        </div>
        <div>
          <span className="text-text-muted">VIP / VVIP</span>
          <p className="font-medium text-text">
            {data.vipStatus && data.vipStatus !== "NONE" ? data.vipStatus : "—"}
          </p>
        </div>
        <div>
          <span className="text-text-muted">Booking source</span>
          <p className="font-medium text-text">{data.bookingSource || "—"}</p>
        </div>
        {primaryHotel && (
          <>
            <div>
              <span className="text-text-muted">Hotel</span>
              <p className="font-medium text-text">{primaryHotel.hotelName || "—"}</p>
            </div>
            <div>
              <span className="text-text-muted">Stay dates</span>
              <p className="font-medium text-text">
                {primaryHotel.checkInDate ? format(primaryHotel.checkInDate, "PP") : "—"}
                {" → "}
                {primaryHotel.checkOutDate ? format(primaryHotel.checkOutDate, "PP") : "—"}
              </p>
            </div>
          </>
        )}
        <div>
          <span className="text-text-muted">Lead temperature</span>
          <p className="font-medium text-text">{data.heatLevel || "—"}</p>
        </div>
      </div>
    </div>
  );
}

export function LeadCreationWizardForm({
  variant = "dialog",
  form,
  hotelFields,
  onAddHotel,
  onRemoveHotel,
  onAddRoom,
  onRemoveRoom,
  hotelOptions,
  customFields,
  customData,
  setCustomData,
  onSubmit,
  isSubmitting,
  onCancel,
  showCallStatus,
  callStatus,
  onCallStatusChange,
  resetKey,
  title,
}: LeadCreationWizardFormProps) {
  const [step, setStep] = useState(1);
  const [channelOpen, setChannelOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStep(1);
  }, [resetKey]);

  const scrollToFirstError = () => {
    requestAnimationFrame(() => {
      const el = bodyRef.current?.querySelector('[role="alert"], .text-destructive');
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const handleContinue = async () => {
    const fields = LEAD_WIZARD_STEP_FIELDS[step];
    if (fields) {
      const valid = await form.trigger(fields as (keyof LeadFormData)[]);
      if (!valid) {
        scrollToFirstError();
        return;
      }
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const isInline = variant === "inline";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={isInline ? "space-y-4" : "flex flex-col flex-1 min-h-0"}
      >
        <div
          className={
            isInline
              ? "space-y-4"
              : "flex-1 overflow-y-auto px-6 py-4 space-y-4"
          }
        >
          <div className="space-y-3">
            {isInline && title && (
              <h3 className="text-sm font-medium text-text">{title}</h3>
            )}
            <AddLeadStepIndicator currentStep={step} />
            <p className="text-xs text-text-muted">{ADD_LEAD_STEP_SUBTITLES[step]}</p>
          </div>

          <div ref={bodyRef} className="space-y-4">
            {step === 1 && (
              <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
                <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Guest details
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldLabelHelp helpId="leads.add.firstName" required>First name</FormFieldLabelHelp>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldLabelHelp helpId="leads.add.middleName">Middle name</FormFieldLabelHelp>
                        <FormControl>
                          <Input placeholder="Middle name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldLabelHelp helpId="leads.add.lastName" required>Last name</FormFieldLabelHelp>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className={cn(formGrid2, "gap-4")}>
                  <FormField
                    control={form.control}
                    name="guestContactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldLabelHelp helpId="leads.add.guestContactNumber" required>Contact number</FormFieldLabelHelp>
                        <FormControl>
                          <Input placeholder="+91 XXXXX XXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alternateContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldLabelHelp helpId="leads.add.alternateContact">Alternate contact</FormFieldLabelHelp>
                        <FormControl>
                          <Input placeholder="+91 XXXXX XXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className={cn(formGrid2, "gap-4")}>
                  <FormField
                    control={form.control}
                    name="guestEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldLabelHelp helpId="leads.add.guestEmail">Email</FormFieldLabelHelp>
                        <FormControl>
                          <Input placeholder="guest@example.com (optional)" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vipStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldLabelHelp helpId="leads.add.vipStatus">VIP / VVIP</FormFieldLabelHelp>
                        <Select onValueChange={field.onChange} value={field.value || "NONE"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">None</SelectItem>
                            <SelectItem value="VIP">VIP</SelectItem>
                            <SelectItem value="VVIP">VVIP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className={cn(formGrid2, "gap-4")}>
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldLabelHelp helpId="leads.add.occupation">Occupation</FormFieldLabelHelp>
                        <FormControl>
                          <Input placeholder="e.g. Business" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                    <Hotel className="h-4 w-4" />
                    Hotel bookings
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={onAddHotel} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add hotel
                  </Button>
                </div>
                {hotelFields.map((hotel, index) => (
                  <div
                    key={hotel.id}
                    className="relative rounded-lg border border-border bg-hover/30 p-4 space-y-4"
                  >
                    {hotelFields.length > 1 && (
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Hotel {index + 1}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveHotel(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <FormField
                      control={form.control}
                      name={`hotels.${index}.hotelName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormFieldLabelHelp helpId="leads.add.hotelName">Hotel name</FormFieldLabelHelp>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select hotel (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {hotelOptions.length > 0 ? (
                                hotelOptions.map((property) => (
                                  <SelectItem key={property._id} value={property.name}>
                                    {property.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-hotels-available" disabled>
                                  No PMS hotels available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <HotelStayDateFields index={index} form={form} />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <BedDouble className="h-4 w-4" />
                          Rooms
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onAddRoom(index)}
                          className="h-8"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add room
                        </Button>
                      </div>
                      {(form.watch(`hotels.${index}.rooms`) || []).map((_, roomIdx) => (
                        <div key={roomIdx} className="pl-4 border-l-2 border-border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-text-muted">
                              Room {roomIdx + 1}
                            </span>
                            {(form.watch(`hotels.${index}.rooms`) || []).length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveRoom(index, roomIdx)}
                                className="h-7 text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <FormField
                              control={form.control}
                              name={`hotels.${index}.rooms.${roomIdx}.roomCategory`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormFieldLabelHelp helpId="leads.add.roomCategory" required className="text-xs">Category</FormFieldLabelHelp>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="standard">Standard</SelectItem>
                                      <SelectItem value="deluxe">Deluxe</SelectItem>
                                      <SelectItem value="suite">Suite</SelectItem>
                                      <SelectItem value="villa">Villa</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`hotels.${index}.rooms.${roomIdx}.roomPreference`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormFieldLabelHelp helpId="leads.add.roomPreference" className="text-xs">Preference</FormFieldLabelHelp>
                                  <FormControl>
                                    <Input placeholder="e.g. Sea view" {...field} className="h-9" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`hotels.${index}.rooms.${roomIdx}.numberOfGuests`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormFieldLabelHelp helpId="leads.add.numberOfGuests" required className="text-xs">Guests</FormFieldLabelHelp>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {["1", "2", "3", "4", "5", "6", "7+"].map((n) => (
                                        <SelectItem key={n} value={n}>
                                          {n === "7+" ? "7+ Guests" : `${n} Guest${n === "1" ? "" : "s"}`}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="rounded-lg border border-border bg-surface p-4">
                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldLabelHelp helpId="leads.add.specialRequests">Special requests</FormFieldLabelHelp>
                        <FormControl>
                          <Textarea
                            placeholder="Dietary, accessibility, or other requirements..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
                <FormField
                  control={form.control}
                  name="heatLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldLabelHelp helpId="leads.add.heatLevel" required>Lead temperature</FormFieldLabelHelp>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select temperature" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="HOT">Hot</SelectItem>
                          <SelectItem value="WARM">Warm</SelectItem>
                          <SelectItem value="COLD">Cold</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bookingSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldLabelHelp helpId="leads.add.bookingSource" required>Booking source</FormFieldLabelHelp>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select booking source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BOOKING_SOURCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {showCallStatus && (
                  <div className="space-y-2">
                    <FormLabelHelp helpId="calls.center.callStatus">Call status</FormLabelHelp>
                    <Select value={callStatus || ""} onValueChange={onCallStatusChange}>
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
                )}
                <div className={cn(formGrid2, "gap-4")}>
                  <div className="space-y-2">
                    <FormLabelHelp helpId="leads.add.guestSegment">Guest segment</FormLabelHelp>
                    <Select
                      value={(customData.guest_segment as string) || ""}
                      onValueChange={(value) =>
                        setCustomData((prev) => ({ ...prev, guest_segment: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select segment" />
                      </SelectTrigger>
                      <SelectContent>
                        {GUEST_SEGMENT_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FormLabelHelp helpId="leads.add.source">Channel</FormLabelHelp>
                    <Popover open={channelOpen} onOpenChange={setChannelOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={channelOpen}
                          className="w-full justify-between font-normal"
                        >
                          <span className="truncate">
                            {(customData.lead_channel as string) || "Type to search channel…"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search channel…" />
                          <CommandList>
                            <CommandEmpty>No channel found.</CommandEmpty>
                            <CommandGroup>
                              {LEAD_CHANNEL_OPTIONS.map((opt) => {
                                const selected = (customData.lead_channel as string) === opt;
                                return (
                                  <CommandItem
                                    key={opt}
                                    value={opt}
                                    onSelect={() => {
                                      setCustomData((prev) => ({ ...prev, lead_channel: opt }));
                                      setChannelOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selected ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {opt}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="corporateBooking"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormFieldLabelHelp helpId="leads.add.corporateBooking">Corporate booking?</FormFieldLabelHelp>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-row gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="corp-yes" />
                            <Label htmlFor="corp-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="corp-no" />
                            <Label htmlFor="corp-no">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("corporateBooking") === "yes" && (
                  <div className={cn(formGrid2, "gap-4")}>
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormFieldLabelHelp helpId="leads.add.companyName">Company name</FormFieldLabelHelp>
                          <FormControl>
                            <Input placeholder="Company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gstin"
                      render={({ field }) => (
                        <FormItem>
                          <FormFieldLabelHelp helpId="leads.add.gstin">GSTIN</FormFieldLabelHelp>
                          <FormControl>
                            <Input placeholder="GSTIN number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                <div className={cn(formGrid2, "gap-4")}>
                  <FormField
                    control={form.control}
                    name="leadType"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldLabelHelp helpId="leads.add.leadType">Lead type</FormFieldLabelHelp>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lead type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FIT">FIT (Free Independent Traveler)</SelectItem>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                            <SelectItem value="Group">Group</SelectItem>
                            <SelectItem value="Wedding">Wedding</SelectItem>
                            <SelectItem value="MICE">MICE</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldLabelHelp helpId="leads.add.value">Estimated Booking Value</FormFieldLabelHelp>
                        <FormControl>
                          <Input placeholder="e.g. ₹25,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <ReviewSummary form={form} />
                <div className="rounded-lg border border-border bg-surface p-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldLabelHelp helpId="leads.add.notes">Notes</FormFieldLabelHelp>
                        <FormControl>
                          <Textarea placeholder="Additional notes for this lead..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <CustomFieldsSection
                  customFields={customFields}
                  customData={customData}
                  setCustomData={setCustomData}
                />
              </div>
            )}
          </div>
        </div>

        <div
          className={
            isInline
              ? "flex justify-between gap-2 pt-2 border-t border-border"
              : "shrink-0 flex justify-between gap-2 px-6 py-4 border-t border-border bg-surface"
          }
        >
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button type="button" onClick={() => void handleContinue()} disabled={isSubmitting}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Lead"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
