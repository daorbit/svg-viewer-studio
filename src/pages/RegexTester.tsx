import { useState, useMemo } from "react";
import { Copy, Check, Flag } from "lucide-react";
import { toast } from "sonner";

const PRESET_PATTERNS = [
  { label: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { label: "URL", pattern: "https?:\\/\\/[^\\s]+", flags: "g" },
  { label: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
  { label: "Phone", pattern: "\\+?\\d{1,4}[\\s-]?\\(?\\d{1,4}\\)?[\\s-]?\\d{1,4}[\\s-]?\\d{1,9}", flags: "g" },
  { label: "Hex Color", pattern: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b", flags: "g" },
  { label: "Date (YYYY-MM-DD)", pattern: "\\d{4}-\\d{2}-\\d{2}", flags: "g" },
];

const RegexTester = () => {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("Hello world! My email is dev@example.com and my website is https://example.com.\nAnother email: test.user@domain.org");
  const [copied, setCopied] = useState(false);

  const flagOptions = [
    { flag: "g", label: "Global" },
    { flag: "i", label: "Case Insensitive" },
    { flag: "m", label: "Multiline" },
    { flag: "s", label: "Dot All" },
  ];

  const toggleFlag = (f: string) => {
    setFlags(prev => prev.includes(f) ? prev.replace(f, "") : prev + f);
  };

  const { matches, highlightedHtml, error } = useMemo(() => {
    if (!pattern) return { matches: [], highlightedHtml: "", error: null };
    try {
      const regex = new RegExp(pattern, flags);
      const allMatches: { match: string; index: number; groups?: Record<string, string> }[] = [];
      let m;
      const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      while ((m = re.exec(testString)) !== null) {
        allMatches.push({ match: m[0], index: m.index, groups: m.groups });
        if (!flags.includes("g")) break;
      }

      // Build highlighted HTML
      let html = "";
      let lastIndex = 0;
      const colors = ["bg-primary/20 text-primary", "bg-green-500/20 text-green-700 dark:text-green-400", "bg-amber-500/20 text-amber-700 dark:text-amber-400", "bg-pink-500/20 text-pink-700 dark:text-pink-400"];
      allMatches.forEach((match, i) => {
        const before = testString.slice(lastIndex, match.index);
        html += escapeHtml(before);
        html += `<mark class="${colors[i % colors.length]} px-0.5 rounded font-medium">${escapeHtml(match.match)}</mark>`;
        lastIndex = match.index + match.match.length;
      });
      html += escapeHtml(testString.slice(lastIndex));

      return { matches: allMatches, highlightedHtml: html, error: null };
    } catch (e: any) {
      return { matches: [], highlightedHtml: "", error: e.message };
    }
  }, [pattern, flags, testString]);

  function escapeHtml(str: string) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
  }

  const copyPattern = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    toast.success("Pattern copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-full bg-background p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Regex Tester</h1>
      <p className="text-sm text-muted-foreground mb-6">Test regular expressions with live matching and highlighting</p>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESET_PATTERNS.map(p => (
          <button
            key={p.label}
            onClick={() => { setPattern(p.pattern); setFlags(p.flags); }}
            className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent text-foreground transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Pattern input */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-muted-foreground text-lg font-mono">/</span>
        <input
          value={pattern}
          onChange={e => setPattern(e.target.value)}
          placeholder="Enter regex pattern..."
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <span className="text-muted-foreground text-lg font-mono">/</span>
        <span className="text-sm font-mono text-primary min-w-[2rem]">{flags}</span>
        <button onClick={copyPattern} className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Flags */}
      <div className="flex items-center gap-2 mb-6">
        <Flag className="w-3.5 h-3.5 text-muted-foreground" />
        {flagOptions.map(f => (
          <button
            key={f.flag}
            onClick={() => toggleFlag(f.flag)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
              flags.includes(f.flag)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            {f.flag} — {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-mono">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Test string */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Test String</label>
          <textarea
            value={testString}
            onChange={e => setTestString(e.target.value)}
            rows={10}
            className="w-full bg-card border border-border rounded-xl p-4 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="Enter text to test against..."
          />
        </div>

        {/* Results */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Highlighted Matches ({matches.length} found)
          </label>
          <div
            className="w-full bg-card border border-border rounded-xl p-4 text-sm font-mono text-foreground min-h-[15rem] max-h-[20rem] overflow-auto whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: highlightedHtml || '<span class="text-muted-foreground">No matches</span>' }}
          />
        </div>
      </div>

      {/* Match details */}
      {matches.length > 0 && (
        <div className="mt-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Match Details</label>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">#</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Match</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Index</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Length</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2 font-mono text-primary">{m.match}</td>
                    <td className="px-4 py-2 text-muted-foreground">{m.index}</td>
                    <td className="px-4 py-2 text-muted-foreground">{m.match.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegexTester;
