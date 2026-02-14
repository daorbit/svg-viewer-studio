import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Binary, Copy, Check, ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

const Base64Tools = () => {
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const encode = () => {
    try {
      setTextOutput(btoa(unescape(encodeURIComponent(textInput))));
      toast({ title: 'Encoded to Base64!' });
    } catch {
      toast({ title: 'Error encoding', variant: 'destructive' });
    }
  };

  const decode = () => {
    try {
      setTextOutput(decodeURIComponent(escape(atob(textInput))));
      toast({ title: 'Decoded from Base64!' });
    } catch {
      toast({ title: 'Invalid Base64 string', variant: 'destructive' });
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Binary className="w-5 h-5" />
          </div>
          Base64 Encoder / Decoder
        </h1>
        <p className="text-muted-foreground">Encode and decode text to/from Base64</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Input</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => { setTextInput(''); setTextOutput(''); }}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter text or Base64 string..."
            className="w-full h-40 p-3 rounded-lg bg-muted/50 border border-border font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-2">
            <Button onClick={encode} size="sm" className="flex-1">
              <ArrowDown className="w-4 h-4 mr-1" /> Encode
            </Button>
            <Button onClick={decode} variant="secondary" size="sm" className="flex-1">
              <ArrowUp className="w-4 h-4 mr-1" /> Decode
            </Button>
          </div>
        </CardContent>
      </Card>

      {textOutput && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Output</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => copy(textOutput)}>
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              value={textOutput}
              readOnly
              className="w-full h-40 p-3 rounded-lg bg-muted/50 border border-border font-mono text-sm resize-none focus:outline-none"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Base64Tools;
