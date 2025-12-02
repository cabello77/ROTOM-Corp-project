import { useState, useEffect } from "react";

export default function UpdateProgressModal({
  open,
  onClose,
  userProgress,
  onUpdate,
}) {
  // local slider state
  const [value, setValue] = useState(userProgress ?? 0);

  // when modal opens or parent progress changes, sync the slider
  useEffect(() => {
    if (open) {
      setValue(userProgress ?? 0);
    }
  }, [open, userProgress]);

  if (!open) return null;

  const handleSliderChange = (v) => {
    setValue(v);
    // live preview to parent (updates MyProgressCard bar)
    onUpdate(v, { preview: true });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full"
        style={{ backgroundColor: "#FDFBF6" }}
      >
        <div className="p-6">
          <h2
            className="text-2xl font-semibold text-gray-800 mb-4"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Update Progress
          </h2>

          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Progress (0–100%)
              </label>

              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) =>
                  handleSliderChange(Number(e.target.value))
                }
                className="w-full"
              />

              <div
                className="text-center text-sm text-gray-600 mt-2"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {value}%
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded border border-[#ddcdb7] bg-white hover:bg-gray-50 transition-colors"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Cancel
            </button>
            <button
              onClick={() => onUpdate(value)}
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

