import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import UserDropdown from "./components/UserDropdown";
import ProfileEdit from "./ProfileEdit";
import { getFriends } from "./services/friends";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

function Friends() {
  const { user, isAuthenticated, isLoading, updateProfile, uploadAvatar } = useUser();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [returnPath, setReturnPath] = useState(null);

  // Handle save profile from edit modal
  const handleSaveProfile = async (updatedData) => {
    try {
      const { name, email, bio, avatarFile, removeAvatar } = updatedData;
      
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
    if (returnPath) {
      navigate(returnPath);
    }
  };

  // Fetch friends
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchFriends = async () => {
      if (!user?.id) return;
      
      try {
        const friendsList = await getFriends(user.id);
        setFriends(friendsList);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user?.id, isLoading, isAuthenticated, navigate]);

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F1E2" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
            Loading friends...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getAvatarSrc = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
      return profilePicture;
    }
    return `${API_BASE}${profilePicture}`;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F1E2" }}>
      {/* Header */}
      <header className="text-white shadow" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-6xl md:text-8xl italic" style={{ fontFamily: "Kapakana, cursive" }}>
              Plotline
            </div>
            <div className="flex items-center space-x-3">
              <UserDropdown onEditProfile={(previousLocation) => {
                setIsEditModalOpen(true);
                setReturnPath(previousLocation);
              }} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1
              className="text-3xl font-semibold"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Friends
            </h1>
            <button
              type="button"
              onClick={() => navigate("/add-friend")}
              className="px-6 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Add Friend
            </button>
          </div>

          {friends.length === 0 ? (
            <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-600 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
                You don't have any friends yet.
              </p>
              <button
                type="button"
                onClick={() => navigate("/add-friend")}
                className="px-6 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Add Your First Friend
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {friends.map((friendship) => {
                const friend = friendship.friend;
                const avatarSrc = getAvatarSrc(friend?.profile?.profilePicture);
                
                return (
                  <div
                    key={friend.id}
                    className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/friends/${friend.id}`)}
                  >
                    <div className="w-20 h-20 rounded-full border-4 border-[#d7c4a9] overflow-hidden shadow-lg mb-4">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={friend.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                          <span className="text-2xl text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>
                            {friend.name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3
                      className="text-lg font-semibold text-gray-800 mb-1"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      {friend.name}
                    </h3>
                    <p
                      className="text-sm text-gray-500 mb-2"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      @{friend.profile?.username || `user_${friend.id}`}
                    </p>
                    {friend.profile?.bio && (
                      <p
                        className="text-xs text-gray-600 text-center mb-4 line-clamp-2"
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        {friend.profile.bio}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

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

export default Friends;

