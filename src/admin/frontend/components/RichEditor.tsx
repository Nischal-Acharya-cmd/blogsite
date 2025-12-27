import React, { useEffect, useRef } from 'react';

interface RichEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

const RichEditor: React.FC<RichEditorProps> = ({ value = '', onChange, placeholder }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const exec = (command: string, value?: string) => {
    // Use deprecated execCommand for simplicity — works for basic formatting
    document.execCommand(command, false, value);
    if (onChange && ref.current) onChange(ref.current.innerHTML);
  };

  const handleInput = () => {
    if (onChange && ref.current) onChange(ref.current.innerHTML);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        <button type="button" className="px-2 py-1 rounded border" onClick={() => exec('bold')}>B</button>
        <button type="button" className="px-2 py-1 rounded border" onClick={() => exec('italic')}>I</button>
        <button type="button" className="px-2 py-1 rounded border" onClick={() => exec('underline')}>U</button>
        <button type="button" className="px-2 py-1 rounded border" onClick={() => exec('insertUnorderedList')}>• List</button>
        <button type="button" className="px-2 py-1 rounded border" onClick={() => exec('insertOrderedList')}>1. List</button>
        <button type="button" className="px-2 py-1 rounded border" onClick={() => exec('formatBlock', '<h2>')}>H2</button>
        <button type="button" className="px-2 py-1 rounded border" onClick={() => exec('createLink', prompt('Enter URL') || '')}>Link</button>
        <input type="color" onChange={(e) => exec('foreColor', e.target.value)} title="Text color" className="w-8 h-8 p-0 border rounded" />
      </div>

      <div
        ref={ref}
        onInput={handleInput}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[200px] p-3 border rounded prose"
        placeholder={placeholder}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
};

export default RichEditor;
