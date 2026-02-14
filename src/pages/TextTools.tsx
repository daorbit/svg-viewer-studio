import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Type, Copy, Check, Trash2 } from 'lucide-react';

const TextTools = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const stats = {
    chars: input.length,
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    lines: input ? input.split('\n').length : 0,
    sentences: input.trim() ? input.split(/[.!?]+/).filter(Boolean).length : 0,
  };

  const transform = (fn: (s: string) => string, label: string) => {
    setOutput(fn(input));
    toast({ title: `Converted to ${label}` });
  };

  const toTitleCase = (s: string) => s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
  const toCamelCase = (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
  const toSnakeCase = (s: string) => s.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const toKebabCase = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  const reverseText = (s: string) => s.split('').reverse().join('');
  const removeExtraSpaces = (s: string) => s.replace(/\s+/g, ' ').trim();

  const copy = async () => {
    await navigator.clipboard.writeText(output || input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
          Text Tools
        </h1>
        <p className="text-muted-foreground">Transform, analyze, and convert text</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Input + Output */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Input</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { setInput(''); setOutput(''); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or paste text here..."
                className="w-full h-44 p-3 rounded-lg bg-muted/50 border border-border text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => transform(s => s.toUpperCase(), 'UPPERCASE')}>UPPER</Button>
            <Button size="sm" onClick={() => transform(s => s.toLowerCase(), 'lowercase')}>lower</Button>
            <Button size="sm" onClick={() => transform(toTitleCase, 'Title Case')}>Title</Button>
            <Button size="sm" variant="secondary" onClick={() => transform(toCamelCase, 'camelCase')}>camel</Button>
            <Button size="sm" variant="secondary" onClick={() => transform(toSnakeCase, 'snake_case')}>snake</Button>
            <Button size="sm" variant="secondary" onClick={() => transform(toKebabCase, 'kebab-case')}>kebab</Button>
            <Button size="sm" variant="outline" onClick={() => transform(reverseText, 'Reversed')}>Reverse</Button>
            <Button size="sm" variant="outline" onClick={() => transform(removeExtraSpaces, 'Trimmed')}>Trim</Button>
          </div>

          {output && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Output</CardTitle>
                  <Button variant="ghost" size="sm" onClick={copy}>
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  value={output}
                  readOnly
                  className="w-full h-32 p-3 rounded-lg bg-muted/50 border border-border text-sm resize-none focus:outline-none font-mono"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats panel */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Text Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground capitalize">{label}</span>
                  <span className="text-lg font-bold text-foreground tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TextTools;
