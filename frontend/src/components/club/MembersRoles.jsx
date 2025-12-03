export default function MembersRoles({ members = [] }) {
  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
      <h2
        className="text-lg font-semibold text-gray-800"
        style={{ fontFamily: "Times New Roman, serif" }}
      >
        Members & Roles
      </h2>

      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {Array.isArray(members) && members.length > 0 ? (
          members.map((m) => {
            const username =
              m?.user?.profile?.username ||
              m?.user?.username ||
              `user_${m.userId}`;

            const initial =
              username?.charAt(0)?.toUpperCase() || "?";

            let roleLabel = "Member";
            if (m.role === "HOST") roleLabel = "Host";
            else if (m.role === "MODERATOR") roleLabel = "Moderator";

            return (
              <div
                key={m.id}
                className="flex items-center justify-between px-3 py-2 rounded border border-[#ddcdb7] bg-[#faf6ed]"
              >
                <div className="flex items-center gap-3">
                  
                  {/* Avatar Initial */}
                  <div className="w-8 h-8 rounded-full bg-[#efe6d7] flex items-center justify-center border border-[#d7c4a9]">
                    <span
                      className="text-sm font-semibold text-gray-700"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      {initial}
                    </span>
                  </div>

                  {/* Username + Joined date */}
                  <div>
                    <p
                      className="text-sm text-gray-800 font-semibold"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      {username}
                    </p>
                    <p
                      className="text-xs text-gray-600"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      Joined: {new Date(m.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span className="text-xs px-2 py-1 rounded-full border border-[#ddcdb7] bg-white text-gray-700">
                  {roleLabel}
                </span>
              </div>
            );
          })
        ) : (
          <div
            className="text-center py-2 border border-[#e6dac8] bg-[#efe6d7] rounded"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            <p className="text-sm text-gray-600">No members yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
