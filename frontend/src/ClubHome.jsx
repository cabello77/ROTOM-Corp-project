import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ThreadList from "./components/threads/ThreadList";
import axios from "axios";
import useClub from "./hooks/useClub";
import useClubMembers from "./hooks/useClubMembers";
import { useUser } from "./contexts/UserContext";
import UserDropdown from "./components/UserDropdown";
import ProfileEdit from "./ProfileEdit";
import LiveChat from "./components/club/LiveChat";
import DiscussionsPanel from "./components/club/DiscussionsPanel";
import MembersRoles from "./components/club/MembersRoles";
import PastReads from "./components/club/PastReads";
import MyProgressCard from "./components/club/MyProgressCard";
import JoinClubCard from "./components/club/JoinClubCard";
import MemberProgress from "./components/club/MemberProgress";
import UpdateProgressModal from "./components/club/UpdateProgressModal";
import ReadingGoalModal from "./components/club/ReadingGoalModal";
import ActionsCard from "./components/club/ActionsCard";
import AssignBookModal from "./components/club/AssignBookModal";
import CurrentBookCard from "./components/club/CurrentBookCard";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function ClubHome() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading, updateProfile, uploadAvatar } = useUser();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
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
  const [readingGoal, setReadingGoal] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [userProgress, setUserProgress] = useState(0); // Progress from 0 to 100
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editReadingGoal, setEditReadingGoal] = useState("");
  const [editGoalDeadline, setEditGoalDeadline] = useState("");
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [currentUserMemberData, setCurrentUserMemberData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [returnPath, setReturnPath] = useState(null);

  // Helper function to calculate days remaining
  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  // Fetch club data
  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/clubs/${id}`);
        const clubData = res.data;
        setClub(clubData);
        
        // Set current book if it exists in the database
        if (clubData.currentBookData) {
          setCurrentBook(clubData.currentBookData);
        }
        
        // Set reading goal and deadline if they exist
        if (clubData.readingGoal) {
          setReadingGoal(clubData.readingGoal);
        }
        if (clubData.goalDeadline) {
          // Convert the deadline to YYYY-MM-DD format for the input
          const deadline = new Date(clubData.goalDeadline).toISOString().split('T')[0];
          setGoalDeadline(deadline);
        }
      } catch (error) {
        console.error("Error loading club:", error);
      }
    };
    fetchClub();
  }, [id]);

  // Fetch club members and check if user is a member
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/clubs/${id}/members`);
        const membersData = res.data;
        setMembers(membersData);
        
        // Check if current user is a member or creator
        if (user && club) {
          const userMember = membersData.find(m => m.userId === user.id);
          // Creator is automatically considered a member
          const isCreator = user.id === club.creatorId;
          
          if (userMember) {
            setIsMember(true);
            setCurrentUserMemberData(userMember);
            setUserProgress(userMember.progress);
          } else if (isCreator) {
            // Creator should see themselves as a member
            setIsMember(true);
            setUserProgress(0);
          } else {
            setIsMember(false);
          }
        }
      } catch (error) {
        console.error("Error loading members:", error);
      }
    };
    fetchMembers();
  }, [id, user, club]);

  // Handle delete club (only creator can do this)
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this club? This cannot be undone.")) return;
    try {
      setDeleting(true);
      const res = await fetch(`${API_BASE}/api/clubs/${club.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Club deleted successfully.");
        navigate("/user-home");
      } else {
        alert(data.error || "Failed to delete club.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting club.");
    } finally {
      setDeleting(false);
    }
  };

  // Handle save profile from edit modal
  const handleSaveProfile = async (updatedData) => {
    try {
      // Extract data from ProfileEdit format
      const { name, email, bio, avatarFile, removeAvatar } = updatedData;
      
      // Update profile
      await updateProfile(user.id, {
        name,
        email,
        profile: {
          bio,
          fullName: name,
          username: user.profile?.username || `user_${user.id}`,
        },
      });

      // Handle avatar
      if (avatarFile) {
        await uploadAvatar(user.id, avatarFile);
      } else if (removeAvatar) {
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
      // Navigate back to the previous location
      if (returnPath) {
        navigate(returnPath);
      }
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
        
        alert("Successfully joined the book club!");
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
        alert(data.error || "Failed to join club.");
      }
    } catch (err) {
      console.error("Error joining club:", err);
      alert("Error joining club. Please try again.");
    }
  };

  // Handle leaving club
  const handleLeaveClub = async () => {
    if (!window.confirm("Are you sure you want to leave this book club?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/clubs/${id}/leave`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setIsMember(false);
        setCurrentUserMemberData(null);
        setUserProgress(0);
        // Remove from members list
        setMembers(members.filter(m => m.userId !== user.id));
        alert("You have left the book club.");
        navigate("/user-home");
      } else {
        alert(data.error || "Failed to leave club.");
      }
    } catch (err) {
      console.error("Error leaving club:", err);
      alert("Error leaving club. Please try again.");
    }
  };

  // Handle progress update
  const handleUpdateProgress = async (progress) => {
    try {
      const res = await fetch(`${API_BASE}/api/clubs/${id}/members/${user.id}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setUserProgress(progress);
        // Update the member data
        setCurrentUserMemberData(data);
        
        // Refetch members list to ensure host appears in member progress
        const membersRes = await axios.get(`${API_BASE}/api/clubs/${id}/members`);
        setMembers(membersRes.data);
        
        setIsProgressModalOpen(false);
        alert("Progress updated!");
      } else {
        alert(data.error || "Failed to update progress.");
      }
    } catch (err) {
      console.error("Error updating progress:", err);
      alert("Error updating progress. Please try again.");
    }
  };

  // Handle goal update (only creator)
  const handleUpdateGoal = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/clubs/${id}/goal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          readingGoal: editReadingGoal,
          goalDeadline: editGoalDeadline,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setReadingGoal(editReadingGoal);
        if (editGoalDeadline) {
          const deadline = new Date(editGoalDeadline).toISOString().split('T')[0];
          setGoalDeadline(deadline);
        }
        setIsGoalModalOpen(false);
        setEditReadingGoal("");
        setEditGoalDeadline("");
        // Reload club data to get updated goal
        const clubRes = await axios.get(`${API_BASE}/api/clubs/${id}`);
        setClub(clubRes.data);
      } else {
        alert(data.error || "Failed to update goal.");
      }
    } catch (err) {
      console.error("Error updating goal:", err);
      alert("Error updating goal. Please try again.");
    }
  };

  // Handle book search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      const books = data.docs.slice(0, 10).map(book => ({
        title: book.title,
        author: book.author_name?.[0] || "Unknown Author",
        cover: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : null,
        first_publish_year: book.first_publish_year,
        subject: book.subject?.[0] || "",
      }));
      
      setSearchResults(books);
    } catch (err) {
      console.error("Error searching books:", err);
      alert("Error searching for books. Please try again.");
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
      // Send book data to backend
      const res = await fetch(`${API_BASE}/api/clubs/${id}/book`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          bookData: bookDetails,
          readingGoal: readingGoal,
          goalDeadline: goalDeadline,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
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
      } else {
        alert(data.error || "Failed to assign book.");
      }
    } catch (err) {
      console.error("Error assigning book:", err);
      alert("Error assigning book. Please try again.");
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
      <header className="text-white shadow" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-6xl md:text-8xl italic" style={{ fontFamily: "Kapakana, cursive" }}>
              Plotline
            </div>
            <div className="flex space-x-3">
              <UserDropdown onEditProfile={(previousLocation) => {
                // Open edit modal from club home - will navigate back to this club
                setIsEditModalOpen(true);
                setReturnPath(previousLocation);
              }} />
            </div>
          </div>
        </div>
      </header>

      {/* Club Title Bar */}
      <div className="text-center py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold text-gray-800 mb-3" style={{ fontFamily: "Times New Roman, serif" }}>
            {club.name}
          </h1>
          {club.readingGoal && club.goalDeadline && getDaysRemaining(club.goalDeadline) ? (
            <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
              Current Reading Goal: <span className="font-semibold text-gray-800">{club.readingGoal}</span> • 
              <span className="ml-2 font-semibold text-gray-800">{getDaysRemaining(club.goalDeadline)}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
              No reading goal set yet
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDEBAR */}
            <aside className="lg:col-span-3 space-y-4">
              {/* Current Read */}
              <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
                    Current Read
              </h2>
                  {user && user.id === club.creatorId && !currentBook && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-8 h-8 rounded-full border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors flex items-center justify-center"
                      style={{ fontFamily: "Times New Roman, serif" }}
                      title="Assign Book"
                    >
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                  {user && user.id === club.creatorId && currentBook && (
                    <button
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to remove the current book?")) {
                          try {
                            const res = await fetch(`${API_BASE}/api/clubs/${id}/book`, {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ userId: user.id }),
                            });

                            const data = await res.json();
                            
                            if (res.ok) {
                              setCurrentBook(null);
                            } else {
                              alert(data.error || "Failed to remove book.");
                            }
                          } catch (err) {
                            console.error("Error removing book:", err);
                            alert("Error removing book. Please try again.");
                          }
                        }
                      }}
                      className="w-8 h-8 rounded-full border border-red-300 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center"
                      style={{ fontFamily: "Times New Roman, serif" }}
                      title="Remove Book"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {currentBook ? (
                    <CurrentBookCard
                      currentBook={currentBook}
                      isHost={user && user.id === club.creatorId}
                      club={club}
                      goalDeadline={goalDeadline}
                      onUpdateGoal={() => {
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
                            alert(data.error || "Failed to remove book.");
                          }
                        } catch (err) {
                          console.error(err);
                          alert("Error removing book.");
                        }
                      }}
                    />
                  ) : (
                    <div className="text-center py-4 border border-[#e6dac8] bg-[#faf6ed] rounded" style={{ fontFamily: "Times New Roman, serif" }}>
                      <p className="text-sm text-gray-600">
                        {user && user.id === club.creatorId ? "Click + to assign a book" : "No book assigned yet"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Discussions moved to center column below Live Chat */}

              <PastReads />

              <MembersRoles members={members} />
            </aside>

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
            <aside className="lg:col-span-3 space-y-4">
              {/* My Progress - visible for both hosts and members */}
              {user && (
                <>
                  {(isMember || user.id === club.creatorId) && club.readingGoal && club.goalDeadline && getDaysRemaining(club.goalDeadline) && !getDaysRemaining(club.goalDeadline).includes("Overdue") ? (
                    <MyProgressCard
                      club={club}
                      currentBook={currentBook}
                      userProgress={userProgress}
                      onOpenProgress={() => setIsProgressModalOpen(true)}
                    />
                  ) : user.id !== club.creatorId && !isMember ? (
                    /* Show join button if not a member and not the host */
                    <JoinClubCard onJoin={handleJoinClub} />
                  ) : null}
                </>
              )}

              {/* Member Progress */}
              {members.length > 0 && club.readingGoal && (
                <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
                  <h3 className="text-base font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
                    Member Progress
                  </h3>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                          <span style={{ fontFamily: "Times New Roman, serif" }} className="flex items-center gap-1">
                            {member.user.name}
                            {member.isHost && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800" title="Club Host">
                                🏠 Host
                              </span>
                            )}
                          </span>
                          <span style={{ fontFamily: "Times New Roman, serif" }}>{member.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-[#774C30] h-2 rounded-full transition-all" style={{ width: `${member.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons - visible for all members including hosts */}
              {(isMember || (user && user.id === club.creatorId)) && (
                <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
                  <h3 className="text-base font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
                    Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      type="button"
                      className="w-full px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors text-sm"
                      style={{ fontFamily: "Times New Roman, serif" }}
                      onClick={() => alert("Invite functionality coming soon!")}
                    >
                      Invite Members
                    </button>
              {user && user.id === club.creatorId && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="w-full px-4 py-2 rounded border border-red-300 bg-red-50 hover:bg-red-100 transition-colors text-sm text-red-700"
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        Delete Book Club
                      </button>
                    )}
                    {isMember && user && user.id !== club.creatorId && (
                      <button
                        type="button"
                        onClick={handleLeaveClub}
                        className="w-full px-4 py-2 rounded border border-red-300 bg-red-50 hover:bg-red-100 transition-colors text-sm text-red-700"
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        Leave Book Club
                      </button>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      {/* Book Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#FDFBF6" }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
                  Assign Book to Club
                </h2>
                <button
                  onClick={() => {
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
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
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
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 rounded-lg border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
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
                        className={`w-full p-3 rounded-lg border text-left transition-colors ${
                          selectedBook === book
                            ? "bg-[#e3d5c2] border-[#774C30]"
                            : "bg-[#faf6ed] border-[#ddcdb7] hover:bg-[#efe6d7]"
                        }`}
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        <div className="flex gap-3">
                          {book.cover && (
                            <img src={book.cover} alt={book.title} className="w-12 h-16 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{book.title}</h3>
                            <p className="text-sm text-gray-600">by {book.author}</p>
                            {book.first_publish_year && (
                              <p className="text-xs text-gray-500">Published: {book.first_publish_year}</p>
                            )}
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
                      <input
                        type="text"
                        value={bookDetails.title}
                        onChange={(e) => setBookDetails({ ...bookDetails, title: e.target.value })}
                        className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                        Author(s)
                      </label>
                      <input
                        type="text"
                        value={bookDetails.authors}
                        onChange={(e) => setBookDetails({ ...bookDetails, authors: e.target.value })}
                        className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                        Cover Image URL
                      </label>
                      <input
                        type="text"
                        value={bookDetails.cover}
                        onChange={(e) => setBookDetails({ ...bookDetails, cover: e.target.value })}
                        className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                        Description/Summary
                      </label>
                      <textarea
                        value={bookDetails.description}
                        onChange={(e) => setBookDetails({ ...bookDetails, description: e.target.value })}
                        rows={3}
                        className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                          Publication Year
                        </label>
                        <input
                          type="text"
                          value={bookDetails.year}
                          onChange={(e) => setBookDetails({ ...bookDetails, year: e.target.value })}
                          className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                          style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                          Genre/Category
                        </label>
                        <input
                          type="text"
                          value={bookDetails.genre}
                          onChange={(e) => setBookDetails({ ...bookDetails, genre: e.target.value })}
                          className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                          style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
                        />
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
                          <input
                            type="text"
                            value={readingGoal}
                            onChange={(e) => setReadingGoal(e.target.value)}
                            placeholder="Enter reading goal"
                            className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                            Deadline
                          </label>
                          <input
                            type="date"
                            value={goalDeadline}
                            onChange={(e) => setGoalDeadline(e.target.value)}
                            className="w-full border border-[#ddcdb7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => {
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
                      }}
                      className="px-6 py-2 rounded border border-[#ddcdb7] bg-white hover:bg-gray-50 transition-colors"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssignBook}
                      className="px-6 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Book Modal */}
      <AssignBookModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSearchQuery("");
          setSearchResults([]);
          setSelectedBook(null);
          setBookDetails({ title: "", authors: "", cover: "", description: "", year: "", genre: "" });
          setReadingGoal("");
          setGoalDeadline("");
        }}
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
      />

      {/* Progress Update Modal */}
      <UpdateProgressModal
        open={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        userProgress={userProgress}
        onUpdate={(value, opts) => {
          if (opts?.preview) {
            setUserProgress(value);
          } else {
            handleUpdateProgress(value);
          }
        }}
      />

      {/* Update Goal Modal */}
      <ReadingGoalModal
        open={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        editReadingGoal={editReadingGoal}
        editGoalDeadline={editGoalDeadline}
        setEditReadingGoal={setEditReadingGoal}
        setEditGoalDeadline={setEditGoalDeadline}
        onUpdate={handleUpdateGoal}
      />

      <ProfileEdit
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={user}
        onSave={handleSaveProfile}
        isSaving={false}
      />
    </div>
  );
}
