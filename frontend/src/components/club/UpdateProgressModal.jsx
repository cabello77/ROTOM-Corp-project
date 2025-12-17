import { useState, useEffect } from "react";

export default function UpdateProgressModal({
  open,
  onClose,
  club,
  userProgress,
  onUpdate,
}) {
  if (!open) return null;

  // Allowed range
  const start = club?.readingGoalPageStart ?? 0;
  const end = club?.readingGoalPageEnd ?? 0;

  // Local editable field
  const [pageInput, setPageInput] = useState(userProgress ?? start);

  // Reset when opened
  useEffect(() => {
    setPageInput(userProgress ?? start);
  }, [userProgress, start, open]);

  const handleSubmit = async () => {
    const num = Number(pageInput);

    // Validate the input is a number and within the page range
    if (isNaN(num)) {
      alert("Please enter a valid number.");
      return;
    }

    if (num < start || num > end) {
      alert(`Page must be between ${start} and ${end}.`);
      return;
    }

    // Call onUpdate function to update the progress in the parent
    await onUpdate(num); // This triggers the update and passes the new page number

    // Close the modal after updating progress
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full"
        style={{ backgroundColor: "#FDFBF6" }}
      >
        <div className="p-6 space-y-4">
          <h2
            className="text-2xl font-semibold text-gray-800"
            style={{}}
          >
            Update Reading Progress
          </h2>

          <p
            className="text-sm text-gray-600"
            style={{}}
          >
            Assigned reading: pages {start} → {end}
          </p>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              style={{}}
            >
              What page are you currently on?
            </label>

            <input
              type="number"
              className="w-full border rounded p-2"
              value={pageInput}
              min={start}
              max={end}
              onChange={(e) => setPageInput(e.target.value)}
              style={{}}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded border border-[#ddcdb7] bg-white hover:bg-gray-50 transition-colors"
              style={{}}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
              style={{}}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
