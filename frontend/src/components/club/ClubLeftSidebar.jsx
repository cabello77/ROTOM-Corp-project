import CurrentBookCard from "./CurrentBookCard";
import PastReads from "./PastReads";
import MembersRoles from "./MembersRoles";

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
}) {
  return (
    <aside className="lg:col-span-3 space-y-4">
      
      {/* CURRENT READ SECTION */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-semibold text-gray-800"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Current Read
          </h2>

          {/* ASSIGN BOOK BUTTON */}
          {isHost && !currentBook && (
            <button
              onClick={onOpenAssign}
              className="w-8 h-8 rounded-full border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors flex items-center justify-center"
              style={{ fontFamily: "Times New Roman, serif" }}
              title="Assign Book"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}

          {/* REMOVE BOOK BUTTON */}
          {isHost && currentBook && (
            <button
              onClick={async () => {
                if (window.confirm("Remove the current book?")) {
                  await onRemoveBook();
                }
              }}
              className="w-8 h-8 rounded-full border border-red-300 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center"
              style={{ fontFamily: "Times New Roman, serif" }}
              title="Remove Book"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {currentBook ? (
            <div>
              <CurrentBookCard
                currentBook={currentBook}
                isHost={isHost}
                club={club}
                goalDeadline={goalDeadline}
                onUpdateGoal={onOpenUpdateGoal}
                onRemoveBook={onRemoveBook}
              />

              {/* FINISH BOOK BUTTON */}
              {isHost && (
                <button
                  onClick={async () => {
                    if (window.confirm("Mark this book as finished?")) {
                      await onFinishBook();
                    }
                  }}
                  className="mt-3 w-full text-center px-4 py-2 rounded border border-green-300 bg-green-50 hover:bg-green-100 transition-colors text-sm text-gray-800"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  Finish Book
                </button>
              )}
            </div>
          ) : (
            <div
              className="text-center py-4 border border-[#e6dac8] bg-[#faf6ed] rounded"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              <p className="text-sm text-gray-600">
                {isHost ? "Click + to assign a book" : "No book assigned yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PAST READS (DYNAMIC) */}
      <PastReads clubId={club.id} />

      {/* MEMBERS */}
      <MembersRoles members={members} />
    </aside>
  );
}
