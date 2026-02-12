import { useState, useEffect, useCallback } from 'react';
import { Input, message } from 'antd';
import { Save, Plus, FileText, Download, Loader2 } from 'lucide-react';
import NotesEditor from '@/components/NotesEditor';
import NotesList from '@/components/NotesList';
import { notesStorage, Note } from '@/services/notesStorage';
import html2pdf from 'html2pdf.js';
import { useIsMobile } from '@/hooks/use-mobile';

const DRAFT_STORAGE_KEY = 'notes-draft-content';
const DRAFT_TITLE_KEY = 'notes-draft-title';

const Notes = () => {
  const isMobile = useIsMobile();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showList, setShowList] = useState(false);

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

  useEffect(() => {
    const loadedNotes = notesStorage.getAllNotes();
    setNotes(loadedNotes);
    const draft = loadDraft();
    setTitle(draft.title);
    setContent(draft.content);
    setSelectedNote(null);
  }, [loadDraft]);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      message.error('Please enter a title for your note');
      return;
    }
    setIsSaving(true);
    if (selectedNote) {
      const updated = notesStorage.updateNote(selectedNote.id, { title, content });
      if (updated) {
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
        setSelectedNote(updated);
        clearDraft();
      }
    } else {
      const newNote = notesStorage.saveNote({ title, content });
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      clearDraft();
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
    const tempElement = document.createElement('div');
    tempElement.innerHTML = noteToDownload.content;
    tempElement.style.padding = '20px';
    tempElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    tempElement.style.lineHeight = '1.6';
    tempElement.style.color = '#000000';
    tempElement.style.backgroundColor = '#ffffff';
    const options = {
      margin: 0.5,
      filename: `${noteToDownload.title.trim() || 'Untitled Note'}.pdf`,
      image: { type: 'jpeg' as const, quality: 1.0 },
      html2canvas: { scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const, compress: true }
    };
    html2pdf().set(options).from(tempElement).save().then(() => {
      setIsDownloadingPdf(false);
      message.success('PDF downloaded successfully!');
    }).catch((error: unknown) => {
      setIsDownloadingPdf(false);
      console.error('PDF generation error:', error);
      message.error('Failed to generate PDF. Please try again.');
    });
  }, [title, content]);

  const handleNewNote = () => {
    if (title || content) saveDraft(title, content);
    setSelectedNote(null);
    setTitle('');
    setContent('');
    if (isMobile) setShowList(false);
  };

  const handleSelectNote = (note: Note) => {
    if (!selectedNote && (title || content)) saveDraft(title, content);
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    if (isMobile) setShowList(false);
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
        const draft = loadDraft();
        setSelectedNote(null);
        setTitle(draft.title);
        setContent(draft.content);
      }
    }
  };

  useEffect(() => {
    if (!selectedNote && (title || content)) {
      const timeoutId = setTimeout(() => saveDraft(title, content), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [title, content, selectedNote, saveDraft]);

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
        <div className="px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-semibold text-base md:text-lg tracking-tight text-foreground">
              Notes Manager
            </span>
            {!selectedNote && (title || content) && (
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full font-medium">
                Draft
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setShowList(!showList)}
                className="h-9 px-3 rounded-md text-sm font-medium flex items-center gap-1.5 text-foreground border border-border hover:bg-accent transition-colors"
              >
                {showList ? 'Editor' : `Notes (${notes.length})`}
              </button>
            )}
            <button
              onClick={handleNewNote}
              className="h-9 px-3 rounded-md text-sm font-medium flex items-center gap-1.5 text-foreground border border-border hover:bg-accent transition-colors"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 px-3 rounded-md text-sm font-medium flex items-center gap-1.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor - hide on mobile when list is shown */}
        {(!isMobile || !showList) && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 md:px-6 pt-4 pb-2 border-b border-border bg-card">
              <Input
                placeholder={selectedNote ? "Note title..." : "Draft title..."}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="large"
                variant="borderless"
                style={{ fontSize: 22, fontWeight: 600, padding: '4px 0' }}
              />
            </div>
            <NotesEditor
              content={content}
              onChange={setContent}
              placeholder={selectedNote ? "Start writing your note..." : "Start writing your draft..."}
            />
          </div>
        )}

        {/* Notes list - show on desktop always, on mobile only when toggled */}
        {(!isMobile || showList) && (
          <NotesList
            notes={notes}
            selectedId={selectedNote?.id || null}
            onSelect={handleSelectNote}
            onDelete={handleDeleteNote}
            onDownloadPdf={handleDownloadPdf}
          />
        )}
      </div>
    </div>
  );
};

export default Notes;
