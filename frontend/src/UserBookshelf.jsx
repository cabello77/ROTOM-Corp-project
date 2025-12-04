import { useEffect, useState } from "react";
import BookModal from "./BookModal"; // Import the BookModal component

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function UserBookshelf({ userId }) {
  const [currentReads, setCurrentReads] = useState([]);
  const [pastReads, setPastReads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedBook, setSelectedBook] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [friendsActivity, setFriendsActivity] = useState([]); // Assuming we fetch friends' activity data here

  const loadBookshelf = async () => {
    try {
      const [curRes, pastRes] = await Promise.all([
        fetch(`${API_BASE}/api/users/${userId}/bookshelf/current`),
        fetch(`${API_BASE}/api/users/${userId}/bookshelf/past`),
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

  // Loading state
  if (loading) {
    return (
      <p className="text-sm text-gray-600" style={{}}>
        Loading bookshelf...
      </p>
    );
  }

  // Handle opening the modal
  const openBookModal = (book) => {
    setSelectedBook(book);
    // Fetch friends' activity for this book (you can customize this based on your needs)
    setFriendsActivity([
      {
        friendName: "John Doe",
        pageNumber: 50,
        readingGoalPageStart: 0,
        readingGoalPageEnd: 100,
        clubName: "Book Club A",
        finishedAt: null,
        readingGoal: "Read 100 pages",
      },
    ]); // Example activity data
    setIsBookModalOpen(true);
  };

  return (
    <>
      <div className="space-y-8">
        {/* CURRENT READS */}
        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-3" style={{}}>
            Current Reads
          </h3>

          {currentReads.length === 0 ? (
            <p className="text-sm text-gray-600">You don’t have any current reads.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {currentReads.map((entry) => (
                <div
                  key={entry.bookId}
                  className="flex items-center space-x-3 p-3 border border-[#ddcdb7] bg-[#faf6ed] rounded hover:bg-[#f1e7d8] transition cursor-pointer"
                  style={{}}
                  onClick={() => openBookModal(entry)}
                >
                  <img
                    src={entry.bookData?.cover || "/default-book.png"}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm text-gray-700 font-semibold">{entry.bookData?.title}</p>
                    <p className="text-sm text-gray-600 mt-1">Assigned by: {entry.clubName}</p>
                    <p className="text-xs text-gray-600">Assigned {new Date(entry.assignedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PAST READS */}
        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-3" style={{}}>
            Past Reads
          </h3>

          {pastReads.length === 0 ? (
            <p className="text-sm text-gray-600">No past reads yet.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {pastReads.map((entry) => (
                <div
                  key={entry.bookId}
                  className="flex items-center space-x-3 p-3 border border-[#ddcdb7] bg-[#faf6ed] rounded hover:bg-[#f1e7d8] transition cursor-pointer"
                  style={{}}
                  onClick={() => openBookModal(entry)}
                >
                  <img
                    src={entry.bookData?.cover || "/default-book.png"}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm text-gray-700 font-semibold">{entry.bookData?.title}</p>
                    <p className="text-sm text-gray-600 mt-1">Finished {new Date(entry.finishedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Book Modal */}
      {isBookModalOpen && selectedBook && (
        <BookModal book={selectedBook} friendsActivity={friendsActivity} onClose={() => setIsBookModalOpen(false)} />
      )}
    </>
  );
}
