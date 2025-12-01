import { Link } from "react-router-dom";

function ProgressBar({ current, total }) {
  const percent = total ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;
  return (
    <div className="w-full bg-gray-200 h-2 rounded">
      <div className="bg-blue-500 h-2 rounded" style={{ width: `${percent}%` }} />
    </div>
  );
}

export default function BookModal({ book, friendsActivity, onClose }) {
  if (!book) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[500px] p-6 relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        {/* Book Cover */}
        <div className="flex justify-center mb-4">
          <img
            src={book.bookData?.cover || "/default-book.png"}
            alt={book.bookData?.title}
            className="w-40 h-56 object-cover rounded shadow"
          />
        </div>

        {/* Book Info */}
        <h2 className="text-lg font-semibold text-center mb-1">{book.bookData?.title}</h2>
        <p className="text-sm text-gray-700 italic text-center">
          By {book.bookData?.authors || "Unknown Author"}
        </p>

        {/* Progress Bar for user's current read */}
        {book.currentChapter !== undefined && !book.finishedAt && (
          <div className="mt-4">
            <ProgressBar current={book.currentChapter} total={book.totalChapters} />
          </div>
        )}

        {/* Club Name */}
        {book.clubName && (
          <p className="text-sm text-center mt-3">
            From club:{" "}
            <Link
              to={`/clubs/${book.clubId}`}
              className="text-blue-600 hover:underline"
            >
              {book.clubName}
            </Link>
          </p>
        )}

        {/* Friends Activity */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Friends Who Also Read This
          </h3>

          {(!friendsActivity || friendsActivity.length === 0) ? (
            <p className="text-xs text-gray-500 italic text-center">
              None of your friends have read this yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {friendsActivity.map((f) => {
                let progressPercent = null;
                if (f.pageNumber != null && f.readingGoalPageStart != null && f.readingGoalPageEnd != null) {
                  const totalPages = f.readingGoalPageEnd - f.readingGoalPageStart;
                  const pagesRead = f.pageNumber - f.readingGoalPageStart;
                  progressPercent = Math.max(0, Math.min(100, (pagesRead / totalPages) * 100));
                }

                return (
                  <div key={f.friendId} className="p-2 bg-gray-100 border border-gray-300 rounded">
                    <p className="text-sm font-medium">{f.friendName}</p>

                    {f.finishedAt ? (
                      <p className="text-xs text-gray-600">
                        Finished on {new Date(f.finishedAt).toLocaleDateString()}
                      </p>
                    ) : (
                      <>
                        {f.readingGoal && (
                          <p className="text-xs font-semibold text-gray-700 mt-1">
                            Goal: {f.readingGoal}
                          </p>
                        )}
                        {progressPercent != null && (
                          <div className="mt-1">
                            <ProgressBar current={progressPercent} total={100} />
                            <p className="text-xs text-gray-600 mt-1">
                              {f.pageNumber} / {f.readingGoalPageEnd} pages
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    <p className="text-xs text-gray-500 italic mt-1">From club: {f.clubName}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
