/**
 * RichTextEditor Component
 * 
 * WYSIWYG editor for blog posts and content:
 * - Toolbar with formatting buttons
 * - Bold, Italic, Underline
 * - Headings (H1-H6)
 * - Lists (bullet, numbered)
 * - Link insertion
 * - Image upload
 * - Blockquote, Code block
 * - Text alignment
 * - Undo/Redo
 * - HTML preview toggle
 * - Full-screen mode
 * - Character/word count
 * - Auto-save to localStorage
 * 
 * @param {string} value - HTML content
 * @param {function} onChange - Change callback
 * @param {string} placeholder - Placeholder text
 * @param {number} height - Editor height in pixels
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Eye,
  Maximize,
  Minimize,
  Save
} from 'lucide-react';

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start writing...',
  height = 400
}) {
  const [content, setContent] = useState(value);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const editorRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Update counts
  useEffect(() => {
    const text = editorRef.current?.innerText || '';
    setCharCount(text.length);
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave();
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content]);

  // Handle content change
  const handleInput = () => {
    const html = editorRef.current?.innerHTML || '';
    setContent(html);
    onChange?.(html);
  };

  // Auto-save to localStorage
  const handleAutoSave = () => {
    if (content) {
      try {
        const key = `editor_draft_${Date.now()}`;
        const drafts = JSON.parse(localStorage.getItem('editor_drafts') || '[]');
        drafts.push({ key, content, timestamp: new Date().toISOString() });
        
        // Keep only last 5 drafts
        if (drafts.length > 5) {
          drafts.shift();
        }
        
        localStorage.setItem('editor_drafts', JSON.stringify(drafts));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  };

  // Execute formatting command
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  // Insert link
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  // Insert image
  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  // Toolbar buttons configuration
  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
    { type: 'divider' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { type: 'divider' },
    { icon: LinkIcon, action: insertLink, title: 'Insert Link' },
    { icon: ImageIcon, action: insertImage, title: 'Insert Image' },
    { type: 'divider' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Blockquote' },
    { icon: Code, command: 'formatBlock', value: 'pre', title: 'Code Block' },
    { type: 'divider' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
    { type: 'divider' },
    { icon: Undo, command: 'undo', title: 'Undo (Ctrl+Z)' },
    { icon: Redo, command: 'redo', title: 'Redo (Ctrl+Y)' }
  ];

  return (
    <div className={`
      flex flex-col bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600
      ${isFullscreen ? 'fixed inset-0 z-50' : ''}
    `}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300 dark:border-gray-600">
        <div className="flex items-center gap-1 overflow-x-auto">
          {/* Heading Selector */}
          <select
            onChange={(e) => execCommand('formatBlock', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>

          <div className="w-px h-6 mx-2 bg-gray-300 dark:bg-gray-600"></div>

          {/* Formatting Buttons */}
          {toolbarButtons.map((button, index) => {
            if (button.type === 'divider') {
              return <div key={index} className="w-px h-6 mx-1 bg-gray-300 dark:bg-gray-600"></div>;
            }

            const Icon = button.icon;
            return (
              <button
                key={index}
                onClick={() => button.action ? button.action() : execCommand(button.command, button.value)}
                title={button.title}
                className="p-2 text-gray-600 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            title="Toggle Preview"
            className="p-2 text-gray-600 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen"
            className="p-2 text-gray-600 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button
            onClick={handleAutoSave}
            title="Save Draft"
            className="p-2 text-gray-600 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-auto" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}>
        {showPreview ? (
          <div
            className="p-4 prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="h-full p-4 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            data-placeholder={placeholder}
            style={{
              minHeight: '100%',
            }}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-300 dark:border-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <div>
          {lastSaved && (
            <span className="flex items-center gap-1">
              <Save className="w-3 h-3" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}