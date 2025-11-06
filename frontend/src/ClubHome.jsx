import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useUser } from "./contexts/UserContext";
import LiveChat from "./components/club/LiveChat";
import DiscussionsPanel from "./components/club/DiscussionsPanel";
import ClubLeftSidebar from "./components/club/ClubLeftSidebar";
import ClubRightSidebar from "./components/club/ClubRightSidebar";
import ClubHeader from "./components/club/ClubHeader";
import ClubTitleBar from "./components/club/ClubTitleBar";
import ClubModals from "./components/club/ClubModals";
import InviteFriendsModal from "./components/club/InviteFriendsModal";
import { searchBooks } from "./services/books";
import { deleteClub, joinClub, leaveClub, updateMemberProgress, updateClubGoal, assignBookToClub } from "./services/clubActions";
import useClubData from "./hooks/useClubData";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function ClubHome() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading, updateProfile, uploadAvatar } = useUser();
  const navigate = useNavigate();
  const { club, setClub, currentBook, setCurrentBook, readingGoal, setReadingGoal, goalDeadline, setGoalDeadline, members, setMembers, isMember, setIsMember, currentUserMemberData, setCurrentUserMemberData, userProgress, setUserProgress } = useClubData(id, user);

  // Local UI state (modals, search, edit fields)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookDetails, setBookDetails] = useState({ title: "", authors: "", cover: "", description: "", year: "", genre: "" });
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editReadingGoal, setEditReadingGoal] = useState("");
  const [editGoalDeadline, setEditGoalDeadline] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [returnPath, setReturnPath] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

