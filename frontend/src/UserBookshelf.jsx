import { useState, useEffect } from "react";  // Add this import statement
import { useNavigate, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

/* ---------------------------------------------------
   PROGRESS BAR COMPONENT
--------------------------------------------------- */
function ProgressBar({ current, total }) {
  if (!total || total <= 0) return null;

  const percent = Math.min(100, (current / total) * 100);

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{current} / {total} chapters</span>
        <span>{Math.round(percent)}%</span>
      </div>

      <div className="w-full bg-[#ede3d2] rounded-full h-2 overflow-hidden">
        <div
          className="bg-[#8b5a2b] h-2 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------
   USER BOOKSHELF COMPONENT
--------------------------------------------------- */
export default function UserBookshelf({ userId }) {

  const [currentReads, setCurrentReads] = useState([]);
  const [pastReads, setPastReads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [friendsActivity, setFriendsActivity] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const navigate = useNavigate();

  /* ----------------------------------------------
     LOAD FRIENDS ACTIVITY 
  ---------------------------------------------- */
  const loadFriendsActivity = async (bookId) => {
    try {
      setFriendsActivity([]); // reset to prevent stale data

      const res = await fetch(
        `${API_BASE}/api/books/${bookId}/friends-activity/${userId}`
      );

      const data = await res.json();

      console.log("Friend activity:", data);

      setFriendsActivity(data);
    } catch (err) {
      console.error("Error loading friend activity:", err);
    }
  };

  /* ----------------------------------------------
     LOAD CURRENT + PAST BOOKS
  ---------------------------------------------- */
  const loadBookshelf = async () => {
    try {
      const [curRes, pastRes] = await Promise.all([
        fetch(`${API_BASE}/api/users/${userId}/bookshelf/current`),
        fetch(`${API_BASE}/api/users/${userId}/bookshelf/past`)
      ]);

      const curData = await curRes.json();
      const pastData = await pastRes.json();

      if (curRes.ok) setCurrentReads(curData);
      if (pastRes.ok) setPastReads(pastData);

    } catch (err) {
      console.error("Error loading user bookshelf:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookshelf();
  }, [userId]);

  if (loading) {
    return (
      <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
        Loading bookshelf...
      </p>
    );
  }

  /* ===========================================================
      RENDER
  ============================================================ */
  return (
    <>
      <div className="space-y-8">

        {/* ===================================
            CURRENT READS
        ==================================== */}
        <section>
          <h3
            className="text-base font-semibold text-gray-800 mb-3"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Current Reads
          </h3>

          {currentReads.length === 0 ? (
            <p className="text-sm text-gray-600">You don’t have any current reads.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {currentReads.map((entry) => (
                <div
                  key={`${entry.clubId}-${entry.bookId}`}
                  className="flex items-center space-x-3 p-3 border border-[#ddcdb7] bg-[#faf6ed] 
                             rounded hover:bg-[#f1e7d8] transition cursor-pointer"
                  onClick={() => {
                    setSelectedBook(entry);
                    loadFriendsActivity(entry.bookId);
                    setIsBookModalOpen(true);
                  }}
                >
                  <img
                    src={entry.bookData?.cover || "/default-book.png"}
                    className="w-12 h-16 object-cover rounded"
                  />

                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-semibold">
                      {entry.bookData?.title}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      Assigned by:{" "}
                      <Link
                        to={`/clubs/${entry.clubId}`}
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {entry.clubName}
                      </Link>
                    </p>

                    <p className="text-xs text-gray-600">
                      Assigned {new Date(entry.assignedAt).toLocaleDateString()}
                    </p>

                    <ProgressBar
                      current={entry.currentChapter}
                      total={entry.totalChapters}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===================================
            PAST READS
        ==================================== */}
        <section>
          <h3
            className="text-base font-semibold text-gray-800 mb-3"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Past Reads
          </h3>

          {pastReads.length === 0 ? (
            <p className="text-sm text-gray-600">No past reads yet.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {pastReads.map((entry) => (
                <div
                  key={entry.bookId}
                  className="flex items-center space-x-3 p-3 border border-[#ddcdb7] bg-[#faf6ed] 
                            rounded hover:bg-[#f1e7d8] transition cursor-pointer"
                  onClick={() => {
                    setSelectedBook(entry);
                    loadFriendsActivity(entry.bookId);
                    setIsBookModalOpen(true);
                  }}
                >
                  <img
                    src={entry.bookData?.cover || "/default-book.png"}
                    className="w-12 h-16 object-cover rounded"
                  />

                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-semibold">
                      {entry.bookData?.title}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      Finished {new Date(entry.finishedAt).toLocaleDateString()}
                    </p>
                    {/* Remove progress bar for past reads */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ======================================
          BOOK MODAL
      ======================================= */}
      {isBookModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[500px] p-6 relative">

            {/* Close Button */}
            <button
              onClick={() => {
                setIsBookModalOpen(false);
                setFriendsActivity([]); // reset when closing
              }}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-lg"
            >
              ✕
            </button>

            {/* Book Cover */}
            <div className="flex justify-center mb-4">
              <img
                src={selectedBook.bookData?.cover || "/default-book.png"}
                alt={selectedBook.bookData?.title}
                className="w-40 h-56 object-cover rounded shadow"
              />
            </div>

            {/* Book Info */}
            <h2 className="text-lg font-semibold text-center mb-1">
              {selectedBook.bookData?.title}
            </h2>

            <p className="text-sm text-gray-700 italic text-center">
              By {selectedBook.bookData?.authors || "Unknown Author"}
            </p>

            {/* Progress Bar (Only for current reads) */}
            {selectedBook.currentChapter !== undefined && !selectedBook.finishedAt && (
              <div className="mt-4">
                <ProgressBar
                  current={selectedBook.currentChapter}
                  total={selectedBook.totalChapters}
                />
              </div>
            )}

            {/* Club Name */}
            {selectedBook.clubName && (
              <p className="text-sm text-center mt-3">
                From club:{" "}
                <Link
                  to={`/clubs/${selectedBook.clubId}`}
                  className="text-blue-600 hover:underline"
                >
                  {selectedBook.clubName}
                </Link>
              </p>
            )}

            {/* FRIENDS ACTIVITY */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Friends Who Also Read This
              </h3>

              {friendsActivity.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center">
                  None of your friends have read this yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {friendsActivity.map((f) => (
                    <div
                      key={f.friendId}
                      className="p-2 bg-gray-100 border border-gray-300 rounded"
                    >
                      <p className="text-sm font-medium">
                        {f.friendName}
                      </p>

                      {f.finishedAt ? (
                        <p className="text-xs text-gray-600">
                          Finished on {new Date(f.finishedAt).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-600">
                          Progress: {f.currentChapter} / {f.totalChapters}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 italic">
                        From club: {f.clubName}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
