import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function PastReads({ clubId }) {
  const [pastReads, setPastReads] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPastReads = async () => {
    if (!clubId || isNaN(Number(clubId))) {
      console.warn("PastReads skipped — invalid clubId:", clubId);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/clubs/${clubId}/bookshelf`);

      if (!res.ok) {
        console.error("Failed to fetch past reads:", res.status);
        return;
      }

      const data = await res.json();
      setPastReads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading club past reads:", err);
    } finally {
      setLoading(false);
    }
  };


  // Load on first mount or club change
  useEffect(() => {
    if (!clubId) return;
    setLoading(true);
    loadPastReads();
  }, [clubId]);


  // 🔥 Listen for "club-updated" and refresh automatically
  useEffect(() => {
    const handler = () => {
      setLoading(true);
      loadPastReads();
    };

    window.addEventListener("club-updated", handler);
    return () => window.removeEventListener("club-updated", handler);
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
        <p
          className="text-sm text-gray-600"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Loading past reads...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
      <h2
        className="text-lg font-semibold text-gray-800"
        style={{ fontFamily: "Times New Roman, serif" }}
      >
        Past Reads
      </h2>

      {pastReads.length === 0 ? (
        <p
          className="text-sm text-gray-600"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          This club hasn't finished any books yet.
        </p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {pastReads.map((book) => (
            <div
              key={book.id}
              className="flex items-center space-x-3 p-3 border border-[#ddcdb7] bg-[#faf6ed] rounded hover:bg-[#f1e7d8] transition cursor-pointer"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              <img
                src={book.bookData?.cover || ""}
                alt={book.bookData?.title}
                className="w-12 h-16 object-cover rounded"
              />

              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {book.bookData?.title}
                </p>

                <p className="text-xs text-gray-600">
                  {book.bookData?.authors || "Unknown author"}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Finished on{" "}
                  {new Date(book.finishedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
