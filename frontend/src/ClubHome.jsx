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
import {
  deleteClub,
  joinClub,
  leaveClub,
  updateMemberProgress,
  updateClubGoal,
  assignBookToClub,
} from "./services/clubActions";
import useClubData from "./hooks/useClubData";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function ClubHome() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading, updateProfile, uploadAvatar } =
    useUser();
  const navigate = useNavigate();

  const {
    club,
    setClub,
    currentBook,
    setCurrentBook,
    readingGoal,
    setReadingGoal,
    goalDeadline,
    setGoalDeadline,
    members,
    setMembers,
    isMember,
    setIsMember,
    currentUserMemberData,
    setCurrentUserMemberData,
    userProgress,
    setUserProgress,
  } = useClubData(id, user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  const [bookDetails, setBookDetails] = useState({
    title: "",
    authors: "",
    cover: "",
    description: "",
    year: "",
    genre: "",
  });

  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editReadingGoal, setEditReadingGoal] = useState("");
  const [editGoalDeadline, setEditGoalDeadline] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [returnPath, setReturnPath] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [readingGoalPageStart, setReadingGoalPageStart] = useState("");
  const [readingGoalPageEnd, setReadingGoalPageEnd] = useState("");

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;
    try {
      await deleteClub(API_BASE, club.id, user.id);
      navigate("/user-home");
    } catch (err) {
      console.error("Error deleting club:", err);
    }
  };

  const handleSaveProfile = async ({
    name,
    email,
    bio,
    avatarFile,
    removeAvatar,
  }) => {
    try {
      await updateProfile(user.id, {
        name,
        email,
        profile: {
          bio,
          fullName: name,
          username: user.profile?.username || `user_${user.id}`,
        },
      });

      if (avatarFile) await uploadAvatar(user.id, avatarFile);
      else if (removeAvatar) {
        await updateProfile(user.id, {
          profile: {
            bio,
            fullName: name,
            username: user.profile?.username || `user_${user.id}`,
            profilePicture: null,
          },
        });
      }

      setIsEditModalOpen(false);
      if (returnPath) navigate(returnPath);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    if (returnPath) navigate(returnPath);
  };

  const handleJoinClub = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/clubs/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setIsMember(true);
        setCurrentUserMemberData(data);
        setUserProgress(0);

        const membersRes = await axios.get(`${API_BASE}/api/clubs/${id}/members`);
        setMembers(membersRes.data);

      } else if (res.status === 400) {
        setIsMember(true);

        const membersRes = await axios.get(`${API_BASE}/api/clubs/${id}/members`);
        setMembers(membersRes.data);

        const userMember = membersRes.data.find((m) => m.userId === user.id);
        if (userMember) {
          setCurrentUserMemberData(userMember);
          setUserProgress(userMember.progress);
        }
      }
    } catch (err) {
      console.error("Error joining club:", err);
    }
  };

  const handleLeaveClub = async () => {
    if (!window.confirm("Are you sure you want to leave this club?")) return;

    try {
      await leaveClub(API_BASE, id, user.id);
      setIsMember(false);
      setCurrentUserMemberData(null);
      setMembers(members.filter((m) => m.userId !== user.id));
      navigate("/user-home");
    } catch (err) {
      console.error("Error leaving club:", err);
    }
  };

  const handleUpdateProgress = async (progress) => {
    try {
      const data = await updateMemberProgress(API_BASE, id, user.id, progress);
      setUserProgress(progress);
      setCurrentUserMemberData(data);

      const membersRes = await axios.get(`${API_BASE}/api/clubs/${id}/members`);
      setMembers(membersRes.data);

      setIsProgressModalOpen(false);
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  // ⭐ CLEAN + FINAL ⭐
  const handleUpdateGoal = async ({
    readingGoal,
    goalDeadline,
    readingGoalPageStart,
    readingGoalPageEnd,
  }) => {
    try {
      await updateClubGoal(
        API_BASE,
        id,
        user.id,
        readingGoal,
        goalDeadline,
        readingGoalPageStart,
        readingGoalPageEnd
      );

      setReadingGoal(readingGoal);

      if (goalDeadline) {
        setGoalDeadline(new Date(goalDeadline).toISOString().split("T")[0]);
      }

      const clubRes = await axios.get(`${API_BASE}/api/clubs/${id}`);
      setClub(clubRes.data);

      setIsGoalModalOpen(false);
    } catch (err) {
      console.error("Error updating goal:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const books = await searchBooks(searchQuery);
      setSearchResults(books);
    } catch (err) {
      console.error("Error searching:", err);
    }
  };

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

  // ⭐ CLEAN + FINAL — ASSIGN BOOK WITH PAGE RANGE ⭐
  const handleAssignBook = async ({
    bookDetails,
    readingGoal,
    goalDeadline,
    readingGoalPageStart,
    readingGoalPageEnd,
  }) => {
    try {
      await assignBookToClub(
        API_BASE,
        id,
        user.id,
        bookDetails,
        readingGoal,
        goalDeadline,
        readingGoalPageStart,
        readingGoalPageEnd
      );

      setCurrentBook(bookDetails);

      setIsModalOpen(false);
      setSearchQuery("");
      setSearchResults([]);
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
    } catch (err) {
      console.error("Error assigning book:", err);
    }
  };

  const handleFinishBook = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/clubs/${id}/book/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not finish book.");
        return;
      }

      const clubRes = await axios.get(`${API_BASE}/api/clubs/${id}`);
      const updated = clubRes.data;

      setClub(updated);
      setCurrentBook(updated.currentRead || null);
      setReadingGoal(updated.readingGoal || "");
      setGoalDeadline(updated.goalDeadline || "");
      setMembers(updated.members || []);
      setUserProgress(0);

    } catch (err) {
      console.error("Error finishing book:", err);
    }
  };

  const promoteMember = async (memberId) => {
    try {
      await axios.post(
        `${API_BASE}/api/clubs/${id}/members/${memberId}/promote`,
        { actingUserId: user.id }
      );

      const membersRes = await axios.get(`${API_BASE}/api/clubs/${id}/members`);
      setMembers(membersRes.data);

    } catch (err) {
      console.error("Error promoting:", err);
    }
  };

  if (isLoading || !club) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F7F1E2" }}
      >
        <p className="text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F1E2" }}>
      <ClubHeader
        onOpenEditProfile={(previousLocation) => {
          setIsEditModalOpen(true);
          setReturnPath(previousLocation);
        }}
      />

      <ClubTitleBar club={club} />

      <main className="flex-grow px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <ClubLeftSidebar
              isHost={user && user.id === club.creatorId}
              club={club}
              currentBook={currentBook}
              goalDeadline={goalDeadline}
              members={members}
              currentUser={user}
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
                  if (res.ok) setCurrentBook(null);
                  else console.error("Failed to remove book:", data.error);
                } catch (err) {
                  console.error("Error removing book:", err);
                }
              }}
              onFinishBook={handleFinishBook}
            />

            <section className="lg:col-span-6 space-y-4">
              <LiveChat
                clubId={club.id}
                user={user}
                isMember={isMember}
                apiBase={API_BASE}
              />
              <DiscussionsPanel
                clubId={club.id}
                user={user}
                isMember={isMember}
                isHost={user.id === club.creatorId}
              />
            </section>

            <ClubRightSidebar
              user={user}
              club={club}
              isMember={isMember}
              currentBook={currentBook}
              currentPage={userProgress}
              userProgress={userProgress}
              members={members}
              onOpenProgress={() => setIsProgressModalOpen(true)}
              onJoinClub={handleJoinClub}
              onDeleteClub={handleDelete}
              onLeaveClub={handleLeaveClub}
              onInviteMembers={() => setIsInviteModalOpen(true)}
              onPromote={promoteMember}
              onOpenGoalModal={() => {
                setEditReadingGoal(club.readingGoal || "");
                setEditGoalDeadline(goalDeadline);
                setIsGoalModalOpen(true);
              }}
            />
          </div>
        </div>
      </main>

      <InviteFriendsModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        clubId={id}
        inviterId={user?.id}
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
        readingGoalPageStart={readingGoalPageStart}
        setReadingGoalPageStart={setReadingGoalPageStart}
        readingGoalPageEnd={readingGoalPageEnd}
        setReadingGoalPageEnd={setReadingGoalPageEnd}
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
