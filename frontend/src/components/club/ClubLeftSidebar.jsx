import CurrentBookCard from "./CurrentBookCard";
import PastReads from "./PastReads";
import MembersRoles from "./MembersRoles";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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


export default function ClubLeftSidebar({
  isHost,
  club,
  currentBook,
  goalDeadline,
  members,
  onOpenAssign,
  onOpenUpdateGoal,
  onRemoveBook,
  onFinishBook,
  currentUser,
}) {
  const [chapterInput, setChapterInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const currentMember = members.find(m => m.userId === currentUser?.id);
  const isMod = currentMember?.role === "MODERATOR";
  const canManage = isHost || isMod;

  const hasCurrentRead = !!currentBook;
  const currentChapter = currentMember?.currentChapter ?? 0;
  const total = club?.totalChapters ?? 0;

  const progressPercent =
    total > 0 ? Math.min(100, (currentChapter / total) * 100) : 0;

  // ===============================
  // UPDATE CHAPTER PROGRESS
  // ===============================
  const handleUpdateChapter = async () => {
    const newChapter = Number(chapterInput);

    if (isNaN(newChapter) || newChapter < 0) {
      alert("Enter a valid chapter number.");
      return;
    }

    if (!currentUser) {
      alert("Not logged in.");
      return;
    }

    setIsUpdating(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/clubs/${club.id}/members/${currentUser.id}/progress`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chapter: newChapter }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("API ERROR:", data);
        alert(data.error || "Failed to update progress.");
        return;
      }

      console.log("Chapter updated:", data);

      window.location.reload();

    } catch (err) {
      console.error("FETCH ERROR:", err);
      alert("Backend not reachable.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <aside className="lg:col-span-3 space-y-4">
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Current Read</h2>

          {/* Host + Mod: Assign Book */}
          {canManage && !currentBook && (
            <button
              onClick={onOpenAssign}
              className="w-8 h-8 rounded-full border bg-[#efe6d7] hover:bg-[#e3d5c2]"
              title="Assign Book"
            >
              +
            </button>
          )}
        </div>

        <div className="space-y-3">
          {currentBook && currentUser && (
            <div>
              <CurrentBookCard
                currentBook={currentBook}
                isHost={isHost}
                club={club}
                goalDeadline={goalDeadline}
                onUpdateGoal={onOpenUpdateGoal}
                onRemoveBook={onRemoveBook}
              />

              {/* =====================
                 Chapter Progress
              ====================== */}
              {typeof club?.totalChapters === "number" && (
                <div className="mt-4 space-y-3">

                  <div className="flex justify-between text-sm text-gray-700 font-medium">
                    <span>Your Progress</span>
                    <span>{currentChapter} / {total}</span>
                  </div>

                  <div className="w-full bg-[#ede3d2] rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-[#8b5a2b] h-3 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-600 italic text-center">
                    {currentChapter} chapters read
                  </p>

                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      min="0"
                      max={total}
                      value={chapterInput}
                      onChange={(e) => setChapterInput(e.target.value)}
                      className="flex-1 border border-[#d6c6b2] rounded px-3 py-1 text-sm"
                      placeholder="Update chapter..."
                    />

                    <button
                      onClick={handleUpdateChapter}
                      disabled={isUpdating}
                      className="px-3 py-1 text-sm bg-[#8b5a2b] text-white rounded hover:bg-[#73481f] disabled:opacity-50"
                    >
                      {isUpdating ? "Saving..." : "Update"}
                    </button>
                  </div>
                </div>
              )}

              {/* =====================
                 Current Goal
              ====================== */}
              {hasCurrentRead && (club.readingGoal || club.goalDeadline) && (
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
                    </div>

              )}

              {/* =====================
                 Finish Book (Host + Mod)
              ====================== */}
              {canManage && (
                <button
                  onClick={async () => {
                    if (window.confirm("Mark this book as finished?")) {
                      await onFinishBook();
                      window.dispatchEvent(new Event("club-updated"));
                    }
                  }}
                  className="mt-3 w-full text-center px-4 py-2 rounded border border-green-300 bg-green-50 hover:bg-green-100 text-sm"
                >
                  Finish Book
                </button>
              )}
            </div>
          )}

          {!currentBook && (
            <div className="text-center py-4 border border-[#e6dac8] bg-[#faf6ed] rounded">
              <p className="text-sm text-gray-600">
                {canManage ? "Click + to assign a book" : "No book assigned yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      {club?.id && <PastReads clubId={club.id} />}
      <MembersRoles members={members} />
    </aside>
  );
}
