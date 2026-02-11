import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Input } from 'antd';
import { Save, Plus, ArrowLeft, FileText } from 'lucide-react';
import NotesEditor from '@/components/NotesEditor';
import NotesList from '@/components/NotesList';
import { notesStorage, Note } from '@/services/notesStorage';

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load notes on mount
  useEffect(() => {
    const loadedNotes = notesStorage.getAllNotes();
    setNotes(loadedNotes);
    if (loadedNotes.length > 0) {
      setSelectedNote(loadedNotes[0]);
      setTitle(loadedNotes[0].title);
      setContent(loadedNotes[0].content);
    }
  }, []);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    
    if (selectedNote) {
      // Update existing note
      const updated = notesStorage.updateNote(selectedNote.id, { title, content });
      if (updated) {
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
        setSelectedNote(updated);
      }
    } else {
      // Create new note
      const newNote = notesStorage.saveNote({ title, content });
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
    }
    
    setTimeout(() => setIsSaving(false), 500);
  }, [selectedNote, title, content]);

  const handleNewNote = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleDeleteNote = (id: string) => {
    notesStorage.deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
    
    if (selectedNote?.id === id) {
      const remaining = notes.filter(n => n.id !== id);
      if (remaining.length > 0) {
        setSelectedNote(remaining[0]);
        setTitle(remaining[0].title);
        setContent(remaining[0].content);
      } else {
        handleNewNote();
      }
    }
  };

  // Auto-save on content change
  useEffect(() => {
    if (!title && !content) return;
    
    const timeoutId = setTimeout(() => {
      if (selectedNote && (title !== selectedNote.title || content !== selectedNote.content)) {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [title, content, selectedNote, handleSave]);

  return (
    <div className="bg-background flex flex-col">
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
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-semibold text-base tracking-tight text-foreground">
              Notes Manager
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewNote}
              className="h-8 px-3 rounded-md text-sm font-medium flex items-center gap-1.5 text-foreground border border-border hover:bg-accent transition-colors"
            >
              <Plus className="w-4 h-4" /> New Note
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 px-3 rounded-md text-sm font-medium flex items-center gap-1.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Title input */}
          <div className="px-4 pt-4 pb-2 border-b border-border bg-card">
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="large"
              variant="borderless"
              style={{ 
                fontSize: 24, 
                fontWeight: 600,
                padding: '4px 0',
              }}
            />
          </div>

          {/* Editor */}
          <NotesEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your note..."
          />
        </div>

        {/* Right: Notes list */}
        <NotesList
          notes={notes}
          selectedId={selectedNote?.id || null}
          onSelect={handleSelectNote}
          onDelete={handleDeleteNote}
        />
      </div>
    </div>
  );
};

export default Notes;
