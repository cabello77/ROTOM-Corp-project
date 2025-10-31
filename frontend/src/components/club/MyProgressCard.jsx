export default function MyProgressCard({ club, currentBook, userProgress, onOpenProgress }) {
  if (!currentBook) return null;
  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
      <h3 className="text-base font-semibold text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>
        My Progress
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span style={{ fontFamily: 'Times New Roman, serif' }}>{club.readingGoal}</span>
          <span style={{ fontFamily: 'Times New Roman, serif' }}>{userProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-[#774C30] h-3 rounded-full transition-all" style={{ width: `${userProgress}%` }}></div>
        </div>
      </div>
      <button
        onClick={onOpenProgress}
        className="w-full px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        Update Progress
      </button>
    </div>
  );
}

