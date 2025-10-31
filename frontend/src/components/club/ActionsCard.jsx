export default function ActionsCard({ isMember, isHost, onDelete, onLeave }) {
  if (!isMember && !isHost) return null;
  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
      <h3 className="text-base font-semibold text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>
        Actions
      </h3>
      <div className="space-y-2">
        <button
          type="button"
          className="w-full px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
          style={{ fontFamily: 'Times New Roman, serif' }}
          onClick={() => alert('Invite functionality coming soon!')}
        >
          Invite Members
        </button>
        {isHost && (
          <button
            type="button"
            onClick={onDelete}
            className="w-full px-4 py-2 rounded border border-red-300 bg-red-50 hover:bg-red-100 transition-colors text-sm text-red-700"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Delete Book Club
          </button>
        )}
        {isMember && !isHost && (
          <button
            type="button"
            onClick={onLeave}
            className="w-full px-4 py-2 rounded border border-red-300 bg-red-50 hover:bg-red-100 transition-colors text-sm text-red-700"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Leave Book Club
          </button>
        )}
      </div>
    </div>
  );
}

