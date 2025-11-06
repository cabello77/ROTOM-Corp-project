import { getDaysRemainingLabel } from "../../utils/date";
import MyProgressCard from "./MyProgressCard";
import JoinClubCard from "./JoinClubCard";

export default function ClubRightSidebar({
  user,
  club,
  isMember,
  currentBook,
  userProgress,
  members,
  onOpenProgress,
  onJoinClub,
  onDeleteClub,
  onLeaveClub,
  onInviteMembers,
}) {
  const isHost = user && club && user.id === club.creatorId;
  const remainingLabel = club?.goalDeadline ? getDaysRemainingLabel(club.goalDeadline) : null;
  // Show My Progress Card for any member or host (the card itself checks if currentBook exists)
  const showMyProgress = (isMember || isHost);

  return (
    <aside className="lg:col-span-3 space-y-4">
      {/* My Progress - visible for both hosts and members */}
      {user && (
        <>
          {showMyProgress ? (
            <MyProgressCard
              club={club}
              currentBook={currentBook}
              userProgress={userProgress}
              onOpenProgress={onOpenProgress}
            />
          ) : !isHost && !isMember ? (
            <JoinClubCard onJoin={onJoinClub} />
          ) : null}
        </>
      )}

      {/* Member Progress */}
      {members.length > 0 && club.readingGoal && (
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
          <h3 className="text-base font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
            Member Progress
          </h3>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                  <span style={{ fontFamily: "Times New Roman, serif" }} className="flex items-center gap-1">
                    {member.user.name}
                    {member.isHost && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800" title="Club Host">
                        ?? Host
                      </span>
                    )}
                  </span>
                  <span style={{ fontFamily: "Times New Roman, serif" }}>{member.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#774C30] h-2 rounded-full transition-all" style={{ width: `${member.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons - visible for all members including hosts */}
      {(isMember || isHost) && (
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
          <h3 className="text-base font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
            Actions
          </h3>
          <div className="space-y-2">
            <button
              type="button"
              className="w-full px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
              style={{ fontFamily: "Times New Roman, serif" }}
              onClick={onInviteMembers}
            >
              Invite Members
            </button>
            {isHost && (
              <button
                type="button"
                onClick={onDeleteClub}
                className="w-full px-4 py-2 rounded border border-red-300 bg-red-50 hover:bg-red-100 transition-colors text-sm text-red-700"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Delete Book Club
              </button>
            )}
            {isMember && !isHost && (
              <button
                type="button"
                onClick={onLeaveClub}
                className="w-full px-4 py-2 rounded border border-red-300 bg-red-50 hover:bg-red-100 transition-colors text-sm text-red-700"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Leave Book Club
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

