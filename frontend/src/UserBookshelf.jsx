import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function UserBookshelf({ userId }) {
  const [currentReads, setCurrentReads] = useState([]);
  const [pastReads, setPastReads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBook, setSelectedBook] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const navigate = useNavigate();

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

  return (
    <>
      <div className="space-y-8">

        {/* CURRENT READS */}
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
                  key={entry.bookId}
                  className="flex items-center space-x-3 p-3 border border-[#ddcdb7] bg-[#faf6ed] 
                               rounded hover:bg-[#f1e7d8] transition cursor-pointer"
                  onClick={() => {
                    setSelectedBook(entry.bookData);
                    setIsBookModalOpen(true);
                  }}
                >
                  <img
                    src={entry.bookData?.cover || "/default-book.png"}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PAST READS */}
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
                    setSelectedBook(entry.bookData);
                    setIsBookModalOpen(true);
                  }}
                >
                  <img
                    src={entry.bookData?.cover || "/default-book.png"}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm text-gray-700 font-semibold">
                      {entry.bookData?.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Finished {new Date(entry.finishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ✅ BOOK VIEW MODAL */}
      {isBookModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[500px] p-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setIsBookModalOpen(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-lg"
            >
              ✕
            </button>

            {/* Book Cover */}
            <div className="flex justify-center mb-4">
              <img
                src={selectedBook.cover || "/default-book.png"}
                alt={selectedBook.title}
                className="w-40 h-56 object-cover rounded shadow"
              />
            </div>

            {/* Book Info */}
            <h2 className="text-lg font-semibold text-center mb-2">
              {selectedBook.title}
            </h2>

            <p className="text-sm text-gray-700 italic text-center">
              By {selectedBook.authors || "Unknown Author"}
            </p>

          </div>
        </div>
      )}
    </>
  );
}
