// UserBookshelf.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function UserBookshelf({ userId }) {
  const [currentReads, setCurrentReads] = useState([]);
  const [pastReads, setPastReads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function loadBooks() {
      try {
        const [currentRes, pastRes] = await Promise.all([
          fetch(`${API_BASE}/api/users/${userId}/bookshelf/current`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          fetch(`${API_BASE}/api/users/${userId}/bookshelf/past`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ]);

        const [currentData, pastData] = await Promise.all([
          currentRes.json(),
          pastRes.json(),
        ]);

        setCurrentReads(currentData || []);
        setPastReads(pastData || []);
      } catch (err) {
        console.error("Error loading bookshelf:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, [userId]);

  if (loading) {
    return <p className="text-gray-600">Loading bookshelf...</p>;
  }

  return (
    <div className="space-y-10">

      {/* CURRENT READS */}
      <section>
        <h3
          className="text-lg font-semibold text-gray-800 mb-3"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Current Reads
        </h3>

        {currentReads.length === 0 ? (
          <p
            className="text-sm text-gray-600"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            You don’t have any current reads.
          </p>
        ) : (
          <div className="space-y-4">
            {currentReads.map((entry) => (
              <div
                key={`${entry.clubId}-${entry.bookId}`}
                className="border border-[#e3d8c8] bg-[#f9f4ea] rounded-lg p-4 shadow-sm"
              >
                <p
                  className="text-lg font-semibold text-gray-800"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  {entry.bookData?.title || "Untitled Book"}
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  Assigned by:{" "}
                  <Link
                    to={`/clubs/${entry.clubId}`}
                    className="text-blue-700 hover:underline"
                  >
                    Book Club #{entry.clubId}
                  </Link>
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Assigned on: {new Date(entry.assignedAt).toLocaleDateString()}
                </p>

                <Link
                  to={`/clubs/${entry.clubId}`}
                  className="inline-block mt-3 px-3 py-1 border border-[#d7c4a9] bg-[#efe6d7]
                  rounded hover:bg-[#e3d5c2] transition text-sm text-gray-800"
                >
                  View Club
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PAST READS */}
      <section>
        <h3
          className="text-lg font-semibold text-gray-800 mb-3"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Past Reads
        </h3>

        {pastReads.length === 0 ? (
          <p
            className="text-sm text-gray-600"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            No past reads yet.
          </p>
        ) : (
          <div className="space-y-4">
            {pastReads.map((entry) => (
              <div
                key={`${entry.clubId}-${entry.bookId}-${entry.finishedAt}`}
                className="border border-[#e3d8c8] bg-[#f9f4ea] rounded-lg p-4 shadow-sm"
              >
                <p
                  className="text-lg font-semibold text-gray-800"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  {entry.bookData?.title || "Untitled Book"}
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  Read in:{" "}
                  <Link
                    to={`/clubs/${entry.clubId}`}
                    className="text-blue-700 hover:underline"
                  >
                    Book Club #{entry.clubId}
                  </Link>
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Finished on:{" "}
                  {entry.finishedAt
                    ? new Date(entry.finishedAt).toLocaleDateString()
                    : "Unknown date"}
                </p>

                <Link
                  to={`/clubs/${entry.clubId}`}
                  className="inline-block mt-3 px-3 py-1 border border-[#d7c4a9] bg-[#efe6d7]
                  rounded hover:bg-[#e3d5c2] transition text-sm text-gray-800"
                >
                  View Club
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
