import { useState, useEffect, useCallback } from 'react';
import { Input, message } from 'antd';
import { Save, Plus, FileText, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotesEditor from '@/components/NotesEditor';
import NotesList from '@/components/NotesList';
import { notesStorage, Note } from '@/services/notesStorage';
import html2pdf from 'html2pdf.js';

const DRAFT_STORAGE_KEY = 'notes-draft-content';
const DRAFT_TITLE_KEY = 'notes-draft-title';

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Draft management functions
  const saveDraft = useCallback((draftTitle: string, draftContent: string) => {
    try {
      localStorage.setItem(DRAFT_TITLE_KEY, draftTitle);
      localStorage.setItem(DRAFT_STORAGE_KEY, draftContent);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, []);

  const loadDraft = useCallback(() => {
    try {
      const draftTitle = localStorage.getItem(DRAFT_TITLE_KEY) || '';
      const draftContent = localStorage.getItem(DRAFT_STORAGE_KEY) || '';
      return { title: draftTitle, content: draftContent };
    } catch (error) {
      console.error('Error loading draft:', error);
      return { title: '', content: '' };
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_TITLE_KEY);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, []);

  // Load notes and drafts on mount
  useEffect(() => {
    const loadedNotes = notesStorage.getAllNotes();
    setNotes(loadedNotes);
    
    // Always load draft content by default, don't auto-select notes
    const draft = loadDraft();
    setTitle(draft.title);
    setContent(draft.content);
    setSelectedNote(null); // Don't auto-select any note
  }, [loadDraft]);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      message.error('Please enter a title for your note');
      return;
    }
    
    setIsSaving(true);
    
    if (selectedNote) {
      // Update existing note
      const updated = notesStorage.updateNote(selectedNote.id, { title, content });
      if (updated) {
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
        setSelectedNote(updated);
        clearDraft(); // Clear draft when saving existing note
      }
    } else {
      // Create new note
      const newNote = notesStorage.saveNote({ title, content });
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      clearDraft(); // Clear draft when creating new note
    }
    
    setTimeout(() => setIsSaving(false), 500);
  }, [selectedNote, title, content, clearDraft]);

  const handleDownloadPdf = useCallback((note?: Note) => {
    const noteToDownload = note || { title, content };
    
    if (!noteToDownload.content.trim()) {
      message.error('Please add some content to download');
      return;
    }

    setIsDownloadingPdf(true);

    // Create a properly styled HTML element for PDF generation
    const tempElement = document.createElement('div');
    tempElement.innerHTML = noteToDownload.content;
    tempElement.style.padding = '20px';
    tempElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    tempElement.style.lineHeight = '1.6';
    tempElement.style.color = '#000000';
    tempElement.style.backgroundColor = '#ffffff';
    
    // Add comprehensive CSS styles to match the editor appearance
    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; }
      h1, h2, h3, h4, h5, h6 { 
        font-weight: 600; 
        line-height: 1.2; 
        margin: 1.5em 0 0.5em 0; 
        color: #000000;
      }
      h1 { font-size: 2.25em; margin-top: 0; }
      h2 { font-size: 1.875em; }
      h3 { font-size: 1.5em; }
      h4 { font-size: 1.25em; }
      h5 { font-size: 1.125em; }
      h6 { font-size: 1em; }
      p { margin: 1em 0; color: #374151; }
      ul, ol { margin: 1em 0; padding-left: 1.5em; }
      li { margin: 0.5em 0; color: #374151; }
      blockquote { 
        margin: 1em 0; 
        padding: 0.5em 1em; 
        border-left: 4px solid #e5e7eb; 
        background: #f9fafb;
        font-style: italic;
        color: #6b7280;
      }
      code { 
        background: #f3f4f6; 
        padding: 0.125em 0.25em; 
        border-radius: 0.25rem; 
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 0.875em;
        color: #dc2626;
      }
      pre { 
        background: #f3f4f6; 
        padding: 1em; 
        border-radius: 0.375rem; 
        overflow-x: auto;
        margin: 1em 0;
        border: 1px solid #e5e7eb;
      }
      pre code { background: none; padding: 0; color: #374151; }
      table { 
        border-collapse: collapse; 
        width: 100%; 
        margin: 1em 0;
        border: 1px solid #e5e7eb;
      }
      th, td { 
        border: 1px solid #e5e7eb; 
        padding: 0.5em 0.75em; 
        text-align: left;
        vertical-align: top;
      }
      th { 
        background: #f9fafb; 
        font-weight: 600;
        color: #111827;
      }
      img { 
        max-width: 100%; 
        height: auto; 
        border-radius: 0.375rem;
        margin: 1em 0;
      }
      a { 
        color: #2563eb; 
        text-decoration: underline;
      }
      a:hover { color: #1d4ed8; }
      strong, b { font-weight: 600; color: #111827; }
      em, i { font-style: italic; color: #374151; }
      u { text-decoration: underline; }
      s, strike { text-decoration: line-through; color: #6b7280; }
      mark { background: #fef3c7; color: #92400e; }
      sub { vertical-align: sub; font-size: 0.75em; }
      sup { vertical-align: super; font-size: 0.75em; }
      hr { 
        border: none; 
        border-top: 1px solid #e5e7eb; 
        margin: 2em 0;
      }
      .task-list-item { 
        list-style: none;
        margin: 0.5em 0;
      }
      .task-list-item input[type="checkbox"] {
        margin-right: 0.5em;
      }
    `;
    tempElement.appendChild(style);
    
    // Configure high-quality PDF options
    const options = {
      margin: 0.5,
      filename: `${noteToDownload.title.trim() || 'Untitled Note'}.pdf`,
      image: { type: 'jpeg' as const, quality: 1.0 },
      html2canvas: { 
        scale: 3, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'in' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const,
        compress: true
      }
    };

    // Generate and download PDF
    html2pdf().set(options).from(tempElement).save().then(() => {
      setIsDownloadingPdf(false);
      message.success('PDF downloaded successfully!');
    }).catch((error) => {
      setIsDownloadingPdf(false);
      console.error('PDF generation error:', error);
      message.error('Failed to generate PDF. Please try again.');
    });
  }, [title, content]);

  const handleNewNote = () => {
    // Save current content as draft before clearing
    if (title || content) {
      saveDraft(title, content);
    }
    
    setSelectedNote(null);
    setTitle('');
    setContent('');
  };

  const handleSelectNote = (note: Note) => {
    // Save current draft before switching to selected note
    if (!selectedNote && (title || content)) {
      saveDraft(title, content);
    }
    
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
        // Load draft when no notes remain
        const draft = loadDraft();
        setSelectedNote(null);
        setTitle(draft.title);
        setContent(draft.content);
      }
    }
  };

  // Auto-save drafts
  useEffect(() => {
    // Only save drafts when not working with a selected note
    if (!selectedNote && (title || content)) {
      const timeoutId = setTimeout(() => {
        saveDraft(title, content);
      }, 500); // Save draft after 500ms of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [title, content, selectedNote, saveDraft]);

  // Auto-save on content change (for existing notes)
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
    <div className="h-full bg-background flex flex-col">
      {/* Action Bar */}
      <div className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-semibold text-base tracking-tight text-foreground">
              Notes Manager
            </span>
            {!selectedNote && (title || content) && (
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">
                Draft
              </span>
            )}
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
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Title input */}
          <div className="px-4 pt-4 pb-2 border-b border-border bg-card">
            <Input
              placeholder={selectedNote ? "Note title..." : "Draft title..."}
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
            placeholder={selectedNote ? "Start writing your note..." : "Start writing your draft..."}
          />
        </div>

        {/* Right: Notes list */}
        <NotesList
          notes={notes}
          selectedId={selectedNote?.id || null}
          onSelect={handleSelectNote}
          onDelete={handleDeleteNote}
          onDownloadPdf={handleDownloadPdf}
        />
      </div>
    </div>
  );
};

export default Notes;
