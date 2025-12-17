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
    <div className="border border-[#e6dac8] bg-[#faf6ed] rounded p-4" style={{}}>
      {currentBook.cover && (
        <img src={currentBook.cover} alt={currentBook.title} className="w-full mb-3 rounded" />
      )}
      <h3 className="font-semibold text-gray-800 mb-2">{currentBook.title}</h3>
      <p className="text-sm text-gray-600 mb-1">by {currentBook.authors}</p>
      {currentBook.year && <p className="text-xs text-gray-500">Published: {currentBook.year}</p>}
      {currentBook.genre && <p className="text-xs text-gray-500">Genre: {currentBook.genre}</p>}

      {isHost && (
        <button
          onClick={onRemoveBook}
          className="mt-2 w-full px-4 py-2 text-sm rounded border border-red-300 bg-red-50 hover:bg-red-100 text-red-700"
          style={{}}
        >
          Remove Book
        </button>
      )}
    </div>
  );
}

