/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Tooltip, Input, Modal, Popconfirm, Pagination } from 'antd';
import { Note } from '@/services/notesStorage';
import { Trash2, FileText, Search, Clock, Download, Database, HardDrive } from 'lucide-react';

interface DatabaseNote {
  _id: string;
  title: string;
  content: string;
  user: string;
  isDraft: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  id: string; // Added for compatibility
  isDbNote: boolean;
}

interface ExtendedNote extends Note {
  isDbNote?: boolean;
  isDraft?: boolean;
}

type CombinedNote = ExtendedNote | DatabaseNote;

interface NotesListProps {
  notes: CombinedNote[];
  selectedId: string | null;
  onSelect: (note: CombinedNote) => void;
  onDelete: (id: string) => void;
  onDownloadPdf: (note: CombinedNote) => void;
  pagination?: any;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

const NotesList = ({ notes, selectedId, onSelect, onDelete, onDownloadPdf, pagination, onPageChange, loading = false }: NotesListProps) => {
  const [search, setSearch] = useState('');

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
    <div className="w-[320px] min-w-[320px] flex flex-col bg-card border-l border-border min-h-0">
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
          {pagination ? `${pagination.totalNotes} Total` : `${filtered.length} ${filtered.length === 1 ? 'Note' : 'Notes'}`}
        </span>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {loading ? (
          // Skeleton loading state with dark mode colors
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded-lg p-3 border border-border bg-card animate-pulse">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 bg-muted rounded-full"></div>
                    <div className="w-6 h-6 bg-muted rounded-full"></div>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-2/5 mb-2"></div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-muted rounded-full"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
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
              const isDbNote = 'isDbNote' in note && note.isDbNote;
              const isDraft = 'isDraft' in note && note.isDraft;

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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium text-sm leading-tight line-clamp-1 ${
                          isSelected ? 'text-foreground' : 'text-foreground'
                        }`}>
                          {note.title || 'Untitled Note'}
                        </h3>
                        {isDbNote && (
                          <Tooltip title={isDraft ? "Draft (Database)" : "Saved (Database)"}>
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                              isDraft
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              <Database className="w-2.5 h-2.5" />
                              {isDraft ? 'Draft' : 'Saved'}
                            </div>
                          </Tooltip>
                        )}
                        {!isDbNote && (
                          <Tooltip title="Local Note">
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                              <HardDrive className="w-2.5 h-2.5" />
                              Local
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    </div>
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
                      <Popconfirm
                        title="Delete Note"
                         onConfirm={(e) => {
                          e?.stopPropagation();
                          onDelete(note.id);
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Tooltip title="Delete note">
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </Tooltip>
                      </Popconfirm>
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-3 py-3 border-t border-border">
          <Pagination
            current={pagination.currentPage}
            total={pagination.totalNotes}
            pageSize={10}
            onChange={onPageChange}
            size="small"
            showSizeChanger={false}
            showQuickJumper={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} notes`}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      
    </div>
  );
};

export default NotesList;
