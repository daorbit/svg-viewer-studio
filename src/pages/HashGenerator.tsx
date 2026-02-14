import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Copy, Check, Trash2, Hash } from 'lucide-react';

const HashGenerator = () => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<{ algo: string; hash: string }[]>([]);
  const [copied, setCopied] = useState('');
  const { toast } = useToast();

  const generateHashes = async () => {
    if (!input) return;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const algos: { name: string; algo: string }[] = [
      { name: 'SHA-1', algo: 'SHA-1' },
      { name: 'SHA-256', algo: 'SHA-256' },
      { name: 'SHA-384', algo: 'SHA-384' },
      { name: 'SHA-512', algo: 'SHA-512' },
    ];

    const results = await Promise.all(
      algos.map(async ({ name, algo }) => {
        const hashBuffer = await crypto.subtle.digest(algo, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return { algo: name, hash: hashHex };
      })
    );

    setHashes(results);
    toast({ title: 'Hashes generated!' });
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          Hash Generator
        </h1>
        <p className="text-muted-foreground">Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Input Text</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => { setInput(''); setHashes([]); }}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            className="w-full h-32 p-3 rounded-lg bg-muted/50 border border-border text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button onClick={generateHashes} className="w-full">
            <Hash className="w-4 h-4 mr-2" /> Generate Hashes
          </Button>
        </CardContent>
      </Card>

      {hashes.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hashes.map(({ algo, hash }) => (
              <div key={algo} className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-muted-foreground">{algo}</span>
                  <Button variant="ghost" size="sm" onClick={() => copy(hash)}>
                    {copied === hash ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
                <p className="font-mono text-xs text-foreground break-all leading-relaxed">{hash}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HashGenerator;
