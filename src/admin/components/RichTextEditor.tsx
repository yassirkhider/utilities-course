import { useEffect, useRef } from 'react';
import { Bold, List, ListOrdered, Heading2, Link as LinkIcon, Table, Pilcrow } from 'lucide-react';
import { sanitizeHtml } from '../../utils/sanitize';

interface Props {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  minHeight?: number;
}

const TOOLBAR_BUTTONS: { icon: typeof Bold; command: string; label: string; value?: string }[] = [
  { icon: Heading2, command: 'formatBlock', label: 'Heading', value: '<h3>' },
  { icon: Pilcrow, command: 'formatBlock', label: 'Paragraph', value: '<p>' },
  { icon: Bold, command: 'bold', label: 'Bold' },
  { icon: List, command: 'insertUnorderedList', label: 'Bullet list' },
  { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered list' },
];

export default function RichTextEditor({ value, onChange, label, minHeight = 120 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isFocused = useRef(false);

  useEffect(() => {
    if (ref.current && !isFocused.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command: string, cmdValue?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, cmdValue);
    handleInput();
  };

  const insertLink = () => {
    const url = window.prompt('Link URL (https://…)');
    if (url) exec('createLink', url);
  };

  const insertTable = () => {
    const rows = Number(window.prompt('Number of rows', '2')) || 2;
    const cols = Number(window.prompt('Number of columns', '2')) || 2;
    let html = '<table><tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) html += '<td>&nbsp;</td>';
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  const handleInput = () => {
    if (ref.current) onChange(sanitizeHtml(ref.current.innerHTML));
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <div className="rounded-md border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-1.5 py-1">
          {TOOLBAR_BUTTONS.map((b) => (
            <button
              key={b.label}
              type="button"
              title={b.label}
              onClick={() => exec(b.command, b.value)}
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-200 text-slate-600"
            >
              <b.icon size={15} />
            </button>
          ))}
          <button type="button" title="Insert link" onClick={insertLink} className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-200 text-slate-600">
            <LinkIcon size={15} />
          </button>
          <button type="button" title="Insert table" onClick={insertTable} className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-200 text-slate-600">
            <Table size={15} />
          </button>
        </div>
        <div
          ref={ref}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          className="rich-content px-3 py-2 text-sm focus:outline-none"
          style={{ minHeight }}
          onFocus={() => (isFocused.current = true)}
          onBlur={() => {
            isFocused.current = false;
            handleInput();
          }}
          onInput={handleInput}
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}
