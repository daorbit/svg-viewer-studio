/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import Dropcursor from '@tiptap/extension-dropcursor';
import Focus from '@tiptap/extension-focus';
import Gapcursor from '@tiptap/extension-gapcursor';
import Heading from '@tiptap/extension-heading';
import { Tooltip, message } from 'antd';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import apiService from '../services/api';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Underline as UnderlineIcon,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  CheckSquare,
  Palette,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Minus,
  Hash,
  RotateCcw,
  Copy,
  Sparkles,
  Plus,
} from 'lucide-react';

interface NotesEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const NotesEditor = ({ content, onChange, placeholder = 'Start writing your note...' }: NotesEditorProps) => {
  // Modal states
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [colorValue, setColorValue] = useState('#000000');
  const [processingAI, setProcessingAI] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState('fix-english');
  const [promptText, setPromptText] = useState('');

  // Custom extension to handle Tab key for inserting 5 spaces
  const TabToSpaces = Extension.create({
    addKeyboardShortcuts() {
      return {
        Tab: () => {
          this.editor.commands.insertContent('     '); // 5 spaces
          return true; // Prevent default tab behavior
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      TabToSpaces,
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Color,
      TextStyle,
      Subscript,
      Superscript,
      HorizontalRule,
      Typography,
      CharacterCount,
      Dropcursor.configure({
        color: 'hsl(var(--primary))',
        width: 2,
      }),
      // Focus.configure({
      //   className: 'ring-2 ring-primary ring-offset-2',
      //   mode: 'all',
      // }),
      Gapcursor,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-full cursor-text',
        spellcheck: 'true',
      },
      handleClick: (view, pos, event) => {
        // Ensure the editor gets focus when clicking anywhere
        if (!view.hasFocus()) {
          view.focus();
        }
        return false; // Let TipTap handle the click
      },
    },
  });

   const handleCopyContent = async () => {
    if (!editor) return;
    
    const htmlContent = editor.getHTML();
    const textContent = editor.getText();
    
    try {
      // Try to copy HTML first, fallback to plain text
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const textBlob = new Blob([textContent], { type: 'text/plain' });
        const clipboardItem = new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        // Fallback for browsers that don't support ClipboardItem
        await navigator.clipboard.writeText(textContent);
      }
      
      message.success('Content copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy content:', error);
      // Fallback to plain text copy
      try {
        await navigator.clipboard.writeText(textContent);
        message.success('Content copied to clipboard!');
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        message.error('Failed to copy content to clipboard.');
      }
    }
  };

  // --- Code-block-only formatter (JSON only) ---
  const handleFormat = () => {
    if (!editor) return;
    const { state } = editor;
    const { from, to, empty } = state.selection;

    // Only operate when inside a code block
    if (editor.isActive('codeBlock')) {
      // If text is selected inside code block -> format selected JSON
      if (!empty) {
        const selectedCode = state.doc.textBetween(from, to, '\n', '\n');
        try {
          const parsed = JSON.parse(selectedCode);
          const formatted = JSON.stringify(parsed, null, 2);
          editor.commands.command(({ tr, state, dispatch }) => {
            const textNode = state.schema.text(formatted);
            tr.replaceWith(from, to, textNode);
            dispatch(tr);
            return true;
          });
          message.success('Formatted JSON in selected code block');
        } catch (err) {
          message.error('Selected code is not valid JSON');
        }
        return;
      }

      // No selection -> find the code block node and format its full content
      let handled = false;
      state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
        if (node.type.name === 'codeBlock' && state.selection.$from.pos >= pos && state.selection.$from.pos < pos + node.nodeSize) {
          try {
            const parsed = JSON.parse(node.textContent);
            const formatted = JSON.stringify(parsed, null, 2);
            editor.commands.command(({ tr, state, dispatch }) => {
              const newNode = state.schema.nodes.codeBlock.create(node.attrs, state.schema.text(formatted));
              tr.replaceWith(pos, pos + node.nodeSize, newNode);
              dispatch(tr);
              return true;
            });
            message.success('Formatted JSON in code block');
          } catch (e) {
            message.error('Code block is not valid JSON');
          }
          handled = true;
          return false; // stop walking
        }
        return true;
      });

