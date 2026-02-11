import { useState } from 'react';
import { Tooltip, Input, Modal } from 'antd';
import { Note } from '@/services/notesStorage';
import { Trash2, FileText, Search, Clock, Download } from 'lucide-react';

interface NotesListProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (note: Note) => void;
  onDelete: (id: string) => void;
  onDownloadPdf: (note: Note) => void;
}

const NotesList = ({ notes, selectedId, onSelect, onDelete, onDownloadPdf }: NotesListProps) => {
  const [search, setSearch] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const filtered = notes.filter(note => 
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="w-[320px] min-w-[320px] h-screen flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm tracking-tight text-foreground">
            My Notes
          </span>
        </div>
        <Input
          placeholder="Search notes..."
          prefix={<Search className="w-3 h-3 text-muted-foreground" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="small"
          style={{ borderRadius: 4, fontSize: 12 }}
        />
      </div>

      {/* Notes count */}
      <div className="px-4 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'Note' : 'Notes'}
        </span>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-5 h-5 text-muted-foreground opacity-40 mx-auto" />
            <p className="text-xs mt-2 text-muted-foreground">
              {search ? 'No notes found' : 'No notes yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((note) => {
              const isSelected = selectedId === note.id;
              const preview = stripHtml(note.content).slice(0, 80);
              
              return (
                <div
                  key={note.id}
                  className={`group relative rounded-lg p-3 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent'
                  }`}
                  onClick={() => onSelect(note)}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-medium text-sm leading-tight line-clamp-1 ${
                      isSelected ? 'text-foreground' : 'text-foreground'
                    }`}>
                      {note.title || 'Untitled Note'}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Tooltip title="Download as PDF">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadPdf(note);
                          }}
                          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </Tooltip>
                      <Tooltip title="Delete note">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNoteToDelete(note.id);
                            setDeleteModalVisible(true);
                          }}
                          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  
                  {preview && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {preview}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Note"
        open={deleteModalVisible}
        onOk={() => {
          if (noteToDelete) {
            onDelete(noteToDelete);
          }
          setDeleteModalVisible(false);
          setNoteToDelete(null);
        }}
        onCancel={() => {
          setDeleteModalVisible(false);
          setNoteToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this note? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default NotesList;
