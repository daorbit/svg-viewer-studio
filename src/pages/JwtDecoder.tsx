import { useState, useMemo } from "react";
import { Copy, Check, AlertTriangle, Clock, Shield } from "lucide-react";
import { toast } from "sonner";

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTE2MjM5MDIyfQ.4S2sL1rN-AHtBHvXGvZq8eoLqjFOaKkeP4eFo3_-0TE";

function base64UrlDecode(str: string) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

const JwtDecoder = () => {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [copied, setCopied] = useState<string | null>(null);

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) return { error: "Invalid JWT format. Expected 3 parts separated by dots." };

      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));

      let expiry: { expired: boolean; date: string; relative: string } | null = null;
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        const diff = expDate.getTime() - now.getTime();
        const days = Math.abs(Math.floor(diff / 86400000));
        const hours = Math.abs(Math.floor((diff % 86400000) / 3600000));
        expiry = {
          expired: diff < 0,
          date: expDate.toLocaleString(),
          relative: diff < 0 ? `Expired ${days}d ${hours}h ago` : `Expires in ${days}d ${hours}h`,
        };
      }

      let issuedAt: string | null = null;
      if (payload.iat) {
        issuedAt = new Date(payload.iat * 1000).toLocaleString();
      }

      return { header, payload, signature: parts[2], expiry, issuedAt, error: null };
    } catch (e: any) {
      return { error: `Failed to decode: ${e.message}` };
    }
  }, [token]);

  const copyJson = (label: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 1500);
  };

  const renderJson = (data: any) => {
    return Object.entries(data).map(([key, value]) => (
      <div key={key} className="flex gap-2 py-1">
        <span className="text-primary font-medium">"{key}":</span>
        <span className={typeof value === "string" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
          {typeof value === "string" ? `"${value}"` : JSON.stringify(value)}
        </span>
      </div>
    ));
  };

  return (
    <div className="min-h-full bg-background p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">JWT Decoder</h1>
      <p className="text-sm text-muted-foreground mb-6">Decode and inspect JSON Web Tokens</p>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paste JWT Token</label>
          <button
            onClick={() => setToken(SAMPLE_JWT)}
            className="text-xs text-primary hover:underline"
          >
            Load sample
          </button>
        </div>
        <textarea
          value={token}
          onChange={e => setToken(e.target.value)}
          rows={4}
          className="w-full bg-card border border-border rounded-xl p-4 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none break-all"
          placeholder="eyJhbGciOiJIUzI1NiIs..."
        />
      </div>

      {decoded?.error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {decoded.error}
        </div>
      )}

      {decoded && !decoded.error && (
        <div className="space-y-4">
          {/* Expiry banner */}
          {decoded.expiry && (
            <div className={`p-3 rounded-xl flex items-center gap-3 text-sm ${
              decoded.expiry.expired
                ? "bg-destructive/10 text-destructive"
                : "bg-green-500/10 text-green-700 dark:text-green-400"
            }`}>
              <Clock className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-semibold">{decoded.expiry.relative}</span>
                <span className="text-muted-foreground ml-2">({decoded.expiry.date})</span>
              </div>
            </div>
          )}

          {decoded.issuedAt && (
            <div className="p-3 rounded-xl bg-muted/50 flex items-center gap-3 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 shrink-0" />
              Issued at: {decoded.issuedAt}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Header */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Header</span>
                <button onClick={() => copyJson("Header", decoded.header)} className="p-1 hover:bg-accent rounded">
                  {copied === "Header" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>
              <div className="p-4 font-mono text-sm">{renderJson(decoded.header)}</div>
            </div>

            {/* Payload */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <span className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Payload</span>
                <button onClick={() => copyJson("Payload", decoded.payload)} className="p-1 hover:bg-accent rounded">
                  {copied === "Payload" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>
              <div className="p-4 font-mono text-sm">{renderJson(decoded.payload)}</div>
            </div>
          </div>

          {/* Signature */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-semibold text-cyan-500 uppercase tracking-wider">Signature</span>
            </div>
            <div className="p-4 font-mono text-xs text-muted-foreground break-all">{decoded.signature}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JwtDecoder;
