import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  createKnowlarityAgentMapping,
  deleteKnowlarityAgentMapping,
  listCallCenterUsers,
  listKnowlarityAgentMappings,
  updateKnowlarityAgentMapping,
  type CallCenterUser,
  type KnowlarityAgentMapping,
} from "@/services/knowlarity";

export function KnowlarityAgentMappingPanel() {
  const [mappings, setMappings] = useState<KnowlarityAgentMapping[]>([]);
  const [users, setUsers] = useState<CallCenterUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentNumber, setAgentNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mappingData, userData] = await Promise.all([
        listKnowlarityAgentMappings(),
        listCallCenterUsers(),
      ]);
      setMappings(mappingData);
      setUsers(userData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load mappings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAdd = async () => {
    if (!agentNumber.trim() || !userId) {
      toast.error("Agent number and CRM user are required");
      return;
    }
    setSaving(true);
    try {
      await createKnowlarityAgentMapping({
        agentNumber: agentNumber.trim(),
        userId,
        label: label.trim() || undefined,
      });
      toast.success("Mapping added");
      setAgentNumber("");
      setUserId("");
      setLabel("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add mapping");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (mapping: KnowlarityAgentMapping) => {
    try {
      await updateKnowlarityAgentMapping(mapping._id, { isActive: !mapping.isActive });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update mapping");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteKnowlarityAgentMapping(id);
      toast.success("Mapping removed");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete mapping");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Agent number mapping</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Map each Knowlarity <code className="bg-muted px-1 rounded">agent_number</code> to a CRM
          call-center user. Post-call logs are stored under that user&apos;s ID.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label>Knowlarity agent number</Label>
          <Input
            value={agentNumber}
            onChange={(e) => setAgentNumber(e.target.value)}
            placeholder="+919811122233"
          />
        </div>
        <div className="space-y-1.5">
          <Label>CRM user</Label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Label (optional)</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Goa reservations"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={() => void handleAdd()} disabled={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Add mapping
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : mappings.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No agent mappings yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent number</TableHead>
                <TableHead>CRM user</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((m) => (
                <TableRow key={m._id}>
                  <TableCell className="font-mono text-sm">{m.agentNumber}</TableCell>
                  <TableCell>
                    {typeof m.userId === "object" && m.userId
                      ? `${m.userId.name} (${m.userId.email})`
                      : "—"}
                  </TableCell>
                  <TableCell>{m.label || "—"}</TableCell>
                  <TableCell>
                    <Switch checked={m.isActive} onCheckedChange={() => void toggleActive(m)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void handleDelete(m._id)}
                      aria-label="Delete mapping"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
