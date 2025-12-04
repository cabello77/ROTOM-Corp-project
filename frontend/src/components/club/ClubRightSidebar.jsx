import { useState, useEffect } from "react";
import AssignModeratorModal from "./AssignModeratorModal";

function formatDeadline(deadline) {
  if (!deadline || typeof deadline !== "string") return null;

  const parts = deadline.split("-");
  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ClubRightSidebar({
  user,
  club,
  isMember,
  currentBook,
  members = [],
  onOpenGoalModal,
  onJoinClub,
  onLeaveClub,
  onDeleteClub,
  onInviteMembers,
  onPromote,
}) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // Store the user's current page
  const [tempPage, setTempPage] = useState(0); // Temporary page number for input

  // Identify currentMember and their role
  const currentMember = members.find((m) => m.userId === user?.id);

  useEffect(() => {
    if (currentMember) {
      const isHost = currentMember?.role === "HOST";
      const isMod = currentMember?.role === "MODERATOR";
      setCanManage(isHost || isMod); // Set canManage based on role
    } else {
      setCanManage(false); // Default to false if currentMember is undefined
    }

    // Fetch the user's current progress from the database
    if (user && club) {
      fetch(`/api/progress/${user.id}/${club.id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.page_number) {
            setCurrentPage(data.page_number); // Set the current page number from the database
          }
        })
        .catch((error) => console.error("Error fetching progress:", error));
    }
  }, [currentMember, user, club]);

  // Calculate reading progress
  const calculateProgress = () => {
    if (
      club.readingGoalPageStart != null &&
      club.readingGoalPageEnd != null &&
      currentPage != null
    ) {
      const totalPages = club.readingGoalPageEnd - club.readingGoalPageStart;
      const pagesRead = currentPage - club.readingGoalPageStart;

      // Ensure that progress is 100% when currentPage is equal to or greater than readingGoalPageEnd
      return Math.min((pagesRead / totalPages) * 100, 100);
    }
    return 0;
  };

  const progress = calculateProgress();

  const handlePageChange = (event) => {
    const page = parseInt(event.target.value, 10);
    setTempPage(page); // Update the temporary page number while typing
  };

  const handleUpdateProgress = () => {
    // Validation check when the button is clicked
    if (
      tempPage < club.readingGoalPageStart ||
      tempPage > club.readingGoalPageEnd
    ) {
      alert("Please enter a valid page number within the goal range.");
      return;
    }

    setCurrentPage(tempPage); // Update current page when the button is clicked

    // Send the updated progress to the backend (POST request)
    fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        clubId: club.id,
        pageNumber: tempPage,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Progress updated:', data);
      })
      .catch((error) => console.error('Error updating progress:', error));
  };

  return (
    <aside className="lg:col-span-3 space-y-4">
      {/* Current Goal (Moved here from Left Sidebar) */}
      {isMember && (club.readingGoal || club.goalDeadline) && (
        <div className="mt-4 bg-[#f8f3ea] border border-[#ddcdb7] rounded-lg p-3 text-sm space-y-1">
          <p>📖 <strong>Reading:</strong> {club.currentBookData?.title}</p>

          {/* Pages line */}
          {club.readingGoalPageStart != null && club.readingGoalPageEnd != null && (
            <p>📄 <strong>Pages:</strong> {club.readingGoalPageStart}-{club.readingGoalPageEnd}</p>
          )}

          {club.readingGoal && <p>🎯 <strong>Goal:</strong> {club.readingGoal}</p>}
          {club.goalDeadline && (
            <p>📅 <strong>Deadline:</strong> {formatDeadline(club.goalDeadline)}</p>
          )}

          {/* Progress Bar */}
          {club.readingGoalPageStart != null && club.readingGoalPageEnd != null && (
            <div className="mt-4">
              <label htmlFor="progress-bar" className="block text-sm font-medium">
                📊 Reading Progress:
              </label>
              <div
                className="w-full h-4 rounded"
                style={{
                  backgroundColor: '#e0d7c6', // Darker background (lighter than the progress bar)
                  borderRadius: '8px', // Rounded corners for the container
                }}
              >
                <div
                  style={{
                    width: `${progress}%`, // Dynamic width based on progress
                    backgroundColor: '#a67c52', // Darker brownish hue for the progress fill
                    borderRadius: '8px', // Rounded corners
                    height: '100%', // Full height for the bar
                    transition: 'width 1s ease-in-out', // Smooth transition effect
                  }}
                />
              </div>
              <p className="text-center text-sm font-semibold mt-2">
                {Math.round(progress)}% Complete
              </p>
            </div>
          )}

          {/* Input to update progress */}
          <div className="mt-4">
            <label htmlFor="page-input" className="block text-sm font-medium">
              📖 Update Your Progress (Page Number):
            </label>
            <input
              type="number"
              id="page-input"
              value={tempPage}
              min={club.readingGoalPageStart}
              max={club.readingGoalPageEnd}
              onChange={handlePageChange}
              className="w-full mt-2 p-2 rounded border border-[#ddd]"
            />
            <button
              onClick={handleUpdateProgress} // Updates the progress when clicked
              className="mt-2 w-full px-4 py-2 rounded bg-[#d9c5a3] hover:bg-[#cbb894] text-sm"
            >
              Update Progress
            </button>
          </div>
        </div>
      )}

      {/* Non-member → Join */}
      {!isMember && (
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4" style={{}}>
            Actions
          </h2>

          <button
            onClick={onJoinClub}
            className="w-full px-4 py-2 rounded bg-[#d9c5a3] hover:bg-[#cbb894] text-sm"
            style={{}}
          >
            Join Club
          </button>
        </div>
      )}

      {/* Member tools */}
      {isMember && canManage && (
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4" style={{}}>
            Actions
          </h2>

          {/* Update Reading Goal Button */}
          <button
            onClick={onOpenGoalModal}
            className="w-full px-4 py-2 mb-3 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
            style={{}}
          >
            Update Reading Goal
          </button>

          <button
            onClick={onInviteMembers}
            className="w-full px-4 py-2 mb-3 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
            style={{}}
          >
            Invite Members
          </button>

          {/* Host-only */}
          {currentMember?.role === "HOST" && (
            <>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="w-full px-4 py-2 mb-3 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
                style={{}}
              >
                Assign Moderator
              </button>

              <button
                onClick={onDeleteClub}
                className="w-full px-4 py-2 rounded border border-red-300 bg-red-100 hover:bg-red-200 transition-colors text-sm text-red-700"
                style={{}}
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
