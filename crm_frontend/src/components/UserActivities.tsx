import { useEffect, useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDaysInMonth,
  isSameDay,
  isToday,
  startOfMonth,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ActivityWizard } from "@/components/activities/ActivityWizard";
import {
  CONTACT_ACTIVITY_TYPE_OPTIONS,
  formatContactActivityType,
} from "@/services/contactActivities";
import { listAccounts, type Account } from "@/services/accounts";
import {
  getWeekPlannerData,
  type WeekPlannerActivity,
  type WeekPlannerData,
  type WeekPlannerFollowUp,
  type WeekPlannerTask,
} from "@/services/weekPlanner";

interface UserActivitiesProps {
  onViewAccount?: (accountId: string) => void;
  onViewLead?: (leadId: string) => void;
}

type AgendaItem =
  | { kind: "activity"; date: Date; activity: WeekPlannerActivity }
  | { kind: "task"; date: Date; task: WeekPlannerTask }
  | { kind: "account_followup"; date: Date; followUp: WeekPlannerFollowUp };

export function UserActivities({
  onViewAccount,
  onViewLead,
}: UserActivitiesProps) {
  const { toast } = useToast();
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [data, setData] = useState<WeekPlannerData | null>(null);
  const [activityType, setActivityType] = useState("all");
  const [accountId, setAccountId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mappedAccounts, setMappedAccounts] = useState<Account[]>([]);
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [pickerAccountId, setPickerAccountId] = useState("");
  const [activityAccountId, setActivityAccountId] = useState<string | null>(null);
  const [activityWizardOpen, setActivityWizardOpen] = useState(false);
  const [activityInitialDate, setActivityInitialDate] = useState<Date | undefined>();

  const load = async () => {
    const soft = data != null;
    if (soft) setRefreshing(true);
    else setLoading(true);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when month changes
  }, [month]);

  useEffect(() => {
    listAccounts({ myAccounts: true })
      .then(setMappedAccounts)
      .catch(() => setMappedAccounts([]));
  }, []);

  const accounts = useMemo(() => {
    const accountMap = new Map<string, string>();
    for (const a of mappedAccounts) {
      accountMap.set(a.id, a.name);
    }
    for (const activity of data?.activities ?? []) {
      if (activity.accountId?._id) {
        accountMap.set(activity.accountId._id, activity.accountId.name);
      }
    }
    for (const task of data?.tasks ?? []) {
      if (task.accountId?._id) {
        accountMap.set(task.accountId._id, task.accountId.name);
      }
    }
    return Array.from(accountMap, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [data, mappedAccounts]);

  const openAddActivity = (date?: Date) => {
    setActivityInitialDate(date ?? selectedDate);
    if (accounts.length === 0) {
      toast({
        title: "No accounts",
        description: "Map yourself to an account before adding activities.",
        variant: "destructive",
      });
      return;
    }
    if (accounts.length === 1) {
      setActivityAccountId(accounts[0].id);
      setActivityWizardOpen(true);
      return;
    }
    setPickerAccountId("");
    setAccountPickerOpen(true);
  };

  const confirmAccountPicker = () => {
    if (!pickerAccountId) {
      toast({ title: "Required", description: "Select an account", variant: "destructive" });
      return;
    }
    setActivityAccountId(pickerAccountId);
    setAccountPickerOpen(false);
    setActivityWizardOpen(true);
  };

  const agendaItems = useMemo<AgendaItem[]>(() => {
    const activities = (data?.activities ?? [])
      .filter((activity) => activity.status !== "CANCELLED")
      .filter(
        (activity) =>
          activityType === "all" || activity.activityType === activityType
      )
      .filter(
        (activity) =>
          accountId === "all" || activity.accountId?._id === accountId
      )
      .map((activity) => ({
        kind: "activity" as const,
        date: new Date(activity.startsAt),
        activity,
      }));

    const tasks =
      activityType === "all"
        ? (data?.tasks ?? [])
            .filter((task) => task.status !== "COMPLETED" && task.status !== "CANCELLED")
            .filter(
              (task) =>
                accountId === "all" || task.accountId?._id === accountId
            )
            .map((task) => ({
              kind: "task" as const,
              date: new Date(task.dueAt),
              task,
            }))
        : [];

    const followUps =
      activityType === "all" && accountId === "all"
        ? (data?.followUps ?? [])
            .filter((followUp) => followUp.followUpDate)
            .map((followUp) => ({
              kind: "account_followup" as const,
              date: new Date(followUp.followUpDate),
              followUp,
            }))
        : activityType === "all"
          ? (data?.followUps ?? [])
              .filter((followUp) => followUp.followUpDate)
              .filter((followUp) => followUp._id === accountId)
              .map((followUp) => ({
                kind: "account_followup" as const,
                date: new Date(followUp.followUpDate),
                followUp,
              }))
          : [];

    return [...activities, ...tasks, ...followUps].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }, [data, activityType, accountId]);

  const selectedDayItems = useMemo(
    () => agendaItems.filter((item) => isSameDay(item.date, selectedDate)),
    [agendaItems, selectedDate]
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
    const day = selectedDate.getDate();
    const capped = Math.min(day, getDaysInMonth(next));
    setSelectedDate(new Date(next.getFullYear(), next.getMonth(), capped));
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text">Activities</h1>
          <p className="mt-1 text-sm text-text-muted">
            Activities, tasks, and account follow-ups across your mapped accounts.
          </p>
        </div>
        <Button size="sm" onClick={() => openAddActivity()}>
          <Plus className="h-4 w-4 mr-2" />
          Add activity
        </Button>
      </div>

      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row">
        <Select value={activityType} onValueChange={setActivityType}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Activity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
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

      {loading && !data ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      ) : error && !data ? (
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
        <div className={`grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] ${refreshing ? "opacity-70" : ""}`}>
          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-text">
                {format(selectedDate, "EEEE, d MMMM")}
              </h2>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                {refreshing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>
                  {selectedDayItems.length}{" "}
                  {selectedDayItems.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            {selectedDayItems.length === 0 ? (
              <Card>
                <CardContent className="py-14 text-center">
                  <CalendarDays className="mx-auto h-9 w-9 text-text-muted" />
                  <p className="mt-3 font-medium text-text">
                    Nothing scheduled on this date
                  </p>
                  <p className="mt-1 text-sm text-text-muted">
                    No activities, tasks, or follow-ups for{" "}
                    {format(selectedDate, "d MMM")}. Try another day or month.
                  </p>
                  <Button className="mt-4" size="sm" onClick={() => openAddActivity(selectedDate)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add activity
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="divide-y divide-border rounded-md border border-border bg-surface">
                {selectedDayItems.map((item) => {
                  if (item.kind === "activity") {
                    const activity = item.activity;
                    return (
                      <div key={`activity-${activity._id}`} className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-text">
                                {formatContactActivityType(activity.activityType)}
                              </p>
                              <Badge variant="outline">Activity</Badge>
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
                    );
                  }

                  if (item.kind === "task") {
                    const task = item.task;
                    return (
                      <div key={`task-${task._id}`} className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-text">{task.title}</p>
                              <Badge variant="outline">Task</Badge>
                            </div>
                            <p className="mt-1 text-sm text-text-muted">
                              {format(new Date(task.dueAt), "h:mm a")}
                              {task.accountId?.name ? ` · ${task.accountId.name}` : ""}
                              {task.leadId?.leadNumber
                                ? ` · Lead ${task.leadId.leadNumber}`
                                : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            {task.accountId?._id && onViewAccount && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onViewAccount(task.accountId!._id)}
                              >
                                Account
                              </Button>
                            )}
                            {task.leadId?._id && onViewLead && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onViewLead(task.leadId!._id)}
                              >
                                Lead
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const followUp = item.followUp;
                  return (
                    <div key={`followup-${followUp._id}`} className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-text">
                              Follow-up: {followUp.name}
                            </p>
                            <Badge variant="outline">Follow-up</Badge>
                          </div>
                          <p className="mt-1 text-sm text-text-muted">
                            {followUp.followUpNote || "Account follow-up"}
                          </p>
                        </div>
                        {onViewAccount && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewAccount(followUp._id)}
                          >
                            Account
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                  disabled={refreshing}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex items-center gap-2 text-sm font-semibold text-text">
                  {format(month, "MMMM yyyy")}
                  {refreshing && <Loader2 className="h-3.5 w-3.5 animate-spin text-text-muted" />}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                  disabled={refreshing}
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
                  const count = agendaItems.filter((item) =>
                    isSameDay(item.date, day)
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

      <Dialog open={accountPickerOpen} onOpenChange={setAccountPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select account</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Activity for account</Label>
            <Select value={pickerAccountId} onValueChange={setPickerAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountPickerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAccountPicker}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {activityAccountId && (
        <ActivityWizard
          open={activityWizardOpen}
          onOpenChange={(open) => {
            setActivityWizardOpen(open);
            if (!open) setActivityAccountId(null);
          }}
          accountId={activityAccountId}
          initialDate={activityInitialDate}
          onSuccess={() => {
            setActivityWizardOpen(false);
            setActivityAccountId(null);
            void load();
          }}
        />
      )}
    </div>
  );
}
