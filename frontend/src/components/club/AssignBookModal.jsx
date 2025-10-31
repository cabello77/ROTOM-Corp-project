export default function AssignBookModal({
  open,
  onClose,
  searchQuery,
  setSearchQuery,
  handleSearch,
  searchResults,
  selectedBook,
  handleSelectBook,
  bookDetails,
  setBookDetails,
  readingGoal,
  setReadingGoal,
  goalDeadline,
  setGoalDeadline,
  handleAssignBook,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#FDFBF6" }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
              Assign Book to Club
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Section */}
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for a book..."
                className="flex-1 border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
              />
              <button onClick={handleSearch} className="px-4 py-2 rounded-lg border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors" style={{ fontFamily: "Times New Roman, serif" }}>
                Search
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((book, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectBook(book)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${selectedBook === book ? "bg-[#e3d5c2] border-[#774C30]" : "bg-[#faf6ed] border-[#ddcdb7] hover:bg-[#efe6d7]"}`}
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    <div className="flex gap-3">
                      {book.cover && <img src={book.cover} alt={book.title} className="w-12 h-16 object-cover rounded" />}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{book.title}</h3>
                        <p className="text-sm text-gray-600">by {book.author}</p>
                        {book.first_publish_year && <p className="text-xs text-gray-500">Published: {book.first_publish_year}</p>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Book Details Form */}
          {selectedBook && (
            <div className="border-t border-[#e3d8c8] pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
                Book Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                    Title
                  </label>
                  <input type="text" value={bookDetails.title} onChange={(e) => setBookDetails({ ...bookDetails, title: e.target.value })} className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                    Author(s)
                  </label>
                  <input type="text" value={bookDetails.authors} onChange={(e) => setBookDetails({ ...bookDetails, authors: e.target.value })} className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                    Cover Image URL
                  </label>
                  <input type="text" value={bookDetails.cover} onChange={(e) => setBookDetails({ ...bookDetails, cover: e.target.value })} className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                    Description/Summary
                  </label>
                  <textarea value={bookDetails.description} onChange={(e) => setBookDetails({ ...bookDetails, description: e.target.value })} rows={3} className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                      Publication Year
                    </label>
                    <input type="text" value={bookDetails.year} onChange={(e) => setBookDetails({ ...bookDetails, year: e.target.value })} className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                      Genre/Category
                    </label>
                    <input type="text" value={bookDetails.genre} onChange={(e) => setBookDetails({ ...bookDetails, genre: e.target.value })} className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }} />
                  </div>
                </div>

                {/* Reading Goal Section */}
                <div className="border-t border-[#e3d8c8] pt-4">
                  <h4 className="text-base font-semibold text-gray-800 mb-3" style={{ fontFamily: "Times New Roman, serif" }}>
                    Reading Goal
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                        Goal (e.g., "Read chapters 1-3")
                      </label>
                      <input type="text" value={readingGoal} onChange={(e) => setReadingGoal(e.target.value)} placeholder="Enter reading goal" className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                        Deadline
                      </label>
                      <input type="date" value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="px-6 py-2 rounded border border-[#ddcdb7] bg-white hover:bg-gray-50 transition-colors" style={{ fontFamily: "Times New Roman, serif" }}>
                  Cancel
                </button>
                <button onClick={handleAssignBook} className="px-6 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors" style={{ fontFamily: "Times New Roman, serif" }}>
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

