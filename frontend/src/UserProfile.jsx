import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import AuthenticatedHeader from "./components/AuthenticatedHeader";
import ProfileEdit from "./ProfileEdit";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function UserProfile() {
  const { user, isAuthenticated, isLoading, updateProfile, uploadAvatar } = useUser();
  const navigate = useNavigate();

  const [fullProfile, setFullProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [returnPath, setReturnPath] = useState(null);

  // Edit/save handler
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
      if (returnPath) navigate(returnPath);
    } catch (err) {
      console.error("Profile save error:", err);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    if (returnPath) navigate(returnPath);
  };

  // Fetch the user's COMPLETE profile (clubs, bookshelf, friends, etc.)
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
        const data = await res.json();
        setFullProfile(data);
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
          <p className="text-gray-600" style={{}}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !fullProfile) return null;

  const avatarSrc = fullProfile.profile?.profilePicture
    ? fullProfile.profile.profilePicture.startsWith("http")
      ? fullProfile.profile.profilePicture
      : `${API_BASE}${fullProfile.profile.profilePicture}` 
    : null;

  const currentClubs = fullProfile.clubs.filter(c => c.currentBookId);
  const pastClubs = fullProfile.clubs.filter(c => !c.currentBookId);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F1E2" }}>
      <AuthenticatedHeader
        onEditProfile={(previousLocation) => {
          setIsEditModalOpen(true);
          setReturnPath(previousLocation);
        }}
      />

      {/* Main Content */}
      <main className="flex-grow px-4 py-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Profile Header */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-[#d7c4a9] overflow-hidden shadow-lg flex-shrink-0">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={fullProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                    <span className="text-4xl text-gray-700 font-semibold" style={{}}>
                      {fullProfile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1
                  className="text-3xl font-semibold text-gray-800 mb-2"
                  style={{}}
                >
                  {fullProfile.name}
                </h1>

                {fullProfile.profile?.bio && (
                  <p className="text-gray-700" style={{}}>
                    {fullProfile.profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bookshelf Section */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{}}>
              Bookshelf
            </h2>

            {/* Current Reads */}
          <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Currently Reading
          </h3>

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
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3" style={{}}>
                Past Reads
              </h3>

              {fullProfile.pastReads?.length === 0 ? (
                <p className="text-sm text-gray-600" style={{}}>
                  No past reads yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {fullProfile.pastReads.map((entry, index) => (
                    <div
                      key={entry.bookId || `past-read-${index}`}
                      className="flex items-center space-x-3 p-3 border border-[#ddcdb7] bg-[#faf6ed]
                                rounded"
                      style={{}}
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
          </div>

          {/* Book Clubs */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{}}>
              Book Clubs
            </h2>

            {fullProfile.clubs.length > 0 ? (
              <div className="space-y-3">
                {fullProfile.clubs.map((club, index) => {
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
                      key={club.id || `club-${index}`}
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
                You are not part of any book clubs yet.
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
