export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const SNIPPETS_STORAGE_KEY = 'devtools-snippets';

export const snippetsStorage = {
  getAllSnippets(): CodeSnippet[] {
    try {
      const stored = localStorage.getItem(SNIPPETS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading snippets from localStorage:', error);
      return [];
    }
  },

  saveSnippet(snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>): CodeSnippet {
    const snippets = this.getAllSnippets();
    const newSnippet: CodeSnippet = {
      ...snippet,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    snippets.unshift(newSnippet);
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(snippets));
    return newSnippet;
  },

  updateSnippet(id: string, updates: Partial<Omit<CodeSnippet, 'id' | 'createdAt'>>): CodeSnippet | null {
    const snippets = this.getAllSnippets();
    const index = snippets.findIndex(s => s.id === id);
    if (index === -1) return null;

    snippets[index] = {
      ...snippets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(snippets));
    return snippets[index];
  },

  deleteSnippet(id: string): boolean {
    const snippets = this.getAllSnippets();
    const filtered = snippets.filter(s => s.id !== id);
    if (filtered.length === snippets.length) return false;
    
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  getSnippet(id: string): CodeSnippet | null {
    const snippets = this.getAllSnippets();
    return snippets.find(s => s.id === id) || null;
  },

  searchSnippets(query: string): CodeSnippet[] {
    const snippets = this.getAllSnippets();
    const lowerQuery = query.toLowerCase();
    return snippets.filter(s => 
      s.title.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery) ||
      s.code.toLowerCase().includes(lowerQuery) ||
      s.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  filterByLanguage(language: string): CodeSnippet[] {
    const snippets = this.getAllSnippets();
    return snippets.filter(s => s.language === language);
  },

  filterByTag(tag: string): CodeSnippet[] {
    const snippets = this.getAllSnippets();
    return snippets.filter(s => s.tags.includes(tag));
  },
};
