/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
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
import { Modal, Input, Tooltip } from 'antd';
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
  Type,
  Hash,
  RotateCcw,
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

  const editor = useEditor({
    extensions: [
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
        class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-[calc(100vh-180px)]',
      },
    },
  });

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
    tooltip 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any; 
    tooltip: string;
  }) => (
    <Tooltip title={tooltip}>
      <button
        onClick={onClick}
        className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <Icon className="w-4 h-4" />
      </button>
    </Tooltip>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card flex-wrap">
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
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          icon={Code}
          tooltip="Inline Code"
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
      <div className="flex-1 overflow-y-auto bg-background">
        <EditorContent editor={editor} />
      </div>

      {/* Character Count */}
      {editor && (
        <div className="px-3 py-2 border-t border-border bg-card text-xs text-muted-foreground flex justify-between items-center">
          <span>
            {editor.storage.characterCount.characters()} characters
          </span>
          <span>
            {editor.storage.characterCount.words()} words
          </span>
        </div>
      )}

      {/* Link Modal */}
      <Modal
        title="Insert Link"
        open={linkModalVisible}
        onOk={() => {
          if (linkUrl.trim()) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
          }
          setLinkModalVisible(false);
        }}
        onCancel={() => setLinkModalVisible(false)}
        okText="Insert"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter URL (e.g., https://example.com)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onPressEnter={() => {
            if (linkUrl.trim()) {
              editor.chain().focus().setLink({ href: linkUrl }).run();
            }
            setLinkModalVisible(false);
          }}
        />
      </Modal>

      {/* Image Modal */}
      <Modal
        title="Insert Image"
        open={imageModalVisible}
        onOk={() => {
          if (imageUrl.trim()) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
          }
          setImageModalVisible(false);
        }}
        onCancel={() => setImageModalVisible(false)}
        okText="Insert"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          onPressEnter={() => {
            if (imageUrl.trim()) {
              editor.chain().focus().setImage({ src: imageUrl }).run();
            }
            setImageModalVisible(false);
          }}
        />
      </Modal>

      {/* Color Modal */}
      <Modal
        title="Set Text Color"
        open={colorModalVisible}
        onOk={() => {
          if (colorValue.trim()) {
            editor.chain().focus().setColor(colorValue).run();
          }
          setColorModalVisible(false);
        }}
        onCancel={() => setColorModalVisible(false)}
        okText="Apply"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter color (hex, rgb, or name)"
          value={colorValue}
          onChange={(e) => setColorValue(e.target.value)}
          onPressEnter={() => {
            if (colorValue.trim()) {
              editor.chain().focus().setColor(colorValue).run();
            }
            setColorModalVisible(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default NotesEditor;
