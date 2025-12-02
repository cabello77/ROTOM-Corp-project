import { getDaysRemainingDays } from "../../utils/date";

export default function MyProgressCard({
  club,
  currentBook,
  currentPage,
  onOpenProgress,
}) {
  if (!currentBook) return null;

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
  const pageNow = currentPage ?? start;

  const pagesRead = Math.max(0, pageNow - start);
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
        {daysRemaining === 1 ? "day" : "days"} left · {percent}% complete · Page{" "}
        {pageNow} of {end}
      </p>

      {/* CLEAN PROGRESS BAR — no marker */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percent}%`,
            background:
              "linear-gradient(to right, #6b4226, #8b5e3c, #b88a5a, #d6b375, #f1d9a3)",
          }}
        ></div>
      </div>

      <button
        onClick={onOpenProgress}
        className="w-full px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] 
                   hover:bg-[#e3d5c2] transition-colors text-sm"
        style={{ fontFamily: "Times New Roman, serif" }}
      >
        Update Progress
      </button>
    </div>
  );
}
