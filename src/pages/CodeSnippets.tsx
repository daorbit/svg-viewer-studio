import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Input, Select, message, Tag } from 'antd';
import { ArrowLeft, Code2, Plus, Save, Trash2, Copy, Search, X } from 'lucide-react';
import { snippetsStorage, CodeSnippet } from '@/services/snippetsStorage';

const { TextArea } = Input;

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
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
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
    setDescription(snippet.description);
    setCode(snippet.code);
    setLanguage(snippet.language);
    setTags(snippet.tags);
  };

  const handleNewSnippet = () => {
    setSelectedSnippet(null);
    setTitle('');
    setDescription('');
    setCode('');
    setLanguage('javascript');
    setTags([]);
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
        title, description, code, language, tags
      });
      if (updated) {
        setSnippets(prev => prev.map(s => s.id === updated.id ? updated : s));
        setSelectedSnippet(updated);
        message.success('Snippet updated!');
      }
    } else {
      const newSnippet = snippetsStorage.saveSnippet({
        title, description, code, language, tags
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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const filtered = snippets.filter(s => {
    const matchesSearch = search === '' || 
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
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
        <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Snippet Title *</label>
              <Input
                placeholder="e.g., React useEffect Hook"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="large"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Language</label>
              <Select
                value={language}
                onChange={setLanguage}
                size="large"
                style={{ width: '100%' }}
                showSearch
              >
                {LANGUAGES.map(lang => (
                  <Select.Option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Input
              placeholder="Describe what this snippet does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map(tag => (
                <Tag key={tag} closable onClose={() => handleRemoveTag(tag)} color="blue">
                  {tag}
                </Tag>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onPressEnter={handleAddTag}
                size="small"
              />
              <button
                onClick={handleAddTag}
                className="h-8 px-3 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Code *</label>
              <button
                onClick={handleCopy}
                className="h-6 px-2 rounded text-xs flex items-center gap-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <TextArea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              style={{
                fontFamily: "'SF Mono', 'Fira Code', Menlo, Consolas, monospace",
                fontSize: 13,
                flex: 1,
                minHeight: 300,
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
                      <div className="flex items-start justify-between gap-2 mb-1">
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
                      
                      {snippet.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {snippet.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          {snippet.language}
                        </span>
                        {snippet.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {tag}
                          </span>
                        ))}
                        {snippet.tags.length > 2 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{snippet.tags.length - 2}
                          </span>
                        )}
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
