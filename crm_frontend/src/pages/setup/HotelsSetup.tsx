import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import {
  createProperty,
  listProperties,
  updateProperty,
  type Property,
} from "@/services/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabelHelp } from "@/components/help/FormLabelHelp";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formGrid2 } from "@/lib/responsive";
import { useToast } from "@/hooks/use-toast";

function makePropertyCode(name: string): string {
  const base = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base || `PROPERTY_${Date.now()}`;
}

type HotelForm = {
  name: string;
  city: string;
  state: string;
  country: string;
  status: "ACTIVE" | "INACTIVE";
};

const emptyForm = (): HotelForm => ({
  name: "",
  city: "",
  state: "",
  country: "India",
  status: "ACTIVE",
});

export function HotelsSetup() {
  const { toast } = useToast();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HotelForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  const codePreview = useMemo(() => (form.name.trim() ? makePropertyCode(form.name) : ""), [form.name]);

  const normalizeHotelName = (name: string) =>
    name.trim().toLowerCase().replace(/\s+/g, " ");

  const findDuplicateName = (name: string, excludeId?: string | null) => {
    const key = normalizeHotelName(name);
    if (!key) return undefined;
    return items.find(
      (p) =>
        p._id !== excludeId &&
        normalizeHotelName(p.name) === key
    );
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listProperties();
      setItems(
        [...(data || [])].sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const dup = findDuplicateName(form.name);
    if (dup) {
      toast({
        title: "Duplicate hotel name",
        description: `“${dup.name}” already exists (${dup.status}). Use a unique name or edit the existing hotel.`,
        variant: "destructive",
      });
      return;
    }
    try {
      setSaving(true);
      await createProperty({
        name: form.name.trim(),
        code: makePropertyCode(form.name),
        location: {
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          country: form.country.trim() || undefined,
        },
        status: "ACTIVE",
        pmsProvider: "NONE",
      });
      setAddOpen(false);
      setForm(emptyForm());
      await load();
      toast({ title: "Hotel added" });
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (property: Property) => {
    setEditingId(property._id);
    setForm({
      name: property.name,
      city: property.location?.city ?? "",
      state: property.location?.state ?? "",
      country: property.location?.country ?? "",
      status: property.status,
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingId || !form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const dup = findDuplicateName(form.name, editingId);
    if (dup) {
      toast({
        title: "Duplicate hotel name",
        description: `“${dup.name}” already exists (${dup.status}). Choose a different name.`,
        variant: "destructive",
      });
      return;
    }
    try {
      setSaving(true);
      await updateProperty(editingId, {
        name: form.name.trim(),
        location: {
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          country: form.country.trim() || undefined,
        },
        status: form.status,
      });
      setEditOpen(false);
      setEditingId(null);
      setForm(emptyForm());
      await load();
      toast({ title: "Hotel updated" });
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const locationLabel = (p: Property) =>
    [p.location?.city, p.location?.state, p.location?.country].filter(Boolean).join(", ");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Master list of Postcard hotels used in leads, accounts, and contracts. PMS sync is not used for these properties.
      </p>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setForm(emptyForm()); setAddOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add hotel
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hotels yet. Add one or run the Postcard hotels seed.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {items.map((p) => (
            <li key={p._id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium truncate">{p.name}</p>
                  <Badge variant={p.status === "ACTIVE" ? "secondary" : "outline"} className="text-[10px]">
                    {p.status === "ACTIVE" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs truncate">
                  {locationLabel(p) || "No location"}
                  {" · "}
                  {p.code}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add hotel</DialogTitle>
          </DialogHeader>
          <HotelFormFields form={form} setForm={setForm} codePreview={codePreview} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit hotel</DialogTitle>
          </DialogHeader>
          <HotelFormFields form={form} setForm={setForm} codePreview={codePreview} showStatus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void handleUpdate()} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HotelFormFields({
  form,
  setForm,
  codePreview,
  showStatus,
}: {
  form: HotelForm;
  setForm: (f: HotelForm) => void;
  codePreview: string;
  showStatus?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div>
        <FormLabelHelp helpId="setup.hotels.name" required>Name</FormLabelHelp>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="The Postcard …"
        />
      </div>
      {codePreview && (
        <p className="text-xs text-muted-foreground">Code: {codePreview}</p>
      )}
      <div className={formGrid2}>
        <div>
          <FormLabelHelp helpId="setup.hotels.city">City</FormLabelHelp>
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <FormLabelHelp helpId="setup.hotels.state">State</FormLabelHelp>
          <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        </div>
      </div>
      <div>
        <FormLabelHelp helpId="setup.hotels.country">Country</FormLabelHelp>
        <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
      </div>
      {showStatus && (
        <div>
          <FormLabelHelp helpId="setup.hotels.status">Status</FormLabelHelp>
          <Select
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v as "ACTIVE" | "INACTIVE" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
