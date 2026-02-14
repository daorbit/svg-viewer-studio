import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Copy, Check, Eye, Code2 } from 'lucide-react';

// Simple markdown to HTML converter (client-side, no deps)
const markdownToHtml = (md: string): string => {
  let html = md
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline" target="_blank">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-3 border-primary pl-3 italic text-muted-foreground my-2">$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-4 border-border" />')
    // Paragraphs (newlines)
    .replace(/\n\n/g, '</p><p class="my-2">')
    .replace(/\n/g, '<br />');

  return `<p class="my-2">${html}</p>`;
};

const sampleMd = `# Hello World

This is a **Markdown** preview tool. It supports *italic*, **bold**, and ***both***.

## Features

- Live preview as you type
- Code: \`console.log("hello")\`
- [Links](https://example.com)

> Blockquotes work too!

---

### Enjoy writing!`;

const MarkdownPreview = () => {
  const [markdown, setMarkdown] = useState(sampleMd);
  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Markdown copied!' });
  };

  const htmlOutput = markdownToHtml(markdown);

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          Markdown Preview
        </h1>
        <p className="text-muted-foreground">Write markdown and see a live preview side by side</p>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={!showPreview ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowPreview(false)}
        >
          <Code2 className="w-4 h-4 mr-1" /> Editor
        </Button>
        <Button
          variant={showPreview ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowPreview(true)}
        >
          <Eye className="w-4 h-4 mr-1" /> Split View
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={copy}>
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Markdown</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-[500px] p-3 rounded-lg bg-muted/50 border border-border font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </CardContent>
        </Card>

        {showPreview && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="h-[500px] overflow-y-auto p-4 rounded-lg bg-muted/30 border border-border prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MarkdownPreview;
