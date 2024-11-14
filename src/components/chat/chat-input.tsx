import { cn } from '@/lib/utils';
import React, { useCallback, useMemo } from 'react';
import { BaseEditor, Descendant, Editor, Element as SlateElement, Transforms } from 'slate';
import { Editable, ReactEditor, Slate } from 'slate-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onPaste: (pasteEvent: React.ClipboardEvent<HTMLDivElement>) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  editor: Editor
}

// Custom types for TypeScript
type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

export const serializeToString = (nodes: Descendant[]): string => {
  return nodes
    .map(n => SlateElement.isElement(n) ? n.children.map(c => c.text).join('') : '')
    .join('\n')
    .trim();
};

export const clearEditor = (editor: Editor): void => {
  Transforms.delete(editor, {
    at: {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    },
  });
}

const deserializeToSlate = (text: string): Descendant[] => {
  return text.split('\n').map(line => ({
    type: 'paragraph',
    children: [{ text: line }],
  }));
};

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  onPaste,
  editor,
  placeholder = 'Type a message...',
  className = '',
}: ChatInputProps) {
  // Initialize with empty paragraph
  const initialValue = useMemo<Descendant[]>(
    () => value ? deserializeToSlate(value) : [{ type: 'paragraph', children: [{ text: '' }] }],
    [value]
  );

  const handleChange = useCallback(
    (newValue: Descendant[]) => {
      const newText = serializeToString(newValue);
      onChange(newText);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey && onSubmit) {
        event.preventDefault();
        const text = serializeToString(editor.children);
        if (text.trim()) {
          onSubmit();
        }
      }
    },
    [editor, onSubmit]
  );

  return (
    <div >
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={handleChange}
      >
        <Editable
          className={cn("outline-none max-h-[200px] overflow-y-auto message-input", className)}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onPaste={onPaste}
        />
      </Slate>
    </div>
  );
}