import { useState, useEffect, useCallback } from 'react';
import { Input, message } from 'antd';
import { Save, Plus, FileText, Download, Loader2, RefreshCw, AlertTriangle, LogIn, X } from 'lucide-react';
import NotesEditor from '@/components/NotesEditor';
import NotesList from '@/components/NotesList';
import { notesStorage, Note } from '@/services/notesStorage';
import { apiService } from '@/services/api';
import html2pdf from 'html2pdf.js';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DRAFT_STORAGE_KEY = 'notes-draft-content';
const DRAFT_TITLE_KEY = 'notes-draft-title';

interface DatabaseNote {
  _id: string;
  title: string;
  content: string;
  user: string;
  isDraft: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalNotes: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const Notes = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [dbNotes, setDbNotes] = useState<DatabaseNote[]>([]);
  const [dbPagination, setDbPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedDbNote, setSelectedDbNote] = useState<DatabaseNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showList, setShowList] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  // Load notes from both local storage and database
  const loadNotes = useCallback(async (page: number = 1) => {
    setIsLoadingNotes(true);
    setIsSyncing(true);
    try {
      // Load local notes
      const localNotes = notesStorage.getAllNotes();
      setNotes(localNotes);

      // Load database notes if user is authenticated
      if (user) {
        const response = await apiService.getNotes(page, 10);
        setDbNotes(response.notes);
        setDbPagination(response?.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      message.error('Failed to load notes');
    } finally {
      setIsLoadingNotes(false);
      setIsSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotes(currentPage);
    const draft = loadDraft();
    setTitle(draft.title);
    setContent(draft.content);
    setSelectedNote(null);
    setSelectedDbNote(null);
  }, [loadNotes, loadDraft, currentPage]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      message.error('Please enter a title for your note');
      return;
    }

    setIsSaving(true);
    setIsSyncing(true);
    try {
      if (selectedDbNote) {
        // Update existing database note
        const updated = await apiService.updateNote(selectedDbNote._id, {
          title,
          content,
          isDraft: false,
        });
        setDbNotes(prev => prev.map(n => n._id === updated._id ? updated : n));
        setSelectedDbNote(updated);
        message.success('Note saved to database!');
        // Reload notes to update pagination
        loadNotes(currentPage);
      } else if (user) {
        // Create new database note
        const newNote = await apiService.createNote({
          title,
          content,
          isDraft: false,
        });
        setDbNotes(prev => [newNote, ...prev]);
        setSelectedDbNote(newNote);
        message.success('Note saved to database!');
        // Reload notes to update pagination
        loadNotes(currentPage);
      } else {
        // Fallback to local storage if not authenticated
        if (selectedNote) {
          const updated = notesStorage.updateNote(selectedNote.id, { title, content });
          if (updated) {
            setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
            setSelectedNote(updated);
          }
        } else {
          const newNote = notesStorage.saveNote({ title, content });
          setNotes(prev => [newNote, ...prev]);
          setSelectedNote(newNote);
        }
        message.success('Note saved locally!');
      }
      clearDraft();
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save note');
    } finally {
      setIsSaving(false);
      setIsSyncing(false);
    }
  }, [selectedNote, selectedDbNote, title, content, user, clearDraft]);

  const handleDownloadPdf = useCallback((note?: Note | DatabaseNote) => {
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (dbPagination?.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (dbPagination?.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleNewNote = () => {
    if (title || content) saveDraft(title, content);
    setSelectedNote(null);
    setSelectedDbNote(null);
    setTitle('');
    setContent('');
    if (isMobile) setShowList(false);
  };

  const handleSelectNote = (note: Note) => {
    if ((!selectedNote && !selectedDbNote) && (title || content)) saveDraft(title, content);
    setSelectedNote(note);
    setSelectedDbNote(null);
    setTitle(note.title);
    setContent(note.content);
    if (isMobile) setShowList(false);
  };

  const handleSelectDbNote = (note: DatabaseNote) => {
    if ((!selectedNote && !selectedDbNote) && (title || content)) saveDraft(title, content);
    setSelectedNote(null);
    setSelectedDbNote(note);
    setTitle(note.title);
    setContent(note.content);
    if (isMobile) setShowList(false);
  };

  const handleDeleteNote = async (id: string, isDbNote: boolean = false) => {
    try {
      if (isDbNote) {
        setIsSyncing(true);
        await apiService.deleteNote(id);
        setDbNotes(prev => prev.filter(n => n._id !== id));
        if (selectedDbNote?._id === id) {
          const remaining = dbNotes.filter(n => n._id !== id);
          if (remaining.length > 0) {
            setSelectedDbNote(remaining[0]);
            setTitle(remaining[0].title);
            setContent(remaining[0].content);
          } else {
            const draft = loadDraft();
            setSelectedDbNote(null);
            setTitle(draft.title);
            setContent(draft.content);
          }
        }
        message.success('Note deleted successfully!');
        // Reload notes to update pagination
        loadNotes(currentPage);
      } else {
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
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      message.error('Failed to delete note');
    } finally {
      if (isDbNote) {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    if (!selectedNote && !selectedDbNote && (title || content)) {
      const timeoutId = setTimeout(() => saveDraft(title, content), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [title, content, selectedNote, selectedDbNote, saveDraft]);

  // Combine local and database notes for display
  const allNotes = [
    ...dbNotes.map(note => ({ ...note, id: note._id, isDbNote: true })),
    ...notes.map(note => ({ ...note, isDbNote: false }))
  ];

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Auth banner for non-signed-in users */}
      {!user && showBanner && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-foreground">
              You're not signed in. Your notes are saved <strong>locally</strong> and may be lost if you clear browser data.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/', { state: { showAuth: true } })}
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button onClick={() => setShowBanner(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* Action Bar */}
      <div className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-semibold text-base md:text-lg tracking-tight text-foreground">
              Document Studio
            </span>
            {!selectedNote && !selectedDbNote && (title || content) && (
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full font-medium">
                Draft
              </span>
            )}
            {selectedDbNote?.isDraft && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-medium">
                Draft (DB)
              </span>
            )}
            {isLoadingNotes && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSyncing && !isLoadingNotes && (
              <div className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setShowList(!showList)}
                className="h-9 px-3 rounded-md text-sm font-medium flex items-center gap-1.5 text-foreground border border-border hover:bg-accent transition-colors"
              >
                {showList ? 'Editor' : `Documents (${dbPagination?.totalNotes || allNotes.length})`}
              </button>
            )}
            <button
              onClick={handleNewNote}
              className="h-9 px-3 rounded-md text-sm font-medium flex items-center gap-1.5 text-foreground border border-border hover:bg-accent transition-colors"
            >
             <span className="hidden sm:inline">Add New Document</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 px-3 rounded-md text-sm font-medium flex items-center gap-1.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
               <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Note'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor - hide on mobile when list is shown */}
        {(!isMobile || !showList) && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="px-4 md:px-6 pt-4 pb-2 border-b border-border bg-card">
              <Input
                placeholder={selectedNote || selectedDbNote ? "Note title..." : "New title..."}
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
              placeholder={selectedNote || selectedDbNote ? "Start writing your note..." : "Start writing your draft..."}
            />
          </div>
        )}

        {/* Notes list - show on desktop always, on mobile only when toggled */}
        {(!isMobile || showList) && (
          <NotesList
            notes={allNotes}
            selectedId={selectedNote?.id || selectedDbNote?._id || null}
            onSelect={(note) => note.isDbNote ? handleSelectDbNote(note as DatabaseNote) : handleSelectNote(note)}
            onDelete={(id) => {
              const note = allNotes.find(n => n.id === id);
              handleDeleteNote(id, note?.isDbNote);
            }}
            onDownloadPdf={handleDownloadPdf}
            pagination={dbPagination}
            onPageChange={handlePageChange}
            loading={isLoadingNotes}
          />
        )}
      </div>
    </div>
  );
};

export default Notes;
