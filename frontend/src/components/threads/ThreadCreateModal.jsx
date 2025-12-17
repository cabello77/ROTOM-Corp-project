import { useEffect, useMemo, useState } from 'react';
import TagsInput from './TagsInput';

const TITLE_MAX = 120;
const BODY_MAX = 1000;

export default function ThreadCreateModal({ open, onClose, onSubmit, canCreate = false, clubId, currentUser }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [chapterIndex, setChapterIndex] = useState('');
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setTitle('');
      setBody('');
      setChapterIndex('');
      setTags([]);
      setErrors({});
    }
  }, [open]);

  const titleCount = useMemo(() => `${title.length}/${TITLE_MAX}`, [title]);
  const bodyCount = useMemo(() => `${body.length}/${BODY_MAX}`, [body]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    if (title.length > TITLE_MAX) e.title = `Title must be ≤ ${TITLE_MAX} characters`;
    if (!body.trim()) e.body = 'Body is required';
    if (body.length > BODY_MAX) e.body = `Body must be ≤ ${BODY_MAX} characters`;
    if (chapterIndex) {
      const num = parseInt(chapterIndex, 10);
      if (isNaN(num) || num < 1) e.chapterIndex = 'Chapter must be a positive integer';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!canCreate) return;
    await onSubmit?.({
      clubId,
      title: title.trim(),
      body: body.trim(),
      chapterIndex: chapterIndex ? parseInt(chapterIndex, 10) : null,
      tags,
      author: currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 0, name: 'Unknown' },
    });
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-full max-w-2xl rounded-xl border border-[#e3d8c8] shadow-lg overflow-hidden" role="dialog" aria-modal="true" aria-label="New Discussion">
        <div className="px-6 py-4 border-b border-[#e6dac8] bg-[#faf6ed]">
          <h2 className="text-lg font-semibold text-gray-800" style={{}}>New Discussion</h2>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1" style={{}}>Title</label>
            <input
              type="text"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= TITLE_MAX) {
                  setTitle(value);
                }
              }}
              className="w-full border border-[#ddcdb7] rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
              style={{backgroundColor: '#FDFBF6' }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-red-600">{errors.title}</span>
              <span className="text-xs text-gray-500">{titleCount}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1" style={{}}>Body</label>
            <textarea
              value={body}
              maxLength={BODY_MAX}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= BODY_MAX) {
                  setBody(value);
                }
              }}
              rows={8}
              className="w-full border border-[#ddcdb7] rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
              style={{backgroundColor: '#FDFBF6' }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-red-600">{errors.body}</span>
              <span className="text-xs text-gray-500">{bodyCount}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1" style={{}}>Chapter (optional)</label>
              <input
                type="number"
                min={1}
                step={1}
                value={chapterIndex}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow positive integers: accept empty string or digits only
                  if (value === '' || /^\d+$/.test(value)) {
                    setChapterIndex(value);
                  }
                }}
                onKeyDown={(e) => {
                  // Allow digits, control keys (Backspace, Delete, Arrow keys, Tab, etc.), and navigation keys
                  const isDigit = /^\d$/.test(e.key);
                  const isControlKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'].includes(e.key);
                  const isModifierKey = e.ctrlKey || e.metaKey || e.altKey;
                  
                  // Block if not a digit, control key, or modifier combination
                  if (!isDigit && !isControlKey && !isModifierKey) {
                    e.preventDefault();
                  }
                }}
                className="w-full border border-[#ddcdb7] rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                style={{backgroundColor: '#FDFBF6' }}
              />
              <span className="text-xs text-red-600">{errors.chapterIndex}</span>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-1" style={{}}>Tags (optional)</label>
              <TagsInput value={tags} onChange={setTags} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-[#ddcdb7] bg-white hover:bg-[#f7ecda] text-sm" style={{}}>
              Cancel
            </button>
            <button type="submit" disabled={!canCreate} aria-disabled={!canCreate} className="px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] text-sm disabled:opacity-60" style={{}}>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

