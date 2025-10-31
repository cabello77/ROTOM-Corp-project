import { isNewBadge } from '../../services/discussions';

export default function ThreadListItem({ thread, isHost = false, onClick }) {
  const { title, author, chapterIndex, tags = [], pinned, locked, createdAt } = thread;
  return (
    <button type="button" onClick={onClick} className="w-full text-left border border-[#e6dac8] bg-[#faf6ed] rounded-lg p-4 hover:bg-[#f2ebde] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {pinned && (
              <span className="text-xs px-2 py-1 rounded bg-yellow-100 border border-yellow-300 text-yellow-800">Pinned</span>
            )}
            {locked && (
              <span className="text-xs px-2 py-1 rounded bg-red-100 border border-red-300 text-red-800">Locked</span>
            )}
            {isNewBadge(createdAt) && (
              <span className="text-xs px-2 py-1 rounded bg-green-100 border border-green-300 text-green-800">New</span>
            )}
          </div>
          <h4 className="mt-1 text-base font-semibold text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>{title}</h4>
          <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>by {author?.name || 'Unknown'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {typeof chapterIndex === 'number' && (
              <span className="text-xs px-2 py-1 rounded-full border border-[#ddcdb7] bg-white text-gray-700">Chapter {chapterIndex}</span>
            )}
            {tags.map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded-full border border-[#ddcdb7] bg-white text-gray-700">#{t}</span>
            ))}
          </div>
        </div>
        {/* Moderator tools placeholder: disabled for non-hosts; hidden for hosts (until backend) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400" title="Moderator tools coming soon.">⋮</span>
        </div>
      </div>
    </button>
  );
}
