import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import ProfileEdit from "./ProfileEdit";
import axios from "axios";
import UserDropdown from "./components/UserDropdown";
import HomeLeftSidebar from "./components/home/HomeLeftSidebar";
import HomeCenterFeed from "./components/home/HomeCenterFeed";
import HomeRightSidebar from "./components/home/HomeRightSidebar";

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
  const [friendsList, setFriendsList] = useState([]); // Friends list

  // Memoize avatar source BEFORE any conditional returns
  const avatarSrc = useMemo(() => {
    const path = user?.profile?.profilePicture;
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `${API_BASE}${path}`;
  }, [user?.profile?.profilePicture]);

  // Memoize member since BEFORE any conditional returns
  const memberSince = useMemo(() => {
    return user?.profile?.joinDate
      ? new Date(user.profile.joinDate).toLocaleDateString()
      : "�";
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

  // ?? Fetch clubs created by the user
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

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.id) return;
      try {
        const res = await axios.get(`${API_BASE}/api/friends/${user.id}`);
        const friends = res.data.friends || [];
        // Pass full friend objects for display in sidebar
        setFriendsList(friends);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setFriendsList([]);
      }
    };
    fetchFriends();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F1E2" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600" style={{}}>
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
            <Link to="/user-home" className="text-6xl md:text-8xl italic cursor-pointer hover:opacity-80 transition-opacity" style={{ fontFamily: "Dancing Script, cursive", textDecoration: "none", color: "white" }}>
              Plotline
            </Link>
            <div className="flex items-center space-x-3">
              <UserDropdown onEditProfile={() => setIsEditModalOpen(true)} />
            </div>
          </div>
        </div>
      </header>

<main className="flex-grow px-4 py-8">
  <div className="max-w-7xl mx-auto space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT SIDEBAR */}
      <HomeLeftSidebar 
        clubsCreated={clubsCreated} 
        clubsJoined={clubsJoined} 
        friendsList={friendsList} 
      />
      {/* CENTER COLUMN */}
      <HomeCenterFeed allClubs={allClubs} />

      {/* RIGHT SIDEBAR */}
      <HomeRightSidebar
        user={user}
        avatarSrc={avatarSrc}
        memberSince={memberSince}
        clubsJoined={clubsJoined}
        friendsCount={friendsList.length}
        onLogout={handleLogout}
      />
    </div>
  </div>
</main>


      {statusMessage && (
        <div className="fixed bottom-6 right-6 bg-white shadow-lg border border-gray-200 rounded-lg px-4 py-3">
          <p className="text-sm text-gray-700" style={{}}>
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