// Handle delete club (only creator can do this)
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this club? This cannot be undone.")) return;
    try {
      await deleteClub(API_BASE, club.id, user.id);
      console.log("Club deleted successfully.");
      navigate("/user-home");
    } catch (err) {
      console.error("Error deleting club:", err);
      console.error(err.message || "Error deleting club.");
    }
  };

  // Handle save profile from edit modal (lean wrapper)
  const handleSaveProfile = async ({ name, email, bio, avatarFile, removeAvatar }) => {
    try {
      await updateProfile(user.id, {
        name,
        email,
        profile: { bio, fullName: name, username: user.profile?.username || `user_${user.id}` },
      });
      if (avatarFile) await uploadAvatar(user.id, avatarFile);
      else if (removeAvatar) {
        await updateProfile(user.id, {
          profile: { bio, fullName: name, username: user.profile?.username || `user_${user.id}`, profilePicture: null },
        });
      }
      setIsEditModalOpen(false);
      if (returnPath) navigate(returnPath);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    // Navigate back to the previous location
    if (returnPath) {
      navigate(returnPath);
    }
  };

  // Handle joining club
  const handleJoinClub = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/clubs/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const isOk = res.ok;
      const status = res.status;
      let data;
      
      try {
        data = await res.json();
      } catch (e) {
        // If JSON parsing fails, use empty object
        data = {};
      }
      
      if (isOk) {
        // Successfully joined
        setIsMember(true);
        setCurrentUserMemberData(data);
        setUserProgress(0);
        
        // Refetch members to update the list
        const membersRes = await axios.get(`${API_BASE}/api/clubs/${id}/members`);
        setMembers(membersRes.data);
        
        console.log("Successfully joined the book club!");
      } else if (status === 400) {
        // User is already a member
        setIsMember(true);
        
        // Fetch member data
        const membersRes = await axios.get(`${API_BASE}/api/clubs/${id}/members`);
        setMembers(membersRes.data);
        
        const userMember = membersRes.data.find(m => m.userId === user.id);
        if (userMember) {
          setCurrentUserMemberData(userMember);
          setUserProgress(userMember.progress);
        }
      } else {
        // Other errors
        console.error("Failed to join club:", data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Error joining club:", err);
      console.error("Error joining club. Please try again.");
    }
  };

  // Handle leaving club
  const handleLeaveClub = async () => {
    if (!window.confirm("Are you sure you want to leave this book club?")) return;
    try {
      await leaveClub(API_BASE, id, user.id);
      setIsMember(false);
      setCurrentUserMemberData(null);
      setUserProgress(0);
      setMembers(members.filter(m => m.userId !== user.id));
      console.log("You have left the book club.");
      navigate("/user-home");
    } catch (err) {
      console.error("Error leaving club:", err);
      console.error("Error leaving club. Please try again.");
    }
  };

  // Handle progress update
  const handleUpdateProgress = async (progress) => {
    try {
      const data = await updateMemberProgress(API_BASE, id, user.id, progress);
      setUserProgress(progress);
      setCurrentUserMemberData(data);
      const membersRes = await axios.get(`${API_BASE}/api/clubs/${id}/members`);
      setMembers(membersRes.data);
      setIsProgressModalOpen(false);
      console.log("Progress updated!");
    } catch (err) {
      console.error("Error updating progress:", err);
      console.error("Error updating progress. Please try again.");
    }
  };

  // Handle goal update (only creator)
  const handleUpdateGoal = async () => {
    try {
      await updateClubGoal(API_BASE, id, user.id, editReadingGoal, editGoalDeadline);
      setReadingGoal(editReadingGoal);
      if (editGoalDeadline) {
        const deadline = new Date(editGoalDeadline).toISOString().split('T')[0];
        setGoalDeadline(deadline);
      }
      setIsGoalModalOpen(false);
      setEditReadingGoal("");
      setEditGoalDeadline("");
      const clubRes = await axios.get(`${API_BASE}/api/clubs/${id}`);
      setClub(clubRes.data);
    } catch (err) {
      console.error("Error updating goal:", err);
      console.error("Error updating goal. Please try again.");
    }
  };

  // Handle book search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const books = await searchBooks(searchQuery);
      setSearchResults(books);
    } catch (err) {
      console.error("Error searching books:", err);
      console.error("Error searching for books. Please try again.");
    }
  };

  // Handle book selection
  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setBookDetails({
      title: book.title,
      authors: book.author,
      cover: book.cover || "",
      description: "",
      year: book.first_publish_year || "",
      genre: book.subject || "",
    });
  };

  // Handle book assignment
  const handleAssignBook = async () => {
    if (!selectedBook) return;
    try {
      await assignBookToClub(API_BASE, id, user.id, bookDetails, readingGoal, goalDeadline);
      setCurrentBook(bookDetails);
      setIsModalOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedBook(null);
      setBookDetails({ title: "", authors: "", cover: "", description: "", year: "", genre: "" });
      setReadingGoal("");
      setGoalDeadline("");
    } catch (err) {
      console.error("Error assigning book:", err);
      console.error("Error assigning book. Please try again.");
    }
  };

  if (isLoading || !club) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F1E2" }}>
        <p className="text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F1E2" }}>
      {/* Header */}
      <ClubHeader onOpenEditProfile={(previousLocation) => {
        setIsEditModalOpen(true);
        setReturnPath(previousLocation);
      }} />

            {/* Club Title Bar */}
      <ClubTitleBar club={club} />
{/* Main Content */}
      <main className="flex-grow px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDEBAR */}
            <ClubLeftSidebar
              isHost={user && user.id === club.creatorId}
              club={club}
              currentBook={currentBook}
              goalDeadline={goalDeadline}
              members={members}
              onOpenAssign={() => setIsModalOpen(true)}
              onOpenUpdateGoal={() => {
                setEditReadingGoal(club.readingGoal || "");
                setEditGoalDeadline(goalDeadline);
                setIsGoalModalOpen(true);
              }}
              onRemoveBook={async () => {
                try {
                  const res = await fetch(`${API_BASE}/api/clubs/${club.id}/book`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user.id }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setCurrentBook(null);
                  } else {
                    console.error("Failed to remove book:", data.error || "Unknown error");
                  }
                } catch (err) {
                  console.error("Error removing book:", err);
                }
              }}
            />
            {/* CENTER COLUMN */}
            <section className="lg:col-span-6 space-y-4">
              <LiveChat />

              <DiscussionsPanel
                clubId={club?.id}
                user={user}
                isMember={isMember}
                isHost={user && club && user.id === club.creatorId}
              />
            </section>

            {/* RIGHT SIDEBAR */}
            <ClubRightSidebar
              user={user}
              club={club}
              isMember={isMember}
              currentBook={currentBook}
              userProgress={userProgress}
              members={members}
              onOpenProgress={() => setIsProgressModalOpen(true)}
              onJoinClub={handleJoinClub}
              onDeleteClub={handleDelete}
              onLeaveClub={handleLeaveClub}
              onInviteMembers={() => setIsInviteModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Book Assignment Modal removed; using AssignBookModal below */}

      <InviteFriendsModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        clubId={id}
        inviterId={user?.id}
        onInviteSent={() => {
          console.log("Invitations sent successfully");
        }}
      />

      <ClubModals
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
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
        handleAssignBook={handleAssignBook}
        isProgressModalOpen={isProgressModalOpen}
        setIsProgressModalOpen={setIsProgressModalOpen}
        userProgress={userProgress}
        setUserProgress={setUserProgress}
        handleUpdateProgress={handleUpdateProgress}
        isGoalModalOpen={isGoalModalOpen}
        setIsGoalModalOpen={setIsGoalModalOpen}
        editReadingGoal={editReadingGoal}
        setEditReadingGoal={setEditReadingGoal}
        editGoalDeadline={editGoalDeadline}
        setEditGoalDeadline={setEditGoalDeadline}
        handleUpdateGoal={handleUpdateGoal}
        isEditModalOpen={isEditModalOpen}
        handleCloseEditModal={handleCloseEditModal}
        user={user}
        handleSaveProfile={handleSaveProfile}
      />
    </div>
  );
}



