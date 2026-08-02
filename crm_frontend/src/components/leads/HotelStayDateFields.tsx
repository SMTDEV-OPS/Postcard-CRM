import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormFieldLabelHelp } from "@/components/help/FormLabelHelp";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { disableCheckInDate, disableCheckoutDate, startOfDay } from "@/lib/leadDates";
import type { LeadFormData } from "./useLeadForm";

interface HotelStayDateFieldsProps {
  index: number;
  form: UseFormReturn<LeadFormData>;
  checkInLabel?: string;
  checkOutLabel?: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const FROM_YEAR = CURRENT_YEAR;
const TO_YEAR = CURRENT_YEAR + 5;

export function HotelStayDateFields({
  index,
  form,
  checkInLabel = "Check-in *",
  checkOutLabel = "Check-out *",
}: HotelStayDateFieldsProps) {
  const checkIn = form.watch(`hotels.${index}.checkInDate`);
  const today = startOfDay(new Date());

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name={`hotels.${index}.checkInDate`}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormFieldLabelHelp helpId="leads.add.checkInDate" required>{checkInLabel.replace(" *", "")}</FormFieldLabelHelp>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value || undefined}
                  onSelect={(date) => {
                    field.onChange(date);
                    const checkOut = form.getValues(`hotels.${index}.checkOutDate`);
                    if (date && checkOut && startOfDay(checkOut) < startOfDay(date)) {
                      form.setValue(`hotels.${index}.checkOutDate`, undefined as unknown as Date);
                    }
                  }}
                  disabled={disableCheckInDate}
                  defaultMonth={field.value ?? today}
                  fromDate={today}
                  fromYear={FROM_YEAR}
                  toYear={TO_YEAR}
                  captionLayout="dropdown-buttons"
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`hotels.${index}.checkOutDate`}
        render={({ field }) => {
          const fromDate = checkIn ? startOfDay(checkIn) : today;
          return (
            <FormItem className="flex flex-col">
              <FormFieldLabelHelp helpId="leads.add.checkOutDate" required>{checkOutLabel.replace(" *", "")}</FormFieldLabelHelp>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    key={checkIn instanceof Date ? checkIn.toISOString() : "no-ci"}
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    disabled={(date) => disableCheckoutDate(date, checkIn || null)}
                    defaultMonth={field.value ?? checkIn ?? today}
                    fromDate={fromDate}
                    fromYear={FROM_YEAR}
                    toYear={TO_YEAR}
                    captionLayout="dropdown-buttons"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
