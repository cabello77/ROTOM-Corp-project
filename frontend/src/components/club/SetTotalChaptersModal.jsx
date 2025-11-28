import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function SetTotalChaptersModal({
  isOpen,
  onClose,
  clubId,
  initialValue,
  userId,
  onUpdated,   // ✅ new prop from ClubHome
}) {
  const [input, setInput] = useState(initialValue || "");
  const [loading, setLoading] = useState(false);

  // Keep input synced with prop
  useEffect(() => {
    setInput(initialValue ?? "");
  }, [initialValue]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const value = Number(input);

    if (isNaN(value) || value <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    setLoading(true);

    try {
        if (onUpdated) {
        await onUpdated(value); // ✅ ClubHome now does backend + state
        }
        onClose();
    } catch (err) {
        console.error("Total chapters update error:", err);
        alert("Failed to update total chapters.");
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2
          className="text-lg font-semibold mb-4 text-center"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Set Total Chapters
        </h2>

        <label
          className="block text-sm text-gray-700 mb-2"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Total Chapters
        </label>

        <input
          type="number"
          min={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border border-[#d6c6b2] rounded px-3 py-2 mb-4 text-sm"
          placeholder="Enter total number of chapters"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded border border-[#ddcdb7] bg-[#f5ece0] text-sm"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded bg-[#8b5a2b] text-white text-sm hover:bg-[#73481f] disabled:opacity-60"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
