export default function MembersRoles({ members = [] }) {
  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>
        Members & Roles
      </h2>
      <p className="text-sm text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
        Showing temporary roles. Moderator tools coming soon.
      </p>
      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {Array.isArray(members) && members.length > 0 ? (
          members.map((m) => {
            const displayName = m?.user?.name || `User ${m.userId}`;
            const role = m.isHost ? 'Host (Admin)' : 'Member (temporary)';
            return (
              <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded border border-[#ddcdb7] bg-[#faf6ed]">
                <div>
                  <p className="text-sm text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>{displayName}</p>
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>Joined: {new Date(m.joinedAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full border border-[#ddcdb7] bg-white text-gray-700">
                  {role}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center py-2 border border-[#e6dac8] bg-[#efe6d7] rounded" style={{ fontFamily: 'Times New Roman, serif' }}>
            <p className="text-sm text-gray-600">No members yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

