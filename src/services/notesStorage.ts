export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const NOTES_STORAGE_KEY = 'devtools-notes';

export const notesStorage = {
  getAllNotes(): Note[] {
    try {
      const stored = localStorage.getItem(NOTES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading notes from localStorage:', error);
      return [];
    }
  },

  saveNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const notes = this.getAllNotes();
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    return newNote;
  },

  updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Note | null {
    const notes = this.getAllNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return null;

    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    return notes[index];
  },

  deleteNote(id: string): boolean {
    const notes = this.getAllNotes();
    const filtered = notes.filter(n => n.id !== id);
    if (filtered.length === notes.length) return false;
    
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  getNote(id: string): Note | null {
    const notes = this.getAllNotes();
    return notes.find(n => n.id === id) || null;
  },
};
