export default function MemberProgress({ members = [], readingGoal }) {
  if (!members.length || !readingGoal) return null;

  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
      <h3
        className="text-base font-semibold text-gray-800"
        style={{ fontFamily: "Times New Roman, serif" }}
      >
        Member Progress
      </h3>

      <div className="space-y-3">
        {members.map((member) => {
          const displayName =
            member.user?.profile?.fullName ||
            member.user?.profile?.username ||
            "Unknown User";

          return (
            <div key={member.id} className="space-y-1">
              <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                <span
                  style={{ fontFamily: "Times New Roman, serif" }}
                  className="flex items-center gap-1"
                >
                  {displayName}

                  {member.isHost && (
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800"
                      title="Club Host"
                    >
                      Host
                    </span>
                  )}
                </span>

                <span style={{ fontFamily: "Times New Roman, serif" }}>
                  {member.progress}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#774C30] h-2 rounded-full transition-all"
                  style={{ width: `${member.progress}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
