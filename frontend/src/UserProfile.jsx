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
          <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
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
                  <img src={avatarSrc} alt={fullProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                    <span className="text-4xl text-gray-700 font-semibold" style={{ fontFamily: "Times New Roman, serif" }}>
                      {fullProfile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1
                  className="text-3xl font-semibold text-gray-800 mb-2"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  {fullProfile.name}
                </h1>

                {fullProfile.profile?.bio && (
                  <p className="text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>
                    {fullProfile.profile.bio}
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
                    const bookCover = bookData?.cover || "/default-book.png"; // Fallback for cover image
                    const bookTitle = bookData?.title || "Unknown Book";

                    return (
                      <div key={club.id} className="flex items-center border border-[#e3d8c8] rounded-lg p-4">
                        <img
                          src={bookCover}
                          alt={bookTitle}
                          className="w-12 h-16 object-cover rounded mr-4" // Adjusted the margin to position it correctly
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
                            {bookTitle}
                          </h4>
                          <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                            Reading with <strong>{club.name}</strong>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Reads */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3" style={{ fontFamily: "Times New Roman, serif" }}>
                Past Reads
              </h3>

              {fullProfile.pastReads?.length === 0 ? (
                <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                  No past reads yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {fullProfile.pastReads.map((entry) => (
                    <div
                      key={entry.bookId}
                      className="flex items-center space-x-3 p-3 border border-[#ddcdb7] bg-[#faf6ed]
                                rounded"
                      style={{ fontFamily: "Times New Roman, serif" }}
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
              Book Clubs
            </h2>

            {fullProfile.clubs.length > 0 ? (
              <div className="space-y-2">
                {fullProfile.clubs.map((club) => (
                  <div
                    key={club.id}
                    className="block px-4 py-3 rounded border border-[#e6dac8] bg-[#faf6ed] cursor-default"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">{club.name}</span> {/* Make the club name bold */}
                    </div>
                    {club.description && (
                      <p className="text-sm text-gray-600 mt-1">{club.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
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
