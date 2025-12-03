import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import UserDropdown from "./components/UserDropdown";
import ProfileEdit from "./ProfileEdit";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

function FriendProfile() {
  const { user, isAuthenticated, isLoading, updateProfile, uploadAvatar } = useUser();
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [friendProfile, setFriendProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendPastReads, setFriendPastReads] = useState([]);
  const [pastReadsLoading, setPastReadsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [returnPath, setReturnPath] = useState(null);

  // Handle save profile from edit modal
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
    if (returnPath) {
      navigate(returnPath);
    }
  };

  // Fetch friend profile
  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!user?.id || !friendId) {
      setLoading(false);
      return;
    }

    const fetchFriendProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/friends/${user.id}/${friendId}/profile`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('Friend profile error:', errorData);
          if (res.status === 403) {
            setError("You are not friends with this user.");
          } else {
            setError(errorData.error || errorData.details || "Failed to load friend profile");
          }
          return;
        }
        const data = await res.json();
        setFriendProfile(data);
      } catch (err) {
        console.error("Error fetching friend profile:", err);
        setError("Failed to load friend profile");
      } finally {
        setLoading(false);
      }
    };

    fetchFriendProfile();
  }, [user?.id, friendId, isLoading, isAuthenticated, navigate]);

  // Fetch friend's past reads (books across all their clubs)
  useEffect(() => {
    if (!friendId) {
      setPastReadsLoading(false);
      return;
    }

    const fetchPastReads = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/${friendId}/bookshelf/past`);
        const data = await res.json();
        if (res.ok) {
          setFriendPastReads(data || []);
        }
      } catch (err) {
        console.error("Error fetching friend's past reads:", err);
      } finally {
        setPastReadsLoading(false);
      }
    };

    fetchPastReads();
  }, [friendId]);

  // Loading state
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

  if (!user) return null;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F1E2" }}>
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
        <main className="flex-grow px-4 py-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-red-300 rounded-xl shadow-sm p-8 text-center">
              <p className="text-red-600 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
                {error}
              </p>
              <button
                type="button"
                onClick={() => navigate("/friends")}
                className="px-6 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Back to Friends
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!friendProfile) return null;

  const getAvatarSrc = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
      return profilePicture;
    }
    return `${API_BASE}${profilePicture}`;
  };

  const avatarSrc = getAvatarSrc(friendProfile.profile?.profilePicture);
  const currentClubs = friendProfile.clubs.filter(c => c.currentBookId);

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
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate("/friends")}
            className="mb-6 text-[#774C30] hover:underline flex items-center gap-2"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Friends
          </button>

          {/* Profile Header */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-[#d7c4a9] overflow-hidden shadow-lg flex-shrink-0">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={friendProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                    <span className="text-4xl text-gray-700 font-semibold" style={{ fontFamily: "Times New Roman, serif" }}>
                      {friendProfile.profile?.username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-semibold text-gray-800 mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
                  {friendProfile.profile?.username || `user_${friendProfile.id}`}
                </h1>
                {friendProfile.profile?.bio && (
                  <p className="text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>
                    {friendProfile.profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>


          {/* Bookshelf Section */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
              Bookshelf
            </h2>
            
            {/* Current Reads */}
            {currentClubs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3" style={{ fontFamily: "Times New Roman, serif" }}>
                  Currently Reading
                </h3>
                <div className="space-y-4">
                  {currentClubs.map((club) => {
                    const bookData = club.currentBookData;
                    const bookTitle = bookData?.title || "Unknown Book";
                    const progress = club.progress || 0;
                    
                    return (
                      <div key={club.id} className="border border-[#e3d8c8] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
                            {bookTitle}
                          </h4>
                          <span className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-[#774C30] h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                          Reading with <strong>{club.name}</strong>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Reads (books) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3" style={{ fontFamily: "Times New Roman, serif" }}>
                Past Reads
              </h3>

              {pastReadsLoading ? (
                <p className="text-gray-600 text-sm" style={{ fontFamily: "Times New Roman, serif" }}>
                  Loading past reads...
                </p>
              ) : friendPastReads.length === 0 ? (
                <p className="text-gray-600 text-sm" style={{ fontFamily: "Times New Roman, serif" }}>
                  No past reads yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {friendPastReads.map((entry) => (
                    <div
                      key={entry.bookId}
                      className="flex items-center space-x-3 p-3 border border-[#ddcdb7] bg-[#faf6ed] 
                                 rounded hover:bg-[#f1e7d8] transition cursor-pointer"
                      style={{ fontFamily: "Times New Roman, serif" }}
                      onClick={() => navigate(`/book/${entry.bookId}`)}
                    >
                      <img
                        src={entry.bookData?.cover || ""}
                        alt={entry.bookData?.title || "Book cover"}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm text-gray-700 font-semibold">
                          {entry.bookData?.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Assigned by:{" "}
                          <Link
                            to={`/clubs/${entry.clubId}`}
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {entry.clubName}
                          </Link>
                        </p>
                        <p className="text-xs text-gray-600">
                          Finished{" "}
                          {entry.finishedAt
                            ? new Date(entry.finishedAt).toLocaleDateString()
                            : "Unknown date"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Book Clubs Section */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
              Book Clubs
            </h2>
            {friendProfile.clubs.length > 0 ? (
              <div className="space-y-2">
                {friendProfile.clubs.map((club) => (
                  <a
                    key={club.id}
                    href={`/clubs/${club.id}`}
                    className="block px-4 py-3 rounded border border-[#e6dac8] bg-[#faf6ed] hover:bg-[#efe5d5] transition-colors"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{club.name}</span>
                      {club.currentBookId && (
                        <span className="text-sm text-gray-600">({club.progress}% progress)</span>
                      )}
                    </div>
                    {club.description && (
                      <p className="text-sm text-gray-600 mt-1">{club.description}</p>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                Not a member of any book clubs yet.
              </p>
            )}
          </div>

          {/* Friends Section */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
              Friends ({friendProfile.friendsCount || 0})
            </h2>
            {friendProfile.friends && friendProfile.friends.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {friendProfile.friends.map((friend) => {
                  const friendAvatarSrc = getAvatarSrc(friend.profile?.profilePicture);
                  return (
                    <div
                      key={friend.id}
                      className="flex flex-col items-center p-3 border border-[#e3d8c8] rounded-lg hover:bg-[#faf6ed] transition-colors cursor-pointer"
                      onClick={() => navigate(`/friends/${friend.id}`)}
                    >
                      <div className="w-16 h-16 rounded-full border-2 border-[#d7c4a9] overflow-hidden shadow-lg mb-2">
                        {friendAvatarSrc ? (
                          <img src={friendAvatarSrc} alt={friend.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                            <span className="text-lg text-gray-700 font-semibold" style={{ fontFamily: "Times New Roman, serif" }}>
                              {friend.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800 text-center" style={{ fontFamily: "Times New Roman, serif" }}>
                        {friend.name}
                      </p>
                      <p className="text-xs text-gray-500 text-center" style={{ fontFamily: "Times New Roman, serif" }}>
                        @{friend.profile?.username || `user_${friend.id}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                No friends yet.
              </p>
            )}
          </div>
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

export default FriendProfile;
