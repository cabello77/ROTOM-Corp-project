import React from "react";

export default function ReadingGoalModal({
  open,
  onClose,
  editReadingGoal,
  editGoalDeadline,
  setEditReadingGoal,
  setEditGoalDeadline,
  readingGoalPageStart,
  readingGoalPageEnd,
  setReadingGoalPageStart,
  setReadingGoalPageEnd,
  onUpdate
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full" style={{ backgroundColor: "#FDFBF6" }}>
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
            Update Reading Goal
          </h2>

          <div className="space-y-4">

            {/* Goal text input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                Goal (e.g., "Read chapters 1-3")
              </label>
              <input
                type="text"
                value={editReadingGoal}
                onChange={(e) => setEditReadingGoal(e.target.value)}
                placeholder="Enter reading goal"
                className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
              />
            </div>

            {/* Page Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
                Pages
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={readingGoalPageStart}
                  onChange={(e) => setReadingGoalPageStart(e.target.value)}
                  placeholder="Start"
                  className="w-1/2 border border-[#ddcdb7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
                />

                <span style={{ fontFamily: "Times New Roman, serif" }}>to</span>

                <input
                  type="number"
                  value={readingGoalPageEnd}
                  onChange={(e) => setReadingGoalPageEnd(e.target.value)}
                  placeholder="End"
                  className="w-1/2 border border-[#ddcdb7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                Deadline
              </label>
              <input
                type="date"
                value={editGoalDeadline}
                onChange={(e) => setEditGoalDeadline(e.target.value)}
                className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                onClose();
                setEditReadingGoal("");
                setEditGoalDeadline("");
                setReadingGoalPageStart("");
                setReadingGoalPageEnd("");
              }}
              className="px-6 py-2 rounded border border-[#ddcdb7] bg-white hover:bg-gray-50 transition-colors"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Cancel
            </button>

            <button
              onClick={onUpdate}
              className="px-6 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
