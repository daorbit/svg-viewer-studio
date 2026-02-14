import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Braces, Copy, Check, Minimize2, AlignLeft, Trash2 } from 'lucide-react';

const JsonFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
      toast({ title: 'JSON formatted successfully!' });
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
      toast({ title: 'JSON minified!' });
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(input);
      setError('');
      toast({ title: '✅ Valid JSON!' });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Braces className="w-5 h-5" />
          </div>
          JSON Formatter
        </h1>
        <p className="text-muted-foreground">Format, minify, and validate JSON data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Input</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setInput(''); setOutput(''); setError(''); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"key": "value"}'
              className="w-full h-80 p-3 rounded-lg bg-muted/50 border border-border font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {error && (
              <div className="mt-2 p-2 rounded-md bg-destructive/10 text-destructive text-xs font-mono">
                {error}
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <Button onClick={formatJson} size="sm" className="flex-1">
                <AlignLeft className="w-4 h-4 mr-1" /> Format
              </Button>
              <Button onClick={minifyJson} variant="secondary" size="sm" className="flex-1">
                <Minimize2 className="w-4 h-4 mr-1" /> Minify
              </Button>
              <Button onClick={validateJson} variant="outline" size="sm" className="flex-1">
                <Check className="w-4 h-4 mr-1" /> Validate
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Output</CardTitle>
              {output && (
                <Button variant="ghost" size="sm" onClick={copyOutput}>
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              value={output}
              readOnly
              placeholder="Formatted output will appear here..."
              className="w-full h-80 p-3 rounded-lg bg-muted/50 border border-border font-mono text-sm resize-none focus:outline-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JsonFormatter;
