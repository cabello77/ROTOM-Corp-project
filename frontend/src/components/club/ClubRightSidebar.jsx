import { useState } from "react";
import AssignModeratorModal from "./AssignModeratorModal";
import MyProgressCard from "./MyProgressCard";

export default function ClubRightSidebar({
  user,
  club,
  isMember,
  currentBook,
  currentPage,
  members = [],
  onOpenProgress,
  onOpenGoalModal,   // ⭐ ADD THIS
  onJoinClub,
  onLeaveClub,
  onDeleteClub,
  onInviteMembers,
  onPromote,
}) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Identify user role
  const currentMember = members.find((m) => m.userId === user?.id);
  const isHost = currentMember?.role === "HOST";
  const isMod = currentMember?.role === "MODERATOR";
  const canManage = isHost || isMod;

  return (
    <aside className="lg:col-span-3 space-y-4">

      {/* =======================================
           My Progress Card (members only)
      ======================================= */}
      {isMember && currentBook && (
        <MyProgressCard
          club={club}
          currentBook={currentBook}
          currentPage={currentPage}
          onOpenProgress={onOpenProgress}
        />
      )}

      {/* =======================================
           Non-member → Join
      ======================================= */}
      {!isMember && (
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
          <h2
            className="text-lg font-semibold text-gray-800 mb-4"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Actions
          </h2>

          <button
            onClick={onJoinClub}
            className="w-full px-4 py-2 rounded bg-[#d9c5a3] hover:bg-[#cbb894] text-sm"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Join Club
          </button>
        </div>
      )}

      {/* =======================================
           Member tools
      ======================================= */}
      {isMember && canManage && (
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
          <h2
            className="text-lg font-semibold text-gray-800 mb-4"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Actions
          </h2>

          {/* ⭐ UPDATE READING GOAL BUTTON HERE */}
          <button
            onClick={onOpenGoalModal}
            className="w-full px-4 py-2 mb-3 rounded border border-[#ddcdb7]
                       bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Update Reading Goal
          </button>

          <button
            onClick={onInviteMembers}
            className="w-full px-4 py-2 mb-3 rounded border border-[#ddcdb7]
                       bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Invite Members
          </button>

          {/* Host-only */}
          {isHost && (
            <>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="w-full px-4 py-2 mb-3 rounded border border-[#ddcdb7]
                           bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Assign Moderator
              </button>

              <button
                onClick={onDeleteClub}
                className="w-full px-4 py-2 rounded border border-red-300 bg-red-100
                           hover:bg-red-200 transition-colors text-sm text-red-700"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Delete Book Club
              </button>
            </>
          )}
        </div>
      )}

      {/* Modal */}
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
