import { useEffect, useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  startOfMonth,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTACT_ACTIVITY_TYPE_OPTIONS,
  formatContactActivityType,
} from "@/services/contactActivities";
import {
  getWeekPlannerData,
  type WeekPlannerActivity,
  type WeekPlannerData,
} from "@/services/weekPlanner";

interface UserActivitiesProps {
  onViewAccount?: (accountId: string) => void;
  onViewLead?: (leadId: string) => void;
}

export function UserActivities({
  onViewAccount,
  onViewLead,
}: UserActivitiesProps) {
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [data, setData] = useState<WeekPlannerData | null>(null);
  const [activityType, setActivityType] = useState("all");
  const [accountId, setAccountId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(
        await getWeekPlannerData(
          startOfMonth(month),
          endOfMonth(month)
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [month]);

  const accounts = useMemo(() => {
    const accountMap = new Map<string, string>();
    for (const activity of data?.activities ?? []) {
      if (activity.accountId?._id) {
        accountMap.set(activity.accountId._id, activity.accountId.name);
      }
    }
    return Array.from(accountMap, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [data]);

  const filteredActivities = useMemo(() => {
    return (data?.activities ?? [])
      .filter((activity) => activity.status !== "CANCELLED")
      .filter(
        (activity) =>
          activityType === "all" || activity.activityType === activityType
      )
      .filter(
        (activity) =>
          accountId === "all" || activity.accountId?._id === accountId
      )
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      );
  }, [data, activityType, accountId]);

  const selectedDayActivities = useMemo(
    () =>
      filteredActivities.filter((activity) =>
        isSameDay(new Date(activity.startsAt), selectedDate)
      ),
    [filteredActivities, selectedDate]
  );

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(month),
        end: endOfMonth(month),
      }),
    [month]
  );
  const leadingDays = Array.from(
    { length: startOfMonth(month).getDay() },
    (_, index) => index
  );

  const changeMonth = (offset: number) => {
    const next = new Date(month);
    next.setMonth(next.getMonth() + offset);
    setMonth(next);
    setSelectedDate(startOfMonth(next));
  };

  const activityContext = (activity: WeekPlannerActivity) => {
    const parts = [
      activity.accountId?.name,
      activity.contactId?.name,
      activity.leadId?.leadNumber
        ? `Lead ${activity.leadId.leadNumber}`
        : undefined,
    ].filter(Boolean);
    return parts.join(" · ");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-text">Activities</h1>
        <p className="mt-1 text-sm text-text-muted">
          Scheduled activities across your mapped accounts and contacts.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row">
        <Select value={activityType} onValueChange={setActivityType}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Activity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity types</SelectItem>
            {CONTACT_ACTIVITY_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All mapped accounts</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium text-text">Unable to load activities</p>
            <p className="mt-1 text-sm text-text-muted">{error}</p>
            <Button className="mt-4" variant="outline" onClick={() => void load()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-text">
                {format(selectedDate, "EEEE, d MMMM")}
              </h2>
              <span className="text-sm text-text-muted">
                {selectedDayActivities.length}{" "}
                {selectedDayActivities.length === 1 ? "activity" : "activities"}
              </span>
            </div>

            {selectedDayActivities.length === 0 ? (
              <Card>
                <CardContent className="py-14 text-center">
                  <CalendarDays className="mx-auto h-9 w-9 text-text-muted" />
                  <p className="mt-3 font-medium text-text">
                    No activities on this date
                  </p>
                  <p className="mt-1 text-sm text-text-muted">
                    Select another date from the calendar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="divide-y divide-border rounded-md border border-border bg-surface">
                {selectedDayActivities.map((activity) => (
                  <div key={activity._id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-text">
                            {formatContactActivityType(activity.activityType)}
                          </p>
                          {activity.category && (
                            <Badge variant="outline">{activity.category}</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-text-muted">
                          {format(new Date(activity.startsAt), "h:mm a")}
                          {activity.endsAt
                            ? ` – ${format(new Date(activity.endsAt), "h:mm a")}`
                            : ""}
                        </p>
                        {activityContext(activity) && (
                          <p className="mt-2 text-sm text-text-muted">
                            {activityContext(activity)}
                          </p>
                        )}
                        {activity.purpose && (
                          <p className="mt-2 text-sm text-text">
                            {activity.purpose}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {activity.accountId?._id && onViewAccount && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              onViewAccount(activity.accountId!._id)
                            }
                          >
                            Account
                          </Button>
                        )}
                        {activity.leadId?._id && onViewLead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewLead(activity.leadId!._id)}
                          >
                            Lead
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Card className="h-fit">
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold text-text">
                  {format(month, "MMMM yyyy")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-1 text-center text-[11px] font-medium text-text-muted"
                    >
                      {day.slice(0, 1)}
                    </div>
                  )
                )}
                {leadingDays.map((index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}
                {days.map((day) => {
                  const count = filteredActivities.filter((activity) =>
                    isSameDay(new Date(activity.startsAt), day)
                  ).length;
                  const selected = isSameDay(day, selectedDate);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      className={`relative aspect-square rounded-md text-sm transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : isToday(day)
                            ? "bg-muted font-semibold text-text"
                            : "text-text hover:bg-muted"
                      }`}
                    >
                      {format(day, "d")}
                      {count > 0 && (
                        <span
                          className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                            selected ? "bg-primary-foreground" : "bg-primary"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
