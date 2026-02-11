import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Input, Select, message } from 'antd';
import { ArrowLeft, Code2, Plus, Save, Trash2, Copy, Search } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { snippetsStorage, CodeSnippet } from '@/services/snippetsStorage';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css',
  'sql', 'bash', 'json', 'yaml', 'markdown', 'text'
];

const CodeSnippets = () => {
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [search, setSearch] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  useEffect(() => {
    const loaded = snippetsStorage.getAllSnippets();
    setSnippets(loaded);
    if (loaded.length > 0) {
      handleSelectSnippet(loaded[0]);
    }
  }, []);

  const handleSelectSnippet = (snippet: CodeSnippet) => {
    setSelectedSnippet(snippet);
    setTitle(snippet.title);
    setCode(snippet.code);
    setLanguage(snippet.language);
  };

  const handleNewSnippet = () => {
    setSelectedSnippet(null);
    setTitle('');
    setCode('');
    setLanguage('javascript');
  };

  const handleSave = () => {
    if (!title.trim()) {
      message.error('Please enter a title');
      return;
    }
    if (!code.trim()) {
      message.error('Please enter code');
      return;
    }

    if (selectedSnippet) {
      const updated = snippetsStorage.updateSnippet(selectedSnippet.id, {
        title, code, language, description: '', tags: []
      });
      if (updated) {
        setSnippets(prev => prev.map(s => s.id === updated.id ? updated : s));
        setSelectedSnippet(updated);
        message.success('Snippet updated!');
      }
    } else {
      const newSnippet = snippetsStorage.saveSnippet({
        title, code, language, description: '', tags: []
      });
      setSnippets(prev => [newSnippet, ...prev]);
      setSelectedSnippet(newSnippet);
      message.success('Snippet saved!');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this snippet?')) {
      snippetsStorage.deleteSnippet(id);
      setSnippets(prev => prev.filter(s => s.id !== id));
      
      if (selectedSnippet?.id === id) {
        const remaining = snippets.filter(s => s.id !== id);
        if (remaining.length > 0) {
          handleSelectSnippet(remaining[0]);
        } else {
          handleNewSnippet();
        }
      }
      message.success('Snippet deleted!');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    message.success('Code copied to clipboard!');
  };

  const filtered = snippets.filter(s => {
    const matchesSearch = search === '' || 
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    
    const matchesLanguage = filterLanguage === 'all' || s.language === filterLanguage;
    
    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tooltip title="Back to Home">
              <button
                onClick={() => navigate('/')}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Tooltip>
            <div className="w-px h-5 bg-border" />
            <Code2 className="w-4 h-4 text-primary" />
            <span className="font-semibold text-base tracking-tight text-foreground">
              Code Snippet Manager
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewSnippet}
              className="h-8 px-3 rounded-md text-sm font-medium flex items-center gap-1.5 text-foreground border border-border hover:bg-accent transition-colors"
            >
              <Plus className="w-4 h-4" /> New Snippet
            </button>
            <button
              onClick={handleSave}
              className="h-8 px-3 rounded-md text-sm font-medium flex items-center gap-1.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'hsl(var(--editor-bg))' }}>
          {/* Top bar - dark */}
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: 'hsl(228, 15%, 17%)', borderColor: 'hsl(228, 12%, 22%)' }}>
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1">
                <Input
                  placeholder="Snippet title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  size="large"
                  style={{
                    background: 'hsl(228, 15%, 20%)',
                    border: '1px solid hsl(228, 12%, 25%)',
                    color: '#d4d4d4',
                    fontSize: 14,
                  }}
                />
              </div>
              <Select
                value={language}
                onChange={setLanguage}
                size="large"
                style={{ width: 180 }}
                showSearch
              >
                {LANGUAGES.map(lang => (
                  <Select.Option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </Select.Option>
                ))}
              </Select>
              <button
                onClick={handleCopy}
                className="h-10 px-4 rounded-md text-sm flex items-center gap-2 hover:bg-white/10 transition-colors"
                style={{ color: '#d4d4d4' }}
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'SF Mono', 'Fira Code', Menlo, Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </div>

        {/* Right: Snippets list */}
        <div className="w-[320px] min-w-[320px] h-full flex flex-col bg-card border-l border-border">
          <div className="px-3 py-2.5 border-b border-border space-y-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm tracking-tight text-foreground">
                My Snippets
              </span>
            </div>
            <Input
              placeholder="Search snippets..."
              prefix={<Search className="w-3 h-3 text-muted-foreground" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              size="small"
            />
            <Select
              value={filterLanguage}
              onChange={setFilterLanguage}
              size="small"
              style={{ width: '100%' }}
            >
              <Select.Option value="all">All Languages</Select.Option>
              {LANGUAGES.map(lang => (
                <Select.Option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="px-4 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'Snippet' : 'Snippets'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <Code2 className="w-5 h-5 text-muted-foreground opacity-40 mx-auto" />
                <p className="text-xs mt-2 text-muted-foreground">
                  {search ? 'No snippets found' : 'No snippets yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((snippet) => {
                  const isSelected = selectedSnippet?.id === snippet.id;
                  
                  return (
                    <div
                      key={snippet.id}
                      className={`group relative rounded-lg p-3 cursor-pointer transition-all border ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-accent'
                      }`}
                      onClick={() => handleSelectSnippet(snippet)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-sm leading-tight line-clamp-1 text-foreground">
                          {snippet.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(snippet.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          {snippet.language}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {snippet.code.split('\n').length} lines
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippets;
