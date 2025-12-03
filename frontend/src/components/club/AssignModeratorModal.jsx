import { useState } from "react";

export default function AssignModeratorModal({
  isOpen,
  onClose,
  members = [],
  onPromote,
}) {
  const [selectedId, setSelectedId] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 border border-[#e3d8c8] shadow-lg">

        <h2
          className="text-lg font-semibold text-gray-800"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Assign Moderator
        </h2>

        <p
          className="text-sm text-gray-600"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Select a member to promote to moderator.
        </p>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {members.length === 0 && (
            <p
              className="text-sm text-gray-500"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              No eligible members.
            </p>
          )}

          {members.map((member) => {
            const fullName =
              member.user?.profile?.fullName ||
              member.user?.profile?.username ||
              "Unknown User";

            return (
              <label
                key={member.userId}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                <input
                  type="radio"
                  name="promote"
                  value={member.userId}
                  onChange={() => setSelectedId(member.userId)}
                />
                <span>{fullName}</span>
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border text-sm bg-gray-100 hover:bg-gray-200"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Cancel
          </button>

          <button
            disabled={!selectedId}
            onClick={() => onPromote(selectedId)}
            className="px-4 py-2 rounded text-sm bg-[#d9c5a3] hover:bg-[#cbb894]"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Promote
          </button>
        </div>
      </div>
    </div>
  );
}
