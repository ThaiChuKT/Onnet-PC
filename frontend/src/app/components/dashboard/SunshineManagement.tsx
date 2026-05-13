import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Activity, Copy, Plus, RefreshCw, Trash2, Wifi } from "lucide-react";
import { apiDelete, apiGet, apiPost } from "../../api/http";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type SunshineHost = {
  id: number;
  name: string;
  hostAddress: string;
  hostPort: number;
  enabled: boolean;
  notes: string | null;
};

type CreateHostRequest = {
  name: string;
  hostAddress: string;
  hostPort: number;
  notes?: string;
  enabled?: boolean;
};

type MoonlightCommandResponse = {
  logId: number;
  hostId: number;
  action: string;
  status: string;
  executedOnServer: boolean;
  command: string;
  output: string | null;
  message: string;
};

type MoonlightCommandRequest = {
  action: string;
  resolution?: string;
  fps?: number;
  appName?: string;
  executeOnServer?: boolean;
};

type MoonlightLogItem = {
  id: number;
  action: string;
  command: string;
  status: string;
  output: string | null;
  createdAt: string;
};

export function SunshineManagement() {
  const [hosts, setHosts] = useState<SunshineHost[]>([]);
  const [logsByHost, setLogsByHost] = useState<Record<number, MoonlightLogItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [executingHostId, setExecutingHostId] = useState<number | null>(null);
  const [newName, setNewName] = useState("Sunshine Host");
  const [newAddress, setNewAddress] = useState("58.187.67.90");
  const [newPort, setNewPort] = useState("47989");
  const [newNotes, setNewNotes] = useState("");
  const [selectedAction, setSelectedAction] = useState("PROBE");
  const [selectedResolution, setSelectedResolution] = useState("1080p");
  const [selectedFps, setSelectedFps] = useState("60");

  const loadHosts = async () => {
    setIsLoading(true);
    try {
      const rows = await apiGet<SunshineHost[]>("/admin/moonlight/hosts");
      setHosts(rows ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load Sunshine hosts");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async (hostId: number) => {
    try {
      const rows = await apiGet<MoonlightLogItem[]>(`/admin/moonlight/hosts/${hostId}/commands`);
      setLogsByHost((prev) => ({ ...prev, [hostId]: rows ?? [] }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load command logs");
    }
  };

  useEffect(() => {
    void loadHosts();
  }, []);

  useEffect(() => {
    hosts.forEach((host) => {
      void loadLogs(host.id);
    });
  }, [hosts]);

  const handleCreateHost = async () => {
    const name = newName.trim();
    const hostAddress = newAddress.trim();
    const port = Number(newPort);

    if (!name || !hostAddress || Number.isNaN(port)) {
      toast.error("Please provide valid host name, IP/host, and port");
      return;
    }

    setCreating(true);
    try {
      const payload: CreateHostRequest = {
        name,
        hostAddress,
        hostPort: port,
        notes: newNotes.trim() || undefined,
        enabled: true,
      };
      await apiPost<SunshineHost, CreateHostRequest>("/admin/moonlight/hosts", payload);
      toast.success("Sunshine host added");
      await loadHosts();
      setNewNotes("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create host");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteHost = async (host: SunshineHost) => {
    if (!confirm(`Delete Sunshine host ${host.name}?`)) {
      return;
    }

    try {
      await apiDelete<string>(`/admin/moonlight/hosts/${host.id}`);
      toast.success("Host removed");
      await loadHosts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete host");
    }
  };

  const buildCommandPayload = (): MoonlightCommandRequest => {
    const payload: MoonlightCommandRequest = {
      action: selectedAction,
      executeOnServer: true,
    };

    if (selectedAction === "STREAM") {
      payload.resolution = selectedResolution;
      payload.fps = Number(selectedFps);
    }

    return payload;
  };

  const handleRunCommand = async (host: SunshineHost) => {
    setExecutingHostId(host.id);
    try {
      const result = await apiPost<MoonlightCommandResponse, MoonlightCommandRequest>(
        `/admin/moonlight/hosts/${host.id}/commands`,
        buildCommandPayload(),
      );
      toast.success(result.message || "Command queued");
      if (result.output) {
        toast.info(result.output.length > 220 ? `${result.output.slice(0, 220)}...` : result.output);
      }
      await loadLogs(host.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not run command");
    } finally {
      setExecutingHostId(null);
    }
  };

  const handleCopyCommand = async (host: SunshineHost) => {
    const result = await apiPost<MoonlightCommandResponse, MoonlightCommandRequest>(
      `/admin/moonlight/hosts/${host.id}/commands`,
      { ...buildCommandPayload(), executeOnServer: false },
    );

    try {
      await navigator.clipboard.writeText(result.command);
      toast.success("Command copied to clipboard");
    } catch {
      toast.error("Could not copy command");
    }
  };

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 border-border bg-card/50">
          <p className="text-sm text-muted-foreground">Configured hosts</p>
          <p className="text-2xl font-bold">{hosts.length}</p>
        </Card>
        <Card className="p-4 border-border bg-card/50">
          <p className="text-sm text-muted-foreground">Enabled hosts</p>
          <p className="text-2xl font-bold text-accent">
            {hosts.filter((h) => h.enabled).length}
          </p>
        </Card>
        <Card className="p-4 border-border bg-card/50">
          <p className="text-sm text-muted-foreground">Default host IP</p>
          <p className="text-lg font-semibold">58.187.67.90</p>
        </Card>
      </div>

      <Card className="p-5 border-border mb-6">
        <h3 className="text-lg font-bold mb-4">Add Sunshine host</h3>
        <div className="grid md:grid-cols-4 gap-3">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Host name" />
          <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Host IP / DNS" />
          <Input value={newPort} onChange={(e) => setNewPort(e.target.value)} placeholder="Port" />
          <Input value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Optional notes" />
        </div>
        <div className="mt-4">
          <Button disabled={creating} onClick={handleCreateHost}>
            <Plus className="w-4 h-4 mr-2" />
            {creating ? "Saving..." : "Save host"}
          </Button>
        </div>
      </Card>

      <Card className="p-5 border-border mb-6">
        <h3 className="text-lg font-bold mb-4">Command profile</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger>
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PROBE">PROBE (moonlight list)</SelectItem>
              <SelectItem value="PAIR">PAIR</SelectItem>
              <SelectItem value="STREAM">STREAM</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedResolution} onValueChange={setSelectedResolution}>
            <SelectTrigger>
              <SelectValue placeholder="Resolution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
              <SelectItem value="1440p">1440p</SelectItem>
              <SelectItem value="4k">4K</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedFps} onValueChange={setSelectedFps}>
            <SelectTrigger>
              <SelectValue placeholder="FPS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 FPS</SelectItem>
              <SelectItem value="60">60 FPS</SelectItem>
              <SelectItem value="120">120 FPS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="space-y-4">
        {isLoading && (
          <Card className="p-8 border-border text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Loading Sunshine hosts...</p>
          </Card>
        )}

        {!isLoading && hosts.map((host) => {
          const logs = logsByHost[host.id] ?? [];
          return (
            <Card key={host.id} className="p-5 border-border">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold">{host.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {host.hostAddress}:{host.hostPort}
                  </p>
                  {host.notes && <p className="text-sm mt-1">{host.notes}</p>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={executingHostId === host.id}
                    onClick={() => void handleCopyCommand(host)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy command
                  </Button>
                  <Button
                    disabled={executingHostId === host.id}
                    onClick={() => void handleRunCommand(host)}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    {executingHostId === host.id ? "Running..." : "Run on server"}
                  </Button>
                  <Button variant="outline" onClick={() => void handleDeleteHost(host)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-semibold mb-2">Recent command logs</p>
                {logs.length === 0 && (
                  <p className="text-sm text-muted-foreground">No command logs yet.</p>
                )}
                <div className="space-y-2">
                  {logs.slice(0, 3).map((log) => (
                    <div key={log.id} className="rounded-lg border border-border p-3 bg-muted/20">
                      <p className="text-sm">
                        <strong>{log.action}</strong> - {log.status} - {new Date(log.createdAt).toLocaleString("en-US")}
                      </p>
                      <p className="text-xs text-muted-foreground break-all mt-1">{log.command}</p>
                      {log.output && (
                        <pre className="text-xs mt-2 whitespace-pre-wrap bg-background p-2 rounded border border-border">
                          {log.output.length > 500 ? `${log.output.slice(0, 500)}...` : log.output}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}

        {!isLoading && hosts.length === 0 && (
          <Card className="p-8 border-border text-center">
            <Wifi className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">No Sunshine host configured</p>
            <p className="text-sm text-muted-foreground">Add your host above to start pairing and command execution.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