      if (!handled) message.info('Place cursor inside a code block to format JSON');
      return;
    }

    // Not in a code block — do nothing
    message.info('Formatting applies to code blocks only (JSON)');
  }; 

  const handleOpenAIModal = () => {
    if (!editor) return;

    const selectedText = editor.state.selection.empty 
      ? '' 
      : editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to);

    if ((selectedAction === 'fix-english' || selectedAction === 'format-content') && !selectedText.trim()) {
      message.warning('Please select some text to fix or format.');
      return;
    }

    setPromptText(selectedText);
    setAiModalVisible(true);
  };

  const handleProcessFromModal = async () => {
    const textToProcess = selectedAction === 'generate-content' ? promptText : (editor?.state.selection.empty 
      ? editor?.getText() 
      : editor?.state.doc.textBetween(editor?.state.selection.from, editor?.state.selection.to));

    if (!textToProcess?.trim()) {
      message.warning('Please enter a prompt or select text to process.');
      return;
    }

    setAiModalVisible(false);
    setProcessingAI(true);
    try {
      const processedText = await apiService.processText(selectedAction, textToProcess);
      editor?.commands.setContent(processedText);
      onChange(processedText);
      message.success('Text processed successfully!');
    } catch (error) {
      console.error('Failed to process text:', error);
      message.error('Failed to process text. Please try again.');
    } finally {
      setProcessingAI(false);
    }
  };

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    icon: Icon, 
    tooltip,
    disabled = false
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any; 
    tooltip: string;
    disabled?: boolean;
  }) => (
    <Tooltip title={tooltip}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <Icon className="w-4 h-4" />
      </button>
    </Tooltip>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card flex-wrap shrink-0">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          tooltip="Bold (Ctrl+B)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          tooltip="Italic (Ctrl+I)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={UnderlineIcon}
          tooltip="Underline (Ctrl+U)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={Strikethrough}
          tooltip="Strikethrough"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          icon={Highlighter}
          tooltip="Highlight"
        />
        
        <div className="w-px h-5 bg-border mx-1" />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={Heading1}
          tooltip="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          tooltip="Heading 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={Heading3}
          tooltip="Heading 3"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          isActive={editor.isActive('heading', { level: 4 })}
          icon={Heading4}
          tooltip="Heading 4"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          isActive={editor.isActive('heading', { level: 5 })}
          icon={Heading5}
          tooltip="Heading 5"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          isActive={editor.isActive('heading', { level: 6 })}
          icon={Heading6}
          tooltip="Heading 6"
        />
        
        <div className="w-px h-5 bg-border mx-1" />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          tooltip="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          tooltip="Numbered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={Quote}
          tooltip="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          icon={Code}
          tooltip="Code Block"
        />
  
        <ToolbarButton
          onClick={handleFormat}
          icon={Sparkles}
          tooltip="Prettify JSON (code block only)"
        />
        
        <div className="w-px h-5 bg-border mx-1" />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={AlignLeft}
          tooltip="Align Left"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={AlignCenter}
          tooltip="Align Center"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={AlignRight}
          tooltip="Align Right"
        />
        
        <div className="w-px h-5 bg-border mx-1" />
        
        <ToolbarButton
          onClick={() => {
            setLinkUrl('');
            setLinkModalVisible(true);
          }}
          isActive={editor.isActive('link')}
          icon={LinkIcon}
          tooltip="Insert Link"
        />
        <ToolbarButton
          onClick={() => {
            setImageUrl('');
            setImageModalVisible(true);
          }}
          icon={ImageIcon}
          tooltip="Insert Image"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          icon={TableIcon}
          tooltip="Insert Table"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          icon={CheckSquare}
          tooltip="Task List"
        />
        <ToolbarButton
          onClick={() => {
            setColorValue('#000000');
            setColorModalVisible(true);
          }}
          icon={Palette}
          tooltip="Text Color"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive('subscript')}
          icon={SubscriptIcon}
          tooltip="Subscript"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive('superscript')}
          icon={SuperscriptIcon}
          tooltip="Superscript"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={Minus}
          tooltip="Horizontal Rule"
        />
        <ToolbarButton
          onClick={handleCopyContent}
          icon={Copy}
          tooltip="Copy Content"
        />
        {/* <ToolbarButton
          onClick={handleOpenAIModal}
          icon={Sparkles}
          tooltip="AI Text Processor"
          disabled={processingAI}
        /> */}
        
        <div className="w-px h-5 bg-border mx-1" />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          icon={RotateCcw}
          tooltip="Clear Formatting"
        />
        
        <div className="w-px h-5 bg-border mx-1" />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
          tooltip="Undo (Ctrl+Z)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
          tooltip="Redo (Ctrl+Y)"
        />
      </div>

      {/* Editor */}
      <div 
        className="flex-1 min-h-0 overflow-y-auto bg-background relative cursor-text"
        onClick={() => {
          if (editor && !editor.isFocused) {
            editor.commands.focus();
          }
        }}
      >
        <div className="min-h-full">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Character Count - always visible */}
      {editor && (
        <div className="px-3 py-2 border-t border-border bg-card text-xs text-muted-foreground flex justify-between items-center shrink-0">
          <span>
            {editor.storage.characterCount.characters()} characters
          </span>
          <span>
            {editor.storage.characterCount.words()} words
          </span>
        </div>
      )}

      {/* Link Modal (Radix/Dialog) */}
      <Dialog open={linkModalVisible} onOpenChange={setLinkModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>Paste a URL and press Insert or Enter</DialogDescription>
          </DialogHeader>

          <div>
            <Input
              placeholder="Enter URL (e.g., https://example.com)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (linkUrl.trim()) {
                    editor.chain().focus().setLink({ href: linkUrl }).run();
                  }
                  setLinkModalVisible(false);
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" className="h-10" onClick={() => setLinkModalVisible(false)}>Cancel</Button>
            <Button className="h-10" onClick={() => {
              if (linkUrl.trim()) {
                editor.chain().focus().setLink({ href: linkUrl }).run();
              }
              setLinkModalVisible(false);
            }}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Modal (Radix/Dialog) */}
      <Dialog open={imageModalVisible} onOpenChange={setImageModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>Enter an image URL to insert into the note</DialogDescription>
          </DialogHeader>

          <div>
            <Input
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (imageUrl.trim()) {
                    editor.chain().focus().setImage({ src: imageUrl }).run();
                  }
                  setImageModalVisible(false);
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" className="h-10" onClick={() => setImageModalVisible(false)}>Cancel</Button>
            <Button className="h-10" onClick={() => {
              if (imageUrl.trim()) {
                editor.chain().focus().setImage({ src: imageUrl }).run();
              }
              setImageModalVisible(false);
            }}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Color Modal (Radix/Dialog) */}
      <Dialog open={colorModalVisible} onOpenChange={setColorModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Text Color</DialogTitle>
            <DialogDescription>Enter a color (hex, rgb, or name)</DialogDescription>
          </DialogHeader>

          <div>
            <Input
              placeholder="Enter color (hex, rgb, or name)"
              value={colorValue}
              onChange={(e) => setColorValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (colorValue.trim()) {
                    editor.chain().focus().setColor(colorValue).run();
                  }
                  setColorModalVisible(false);
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" className="h-10" onClick={() => setColorModalVisible(false)}>Cancel</Button>
            <Button className="h-10" onClick={() => {
              if (colorValue.trim()) {
                editor.chain().focus().setColor(colorValue).run();
              }
              setColorModalVisible(false);
            }}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiModalVisible} onOpenChange={setAiModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Text Processor</DialogTitle>
            <DialogDescription>Use the AI tools to fix, format or generate content.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Action</label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="fix-english">Fix English</option>
                <option value="format-content">Format Content</option>
                <option value="generate-content">Generate Content</option>
              </select>
            </div>
            {selectedAction === 'generate-content' && (
              <div>
                <label className="block text-sm font-medium mb-2">Prompt</label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Enter a prompt for content generation..."
                  className="w-full p-2 border rounded h-32 resize-none"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" className="h-10" onClick={() => setAiModalVisible(false)}>Cancel</Button>
            <Button className="h-10" onClick={handleProcessFromModal} disabled={processingAI}>{processingAI ? 'Processing...' : 'Process'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesEditor;
