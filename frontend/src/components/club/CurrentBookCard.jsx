export default function CurrentBookCard({
  currentBook,
  isHost,
  club,
  goalDeadline,
  onUpdateGoal,
  onRemoveBook,
}) {
  if (!currentBook) return null;
  return (
    <div className="border border-[#e6dac8] bg-[#faf6ed] rounded p-4" style={{ fontFamily: "Times New Roman, serif" }}>
      {currentBook.cover && (
        <img src={currentBook.cover} alt={currentBook.title} className="w-full mb-3 rounded" />
      )}
      <h3 className="font-semibold text-gray-800 mb-2">{currentBook.title}</h3>
      <p className="text-sm text-gray-600 mb-1">by {currentBook.authors}</p>
      {currentBook.year && <p className="text-xs text-gray-500">Published: {currentBook.year}</p>}
      {currentBook.genre && <p className="text-xs text-gray-500">Genre: {currentBook.genre}</p>}

      {isHost && club.readingGoal && (
        <button
          onClick={onUpdateGoal}
          className="mt-3 w-full px-4 py-2 text-sm rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Update Goal
        </button>
      )}

      {isHost && (
        <button
          onClick={onRemoveBook}
          className="mt-2 w-full px-4 py-2 text-sm rounded border border-red-300 bg-red-50 hover:bg-red-100 text-red-700"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Remove Book
        </button>
      )}
    </div>
  );
}

