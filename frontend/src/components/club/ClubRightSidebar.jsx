import { useState } from "react";
import AssignModeratorModal from "./AssignModeratorModal";

export default function ClubRightSidebar({
  user,
  club,
  isMember,
  currentBook,
  userProgress,
  members = [],
  onOpenProgress,
  onJoinClub,
  onLeaveClub,
  onDeleteClub,
  onInviteMembers,
  onPromote,
}) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const isHost = members.some(
    (m) => m.userId === user?.id && m.role === "HOST"
  );

  return (
    <aside className="lg:col-span-3 space-y-4">
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">

        <h2
          className="text-lg font-semibold text-gray-800 mb-4"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Actions
        </h2>

        {/* INVITE MEMBERS */}
        {isHost && (
          <button
            onClick={onInviteMembers}
            className="w-full px-4 py-2 mb-3 rounded border border-[#ddcdb7] bg-[#efe6d7]
                       hover:bg-[#e3d5c2] transition-colors text-sm"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Invite Members
          </button>
        )}

        {/* ASSIGN MODERATOR */}
        {isHost && (
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="w-full px-4 py-2 mb-3 rounded border border-[#ddcdb7] bg-[#efe6d7]
                       hover:bg-[#e3d5c2] transition-colors text-sm"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Assign Moderator
          </button>
        )}

        {/* DELETE CLUB */}
        {isHost && (
          <button
            onClick={onDeleteClub}
            className="w-full px-4 py-2 rounded border border-red-300 bg-red-100
                       hover:bg-red-200 transition-colors text-sm text-red-700"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Delete Book Club
          </button>
        )}
      </div>

      {/* ASSIGN MODAL */}
      <AssignModeratorModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        members={members.filter((m) => m.role !== "HOST")}
        onPromote={async (id) => {
          await onPromote(id);
          setIsAssignModalOpen(false);
        }}
      />
    </aside>
  );
}
