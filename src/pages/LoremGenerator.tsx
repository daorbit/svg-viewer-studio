import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlignLeft, Copy, Check, RefreshCw } from 'lucide-react';

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const WORDS = LOREM.replace(/[.,]/g, '').split(/\s+/);

const generateParagraph = () => {
  const len = 40 + Math.floor(Math.random() * 40);
  const words: string[] = [];
  for (let i = 0; i < len; i++) {
    words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
};

const LoremGenerator = () => {
  const [count, setCount] = useState(3);
  const [type, setType] = useState<'paragraphs' | 'words' | 'sentences'>('paragraphs');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generate = () => {
    if (type === 'paragraphs') {
      setOutput(Array.from({ length: count }, generateParagraph).join('\n\n'));
    } else if (type === 'words') {
      const words: string[] = [];
      for (let i = 0; i < count; i++) {
        words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
      }
      setOutput(words.join(' '));
    } else {
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) {
        const len = 8 + Math.floor(Math.random() * 12);
        const words: string[] = [];
        for (let j = 0; j < len; j++) {
          words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
        }
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        sentences.push(words.join(' ') + '.');
      }
      setOutput(sentences.join(' '));
    }
    toast({ title: 'Lorem ipsum generated!' });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <AlignLeft className="w-5 h-5" />
          </div>
          Lorem Ipsum Generator
        </h1>
        <p className="text-muted-foreground">Generate placeholder text for your designs</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-3 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Count</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-24"
              />
            </div>
            <div className="flex gap-1">
              {(['paragraphs', 'words', 'sentences'] as const).map((t) => (
                <Button
                  key={t}
                  variant={type === t ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setType(t)}
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
            <div className="flex-1" />
            <Button onClick={generate}>
              <RefreshCw className="w-4 h-4 mr-1" /> Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {output && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Output</CardTitle>
              <Button variant="ghost" size="sm" onClick={copy}>
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LoremGenerator;
