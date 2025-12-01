import { getDaysRemainingDays } from "../../utils/date";

export default function MyProgressCard({ club, currentBook, currentPage, onOpenProgress }) {
  if (!currentBook) return null;

  // Ensure goal pages and deadline exist
  if (
    club.readingGoalPageStart == null ||
    club.readingGoalPageEnd == null ||
    !club.goalDeadline
  ) {
    return (
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
        <h3
          className="text-base font-semibold text-gray-800"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          My Progress
        </h3>
        <p
          className="text-xs text-gray-500"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          No reading goal set yet.
        </p>
      </div>
    );
  }

  const title = club.currentBookData?.title || "Untitled Book";
  const clubName = club.name || "Book Club";

  const start = club.readingGoalPageStart;
  const end = club.readingGoalPageEnd;
  const pagesRead = Math.max(0, (currentPage ?? start) - start);
  const totalPages = end - start;
  const percent = Math.min(100, Math.round((pagesRead / totalPages) * 100));

  const daysRemaining = getDaysRemainingDays(club.goalDeadline);

  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
      <h3
        className="text-base font-semibold text-gray-800"
        style={{ fontFamily: "Times New Roman, serif" }}
      >
        My Progress
      </h3>

      <p
        className="text-xs font-medium text-gray-700 truncate"
        style={{ fontFamily: "Times New Roman, serif" }}
      >
        {clubName}: <span className="italic">{title}</span> · {daysRemaining}{" "}
        {daysRemaining === 1 ? "day" : "days"} left · {percent}% complete
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-[#774C30] h-3 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      {/* Update Progress Button */}
      <button
        onClick={onOpenProgress}
        className="w-full px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
        style={{ fontFamily: "Times New Roman, serif" }}
      >
        Update Progress
      </button>
    </div>
  );
}


