import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import AuthenticatedHeader from "./components/AuthenticatedHeader";
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

  // Fetch friend's past reads
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
          <p className="text-gray-600" style={{}}>
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
        <AuthenticatedHeader
          onEditProfile={(previousLocation) => {
            setIsEditModalOpen(true);
            setReturnPath(previousLocation);
          }}
        />
        <main className="flex-grow px-4 py-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-red-300 rounded-xl shadow-sm p-8 text-center">
              <p className="text-red-600 mb-4" style={{}}>
                {error}
              </p>
              <button
                type="button"
                onClick={() => navigate("/friends")}
                className="px-6 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
                style={{}}
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
  const allClubs = friendProfile.clubs;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F1E2" }}>
      <AuthenticatedHeader
        onEditProfile={(previousLocation) => {
          setIsEditModalOpen(true);
          setReturnPath(previousLocation);
        }}
      />

      <main className="flex-grow px-4 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate("/friends")}
            className="mb-6 text-[#774C30] hover:underline flex items-center gap-2"
            style={{}}
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
                    <span className="text-4xl text-gray-700 font-semibold" style={{}}>
                      {friendProfile.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-semibold text-gray-800 mb-2" style={{}}>
                  {friendProfile.name}
                </h1>
                {friendProfile.profile?.bio && (
                  <p className="text-gray-700" style={{}}>
                    {friendProfile.profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Current Reads */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Current Reads
          </h2>

          {currentClubs.length === 0 ? (
          <p className="text-sm text-gray-600">No current reads.</p>
          ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {currentClubs.map((club) => {
          const bookData = club.currentBookData;
          const bookCover = bookData?.cover || "/default-book.png";
          const bookTitle = bookData?.title || "Unknown Book";

          return (
                    <div
                    key={club.id}
                    className="flex items-center space-x-3 p-3 border border-[#ddcdb7] bg-[#faf6ed] rounded"
                    >
                    <img
                    src={bookCover}
                    alt={bookTitle}
                    className="w-12 h-16 object-cover rounded"
                    />
                    <div>
                    <p className="text-sm text-gray-700 font-semibold">
                    {bookTitle}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                    Reading with: <strong>{club.name}</strong>
                    </p>
                    </div>
                    </div>
          );
          })}
          </div>
          )}
          </div>


          {/* Past Reads */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Past Reads
          </h2>

          {friendPastReads.length === 0 ? (
          <p className="text-sm text-gray-600">No past reads yet.</p>
          ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {friendPastReads.map((entry) => (
          <div
                    key={entry.bookId}
                    className="flex items-center space-x-3 p-3 border border-[#ddcdb7] bg-[#faf6ed] rounded"
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
                    Assigned by: <strong>{entry.clubName}</strong>
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



          {/* Book Clubs Section */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{}}>
              Book Clubs
            </h2>

            {allClubs.length > 0 ? (
              <div className="space-y-3">
                {allClubs.map((club) => {
                  const percent =
                    typeof club.progressPercent === "number"
                      ? Math.min(100, Math.max(0, Math.round(club.progressPercent)))
                      : null;

                  const hasReadingGoal = club.readingGoalPageStart != null && club.readingGoalPageEnd != null;
                  const readingGoalText = hasReadingGoal
                    ? `Pages ${club.readingGoalPageStart}-${club.readingGoalPageEnd}`
                    : null;

                  const currentBookTitle = club.currentBookData?.title || null;

                  return (
                    <div
                      key={club.id}
                      className="block px-4 py-3 rounded border border-[#e6dac8] bg-[#faf6ed] cursor-default space-y-2"
                      style={{}}
                    >
                      {/* Book Club Name */}
                      <div>
                        <span className="font-bold text-gray-800 text-base">
                          {club.name}
                        </span>
                      </div>

                      {/* Current Book */}
                      {currentBookTitle && (
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Current Book:</span> {currentBookTitle}
                          </p>
                        </div>
                      )}

                      {/* Reading Goal */}
                      {readingGoalText && (
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Reading Goal:</span> {readingGoalText}
                          </p>
                        </div>
                      )}

                      {/* Progress Bar */}
                      {percent !== null && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Progress</span>
                            <span className="text-xs text-gray-600 font-medium">
                              {percent}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: "#774C30",
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600" style={{}}>
                This user is not part of any book clubs.
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

