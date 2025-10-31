import { useState, useMemo } from 'react';

const TAG_MAX = 5;
const TAG_LEN_MAX = 24;
const TAG_RE = /^[A-Za-z0-9-]+$/;

export default function TagsInput({ value = [], onChange }) {
  const [text, setText] = useState('');

  const tags = useMemo(() => Array.isArray(value) ? value : [], [value]);

  const tryAddTags = (raw) => {
    const parts = String(raw)
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const next = [...tags];
    for (const p of parts) {
      if (next.length >= TAG_MAX) break;
      if (!TAG_RE.test(p) || p.length > TAG_LEN_MAX) continue;
      if (!next.includes(p)) next.push(p);
    }
    onChange && onChange(next);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryAddTags(text);
      setText('');
    }
    if (e.key === 'Backspace' && !text && tags.length) {
      const next = tags.slice(0, -1);
      onChange && onChange(next);
    }
  };

  const removeTag = (t) => {
    const next = tags.filter((x) => x !== t);
    onChange && onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t} className="px-2 py-1 text-xs rounded-full border border-[#ddcdb7] bg-[#faf6ed] text-gray-700">
            {t}
            <button
              type="button"
              className="ml-2 text-gray-500 hover:text-gray-700"
              onClick={() => removeTag(t)}
              aria-label={`Remove tag ${t}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (text.trim()) {
            tryAddTags(text);
            setText('');
          }
        }}
        placeholder="Add tags (comma or Enter)"
        className="w-full border border-[#ddcdb7] rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
        style={{ fontFamily: 'Times New Roman, serif', backgroundColor: '#FDFBF6' }}
      />
      <p className="text-xs text-gray-500" style={{ fontFamily: 'Times New Roman, serif' }}>
        Up to {TAG_MAX} tags, {TAG_LEN_MAX} chars each, letters/numbers/dashes.
      </p>
    </div>
  );
}

