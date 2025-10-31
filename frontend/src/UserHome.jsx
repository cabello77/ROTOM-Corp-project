import { useEffect, useMemo, useState } from "react";
import RecentThreadsByClub from "./components/threads/RecentThreadsByClub";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import ProfileEdit from "./ProfileEdit";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

function UserHome() {
  const { user, isLoading, isAuthenticated, logout, updateProfile, uploadAvatar } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const returnPath = location.state?.returnPath;
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [clubsCreated, setClubsCreated] = useState([]); // Clubs created by user
  const [clubsJoined, setClubsJoined] = useState([]); // Clubs user has joined

  // Memoize avatar source BEFORE any conditional returns
  const avatarSrc = useMemo(() => {
    const path = user?.profile?.profilePicture;
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `${API_BASE}${path}`;
  }, [user?.profile?.profilePicture]);

  // Memoize friends list BEFORE any conditional returns
  const friendsList = useMemo(() => {
    return Array.isArray(user?.friendsList) ? user.friendsList : [];
  }, [user?.friendsList]);

  // Memoize member since BEFORE any conditional returns
  const memberSince = useMemo(() => {
    return user?.profile?.joinDate
      ? new Date(user.profile.joinDate).toLocaleDateString()
      : "—";
  }, [user?.profile?.joinDate]);

  // Combine created and joined clubs
  const allClubs = useMemo(() => {
    const combined = [...clubsCreated, ...clubsJoined];
    // Remove duplicates based on club ID
    return combined.filter((club, index, self) => 
      index === self.findIndex((c) => c.id === club.id)
    );
  }, [clubsCreated, clubsJoined]);

  // Helper function to calculate days remaining
  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // 🆕 Fetch clubs created by the user
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/users/${user?.id}/clubs`);
        setClubsCreated(res.data);
      } catch (err) {
        console.error("Error fetching user clubs:", err);
      }
    };
    if (user?.id) fetchClubs();
  }, [user?.id]);

  // Fetch clubs user has joined
  useEffect(() => {
    const fetchJoinedClubs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/users/${user?.id}/clubs-joined`);
        setClubsJoined(res.data);
      } catch (err) {
        console.error("Error fetching joined clubs:", err);
        setClubsJoined([]);
      }
    };
    if (user?.id) fetchJoinedClubs();
    
    // Set up interval to refresh joined clubs every 3 seconds
    const intervalId = setInterval(() => {
      if (user?.id) fetchJoinedClubs();
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F1E2" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSaveProfile = async ({ name, email, bio, avatarFile, removeAvatar }) => {
    if (!user) return;
    setIsSaving(true);
    setStatusMessage("Saving profile...");
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

      setStatusMessage("Profile updated!");
      setIsEditModalOpen(false);
      // Navigate back to the return path if one was provided
      if (returnPath) {
        navigate(returnPath);
      }
    } catch (error) {
      console.error(error);
      setStatusMessage(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F1E2" }}>
      <header className="text-white shadow" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-6xl md:text-8xl italic" style={{ fontFamily: "Kapakana, cursive" }}>
              Plotline
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center">
                      <span className="text-white font-bold text-sm" style={{ fontFamily: "Times New Roman, serif" }}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center space-x-1 text-white hover:text-gray-200 transition-colors"
                >
                  <span className="text-sm font-medium" style={{ fontFamily: "Times New Roman, serif" }}>
                    {user.name}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link
                      to="/user-home"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Home</span>
                    </Link>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span>Notifications</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

<main className="flex-grow px-4 py-8">
  <div className="max-w-7xl mx-auto space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT SIDEBAR */}
      <aside className="lg:col-span-3 space-y-4">
        {/* My Book Clubs */}
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
            My Book Clubs
          </h2>
          <div className="space-y-3">
            {allClubs.length ? (
              allClubs.map((club) => (
                <Link
                  key={club.id}
                  to={`/clubs/${club.id}`}
                  className="block text-left px-4 py-2 rounded border border-[#e6dac8] bg-[#faf6ed] hover:bg-[#efe5d5] transition-colors"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  {club.name}
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                Join or create a club to see it here.
              </p>
            )}
          </div>
        </div>


        {/* Discover */}
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
              Discover
            </h3>
            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: "Times New Roman, serif" }}>
              Explore trending clubs and discussions.
            </p>
          </div>
          <Link
            to="/clubs"
            className="block text-center w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Discover Clubs
          </Link>
          <Link
            to="/clubs/new"
            className="block text-center w-full text-gray-700 px-4 py-2 rounded border border-[#ddcdb7] bg-white hover:bg-[#f7ecda] transition-colors"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Or Create Your Own
          </Link>
        </div>

        {/* Friends */}
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
            Friends
          </h2>
          <div className="flex flex-wrap gap-3">
            {friendsList.length ? (
              friendsList.map((friend) => (
                <span
                  key={friend}
                  className="px-4 py-2 rounded-full border border-[#ddcdb7] bg-[#faf6ed] text-sm text-gray-700"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  {friend}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                Add friends to see them here.
              </p>
            )}
          </div>
          <button
            type="button"
            className="w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Add Friends
          </button>
        </div>
      </aside>

      {/* CENTER COLUMN */}
      <section className="lg:col-span-6 space-y-4">
        {/* Search + Top Bar */}
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search posts, clubs, or friends"
                className="w-full border border-[#ddcdb7] rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#FDFBF6" }}
              />
            </div>
            <button className="w-10 h-10 rounded-full border border-[#ddcdb7] text-gray-600 hover:bg-[#efe5d5] transition-colors flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>

        {/* Example Feed Blocks */}
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 text-center">
          <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
            Join a book club to see curated discussions here.
          </p>
        </div>
        {/* Placeholder: pass joined club IDs once available; demo with club 1 */}
        <RecentThreadsByClub clubIds={[1]} limit={5} />
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 text-center">
          <p className="text-sm text-gray-600 font-medium" style={{ fontFamily: "Times New Roman, serif" }}>
            You're all caught up! :)
          </p>
        </div>
      </section>

      {/* RIGHT SIDEBAR */}
      <aside className="lg:col-span-3 space-y-4">
        {/* Profile Summary Card */}
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#d7c4a9] h-20 relative">
            <div className="absolute left-6 -bottom-10 w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-lg">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                  <span className="text-2xl text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="px-6 pt-12 pb-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
                {user.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "Times New Roman, serif" }}>
                {user.email}
              </p>
            </div>
            <div className="text-sm text-gray-600 space-y-1" style={{ fontFamily: "Times New Roman, serif" }}>
              <p>Member since — {memberSince}</p>
              <p>{user.friends ?? friendsList.length} friends</p>
              <p>{user.profile?.bio || "Add a bio to let other readers know what you love."}</p>
            </div>
            
            {/* Reading Progress Section */}
            <div className="pt-4 border-t border-[#e3d8c8]">
              <h3 className="text-sm font-semibold text-gray-800 mb-3" style={{ fontFamily: "Times New Roman, serif" }}>
                Reading Progress
              </h3>
              <div className="space-y-3">
                {clubsJoined.length > 0 ? (
                  clubsJoined.map((club) => {
                    const bookTitle = club.currentBookData?.title || club.currentBookId || "No book assigned";
                    const progress = club.membershipProgress || 0;
                    const goal = club.readingGoal || "No goal set";
                    const daysRemaining = getDaysRemaining(club.goalDeadline);
                    
                    return (
                      <div key={club.id} className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span style={{ fontFamily: "Times New Roman, serif" }}>
                            {bookTitle} • {goal}
                            {daysRemaining !== null && daysRemaining >= 0 && ` • ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`}
                          </span>
                          <span style={{ fontFamily: "Times New Roman, serif" }}>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#774C30] h-2 rounded-full" 
                            style={{ width: `${Math.round(progress)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-500" style={{ fontFamily: "Times New Roman, serif" }}>
                    No reading progress yet. Join a book club to start tracking!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* My Bookshelf */}
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
          <h3 className="text-base font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
            My Bookshelf
          </h3>
          <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
            Track books to build your shelf.
          </p>
          <button
            type="button"
            className="w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Update Shelf
          </button>
        </div>

        {/* Logout */}
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Logout
          </button>
        </div>
      </aside>
    </div>
  </div>
</main>


      {statusMessage && (
        <div className="fixed bottom-6 right-6 bg-white shadow-lg border border-gray-200 rounded-lg px-4 py-3">
          <p className="text-sm text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>
            {statusMessage}
          </p>
        </div>
      )}

      <ProfileEdit
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          // Navigate back to the return path if one was provided
          if (returnPath) {
            navigate(returnPath);
          }
        }}
        user={user}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />
    </div>
  );
}

export default UserHome;

