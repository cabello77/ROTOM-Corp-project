import AssignBookModal from "./AssignBookModal";
import UpdateProgressModal from "./UpdateProgressModal";
import ReadingGoalModal from "./ReadingGoalModal";
import ProfileEdit from "../../ProfileEdit";

export default function ClubModals({
  club,   // required

  // Assign book
  isModalOpen,
  setIsModalOpen,
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

  // Page range
  readingGoalPageStart,
  setReadingGoalPageStart,
  readingGoalPageEnd,
  setReadingGoalPageEnd,

  handleAssignBook,

  // Progress update
  isProgressModalOpen,
  setIsProgressModalOpen,
  userProgress,
  setUserProgress,
  handleUpdateProgress,

  // Goal modal
  isGoalModalOpen,
  setIsGoalModalOpen,
  editReadingGoal,
  setEditReadingGoal,
  editGoalDeadline,
  setEditGoalDeadline,
  handleUpdateGoal,

  // Profile edit
  isEditModalOpen,
  handleCloseEditModal,
  user,
  handleSaveProfile,
}) {
  const resetAssignState = () => {
    setIsModalOpen(false);
    setSearchQuery("");
    setSelectedBook(null);
    setBookDetails({
      title: "",
      authors: "",
      cover: "",
      description: "",
      year: "",
      genre: "",
    });
    setReadingGoal("");
    setGoalDeadline("");
    setReadingGoalPageStart("");
    setReadingGoalPageEnd("");
  };

  return (
    <>
      {/* Assign Book Modal */}
      <AssignBookModal
        open={isModalOpen}
        onClose={resetAssignState}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        searchResults={searchResults}
        selectedBook={selectedBook}
        handleSelectBook={handleSelectBook}
        bookDetails={bookDetails}
        setBookDetails={setBookDetails}
        readingGoal={readingGoal}
        setReadingGoal={setReadingGoal}
        goalDeadline={goalDeadline}
        setGoalDeadline={setGoalDeadline}
        readingGoalPageStart={readingGoalPageStart}
        setReadingGoalPageStart={setReadingGoalPageStart}
        readingGoalPageEnd={readingGoalPageEnd}
        setReadingGoalPageEnd={setReadingGoalPageEnd}
        handleAssignBook={() =>
          handleAssignBook({
            bookDetails,
            readingGoal,
            goalDeadline,
            readingGoalPageStart:
              readingGoalPageStart === "" ? null : Number(readingGoalPageStart),
            readingGoalPageEnd:
              readingGoalPageEnd === "" ? null : Number(readingGoalPageEnd),
          })
        }
      />

      {/* Update Progress Modal */}
      <UpdateProgressModal
        open={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        club={club}
        userProgress={userProgress}
        onUpdate={(page) => handleUpdateProgress(page)}
      />

      {/* Update Goal Modal */}
      <ReadingGoalModal
        open={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        editReadingGoal={editReadingGoal}
        editGoalDeadline={editGoalDeadline}
        setEditReadingGoal={setEditReadingGoal}
        setEditGoalDeadline={setEditGoalDeadline}
        readingGoalPageStart={readingGoalPageStart}
        readingGoalPageEnd={readingGoalPageEnd}
        setReadingGoalPageStart={setReadingGoalPageStart}
        setReadingGoalPageEnd={setReadingGoalPageEnd}
        onUpdate={handleUpdateGoal}
      />

      {/* Profile Edit Modal */}
      <ProfileEdit
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={user}
        onSave={handleSaveProfile}
        isSaving={false}
      />
    </>
  );
}
