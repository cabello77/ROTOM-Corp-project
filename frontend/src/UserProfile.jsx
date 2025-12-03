import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import UserDropdown from "./components/UserDropdown";
import ProfileEdit from "./ProfileEdit";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function UserProfile() {
  const { user, isAuthenticated, isLoading, updateProfile, uploadAvatar } = useUser();
  const navigate = useNavigate();

  const [fullProfile, setFullProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [returnPath, setReturnPath] = useState(null);

  // Save profile handler
  const handleSaveProfile = async (payload) => {
  try {
    const { name, email, bio, avatarFile, removeAvatar, profile } = payload;
    
    await updateProfile(user.id, {
      name,
      email,
      profile: {
        bio,
        username: profile.username,  // Use `profile.username` from payload
      },
    });

    if (avatarFile) {
      await uploadAvatar(user.id, avatarFile);
    } else if (removeAvatar) {
      await updateProfile(user.id, {
        profile: {
          bio,
          username: profile.username,   // Use `profile.username` from payload
          profilePicture: null,
        },
      });
    }
    
    setIsEditModalOpen(false);
    if (returnPath) {
      navigate(returnPath);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
  }
};


  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    if (returnPath) navigate(returnPath);
  };

  // Fetch full profile
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/${user.id}/full-profile`);
        if (!res.ok) throw new Error("Failed to load profile");
        setFullProfile(await res.json());
      } catch (err) {
        console.error("User profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, isAuthenticated, isLoading, navigate]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F1E2" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !fullProfile) return null;

  // --- UI Identity Fixes ---
  const username = fullProfile.profile?.username || `user_${fullProfile.id}`;
  const fullName = fullProfile.profile?.fullName || ""; // Optional

  const avatarSrc = fullProfile.profile?.profilePicture
    ? (fullProfile.profile.profilePicture.startsWith("http")
      ? fullProfile.profile.profilePicture
      : `${API_BASE}${fullProfile.profile.profilePicture}`)
    : null;

  const initial = username.charAt(0).toUpperCase();

  const currentClubs = fullProfile.clubs.filter((c) => c.currentBookId);
  const pastClubs = fullProfile.clubs.filter((c) => !c.currentBookId);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F1E2" }}>
      
      {/* Header */}
      <header className="text-white shadow" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-6xl md:text-8xl italic" style={{ fontFamily: "Kapakana, cursive" }}>
              Plotline
            </div>
            <UserDropdown
              onEditProfile={(previousLocation) => {
                setIsEditModalOpen(true);
                setReturnPath(previousLocation);
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 py-10">
        <div className="max-w-7xl mx-auto">

          {/* Profile Header */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-[#d7c4a9] overflow-hidden shadow-lg flex-shrink-0">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                    <span className="text-4xl text-gray-700 font-semibold">{initial}</span>
                  </div>
                )}
              </div>

              <div className="flex-1">

                {/* Username */}
                <h1 className="text-3xl font-semibold text-gray-800 mb-1">
                  {username}
                </h1>

                {/* Bio */}
                {fullProfile.profile?.bio && (
                  <p className="text-gray-700">{fullProfile.profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bookshelf Section */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bookshelf</h2>

            {/* Past Reads */}
            <h3 className="text-lg font-semibold text-gray-700 mt-8 mb-3">Past Reads</h3>

            {fullProfile.pastReads?.length === 0 ? (
              <p className="text-sm text-gray-600">No past reads yet.</p>
            ) : (
              <div className="space-y-3">
                {fullProfile.pastReads.map((entry) => (
                  <div
                    key={entry.bookId}
                    className="p-3 border border-[#ddcdb7] bg-[#faf6ed] rounded"
                  >
                    <p className="font-medium text-gray-800">{entry.bookData?.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clubs Section */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Book Clubs</h2>

            {fullProfile.clubs.length > 0 ? (
              <div className="space-y-2">
                {fullProfile.clubs.map((club) => (
                  <a
                    key={club.id}
                    href={`/clubs/${club.id}`}
                    className="block px-4 py-3 rounded border bg-[#faf6ed]"
                  >
                    {club.name}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">You are not part of any book clubs yet.</p>
            )}
          </div>

          {/* Friends Section */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Friends ({fullProfile.friendsCount})
            </h2>

            {fullProfile.friends?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {fullProfile.friends.map((friend) => {
                  const friendUsername = friend.profile?.username || `user_${friend.id}`;
                  const friendInitial = friendUsername.charAt(0).toUpperCase();

                  return (
                    <div key={friend.id} className="p-3 border rounded-lg text-center">
                      <div className="w-16 h-16 rounded-full bg-[#efe2cf] flex items-center justify-center mb-2">
                        <span className="text-lg font-semibold">{friendInitial}</span>
                      </div>
                      <p className="font-medium text-gray-800">{friendUsername}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600">You have no friends yet.</p>
            )}
          </div>

        </div>
      </main>

      <ProfileEdit
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={user}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
