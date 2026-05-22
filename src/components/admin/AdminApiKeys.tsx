import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Copy, Key, Plus, Trash2, Webhook, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
  revoked_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface WebhookRow {
  id: string;
  api_key_id: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(bytes = 24): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function AdminApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<{ name: string; full: string } | null>(null);
  const [whUrl, setWhUrl] = useState("");
  const [whKeyId, setWhKeyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [k, w] = await Promise.all([
      supabase.from("partner_api_keys").select("*").order("created_at", { ascending: false }),
      supabase.from("partner_webhooks").select("*").order("created_at", { ascending: false }),
    ]);
    setKeys((k.data as any) ?? []);
    setWebhooks((w.data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createKey = async () => {
    if (!newKeyName.trim()) return toast.error("Name required");
    setCreating(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const token = `mr_live_${randomToken(24)}`;
      const prefix = token.slice(0, 12);
      const hash = await sha256Hex(token);
      const { error } = await supabase.from("partner_api_keys").insert({
        name: newKeyName.trim(),
        key_prefix: prefix,
        key_hash: hash,
        created_by: u.user?.id,
      } as any);
      if (error) throw error;
      setRevealedKey({ name: newKeyName.trim(), full: token });
      setNewKeyName("");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: string) => {
    if (!confirm("Revoke this API key? It cannot be undone.")) return;
    const { error } = await supabase.from("partner_api_keys").update({
      is_active: false, revoked_at: new Date().toISOString(),
    } as any).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Key revoked");
    load();
  };

  const createWebhook = async () => {
    if (!whUrl.trim() || !whKeyId) return;
    const secret = `whsec_${randomToken(24)}`;
    const { error } = await supabase.from("partner_webhooks").insert({
      api_key_id: whKeyId, url: whUrl.trim(), secret,
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Webhook added");
    setWhUrl(""); setWhKeyId(null);
    load();
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Delete this webhook?")) return;
    await supabase.from("partner_webhooks").delete().eq("id", id);
    load();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Key className="h-5 w-5" /> Partner API
          </h2>
          <p className="text-sm text-muted-foreground">Issue keys, configure webhooks, manage integrations.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/api-docs" target="_blank"><ExternalLink className="h-3 w-3 mr-1" /> API Docs</Link>
        </Button>
      </div>

      {/* Create key */}
      <Card className="p-4">
        <h3 className="font-display font-bold mb-3">Create new API key</h3>
        <div className="flex gap-2">
          <Input placeholder="Name (e.g. Acme Logistics)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
          <Button onClick={createKey} disabled={creating}><Plus className="h-4 w-4 mr-1" /> Generate</Button>
        </div>
      </Card>

      {/* Reveal dialog */}
      <Dialog open={!!revealedKey} onOpenChange={(o) => !o && setRevealedKey(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>API key created — copy it now</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            This is the only time the full key will be shown. Store it securely.
          </p>
          <div className="bg-muted p-3 rounded font-mono text-xs break-all">{revealedKey?.full}</div>
          <Button onClick={() => revealedKey && copy(revealedKey.full)}>
            <Copy className="h-4 w-4 mr-1" /> Copy key
          </Button>
        </DialogContent>
      </Dialog>

      {/* Keys list */}
      <Card className="p-4">
        <h3 className="font-display font-bold mb-3">API Keys</h3>
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> :
         keys.length === 0 ? <p className="text-sm text-muted-foreground">No keys yet.</p> :
         <div className="space-y-2">
           {keys.map(k => (
             <div key={k.id} className="border border-border rounded-lg p-3 flex items-center justify-between gap-3">
               <div className="min-w-0 flex-1">
                 <div className="flex items-center gap-2">
                   <span className="font-semibold">{k.name}</span>
                   {k.revoked_at ? <Badge variant="destructive">Revoked</Badge> : <Badge variant="secondary">Active</Badge>}
                 </div>
                 <code className="text-xs text-muted-foreground">{k.key_prefix}…</code>
                 <p className="text-xs text-muted-foreground">
                   {k.last_used_at ? `Last used ${new Date(k.last_used_at).toLocaleString()}` : "Never used"}
                 </p>
               </div>
               {!k.revoked_at && (
                 <Button variant="ghost" size="sm" onClick={() => revokeKey(k.id)}>
                   <Trash2 className="h-4 w-4" />
                 </Button>
               )}
             </div>
           ))}
         </div>}
      </Card>

      {/* Webhooks */}
      <Card className="p-4">
        <h3 className="font-display font-bold mb-3 flex items-center gap-2">
          <Webhook className="h-4 w-4" /> Webhooks
        </h3>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={whKeyId ?? ""}
            onChange={e => setWhKeyId(e.target.value || null)}
          >
            <option value="">Select API key…</option>
            {keys.filter(k => !k.revoked_at).map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
          <Input placeholder="https://yourapp.com/webhooks/macey" value={whUrl} onChange={e => setWhUrl(e.target.value)} />
          <Button onClick={createWebhook} disabled={!whUrl || !whKeyId}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {webhooks.length === 0 ? <p className="text-sm text-muted-foreground">No webhooks configured.</p> :
           webhooks.map(w => {
             const key = keys.find(k => k.id === w.api_key_id);
             return (
               <div key={w.id} className="border border-border rounded-lg p-3">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-sm font-semibold">{key?.name ?? "Unknown key"}</span>
                   <Button variant="ghost" size="sm" onClick={() => deleteWebhook(w.id)}>
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </div>
                 <p className="text-xs text-muted-foreground break-all">{w.url}</p>
                 <div className="flex items-center gap-2 mt-2">
                   <Label className="text-xs">Secret:</Label>
                   <code className="text-xs bg-muted px-2 py-0.5 rounded">{w.secret.slice(0, 16)}…</code>
                   <Button variant="ghost" size="sm" onClick={() => copy(w.secret)}>
                     <Copy className="h-3 w-3" />
                   </Button>
                 </div>
               </div>
             );
           })}
        </div>
      </Card>
    </div>
  );
}
