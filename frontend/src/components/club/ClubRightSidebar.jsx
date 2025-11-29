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
  onOpenGoalModal,
  onOpenChaptersModal,
}) {
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // ------------------------------
  // Identify user's membership + role
  // ------------------------------
  const currentMember = members.find((m) => m.userId === user?.id);

  const isHost = currentMember?.role === "HOST";
  const isMod = currentMember?.role === "MODERATOR";

  // Host or Moderator
  const canManage = isHost || isMod;

  return (
    <aside className="lg:col-span-3 space-y-4">

      {/* ======================================================
            NON-MEMBER VIEW → Only show "Join Club"
      ====================================================== */}
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

      {/* ======================================================
            MEMBER VIEW → Only Host/Mod See Actions
            (Members with role MEMBER see *nothing*)
      ====================================================== */}
      {isMember && canManage && (
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">

          <h2
            className="text-lg font-semibold text-gray-800 mb-4"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Actions
          </h2>

          {/* -------- Host + Mod Shared Actions -------- */}
          <>
            {/* Invite Members */}
            <button
              onClick={onInviteMembers}
              className="w-full px-4 py-2 mb-3 rounded border border-[#ddcdb7]
                         bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Invite Members
            </button>

            {/* Set/Edit Reading Goal */}
            <button
              onClick={onOpenGoalModal}
              className="w-full px-4 py-2 mb-3 rounded border border-[#ddcdb7]
                         bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              {club?.readingGoal ? "Edit Reading Goal" : "Set Reading Goal"}
            </button>

            {/* Set/Edit Total Chapters */}
            <button
              onClick={onOpenChaptersModal}
              className="w-full px-4 py-2 mb-3 rounded border border-[#ddcdb7]
                         bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              {club?.totalChapters
                ? `Edit Total Chapters (${club.totalChapters})`
                : "Set Total Chapters"}
            </button>
          </>

          {/* -------- HOST ONLY Actions -------- */}
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

      {/* ======================================================
            Assign Moderator Modal
      ====================================================== */}
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
