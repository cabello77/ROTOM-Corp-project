import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import UserDropdown from "./components/UserDropdown";
import ProfileEdit from "./ProfileEdit";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

function ClubDiscover() {
  const { user, isAuthenticated, isLoading, updateProfile, uploadAvatar } = useUser();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
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

  // Fetch all clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/clubs`);
        const data = await res.json();

        if (Array.isArray(data)) {
          // Sort alphabetically by name
          const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
          setClubs(sorted);
        } else if (data && Array.isArray(data.clubs)) {
          const sorted = [...data.clubs].sort((a, b) => a.name.localeCompare(b.name));
          setClubs(sorted);
        } else {
          setClubs([]);
        }
      } catch (err) {
        console.error("Error fetching clubs:", err);
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p
            className="text-gray-600"
            style={{}}
          >
            Loading clubs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      {/* Header */}
      <header className="text-white" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link
              to="/user-home"
              className="text-6xl md:text-8xl italic cursor-pointer hover:opacity-80 transition-opacity"
              style={{ fontFamily: "Dancing Script, cursive", textDecoration: "none", color: "white" }}
            >
              Plotline
            </Link>
            <div className="space-x-4">
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
          {/* Discover Clubs Section - Centered */}
          <section className="flex flex-col items-center">
            <h1
              className="text-3xl font-semibold text-center mb-8"
              style={{}}
            >
              Discover Book Clubs
            </h1>

            {clubs.length === 0 ? (
              <p
                className="text-center text-gray-600"
                style={{}}
              >
                No clubs found yet. Be the first to create one!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {clubs.map((club) => (
                  <div
                    key={club.id}
                    className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 flex flex-col justify-between"
                  >
                    <div>
                      <h2
                        className="text-xl font-semibold mb-2"
                        style={{}}
                      >
                        {club.name}
                      </h2>
                      <p
                        className="text-sm text-gray-600 mb-3"
                        style={{}}
                      >
                        {club.description || "No description available."}
                      </p>
                    </div>
                    <div
                      className="mt-2 text-sm text-gray-500"
                      style={{}}
                    >
                      Created by:{" "}
                      <strong>{club.creator?.name || "Unknown"}</strong>
                      <br />
                      {new Date(club.createdAt).toLocaleDateString()}
                    </div>
                    <Link
                      to={`/clubs/${club.id}`}
                      className="mt-4 block w-full text-center px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
                      style={{}}
                    >
                      View Book Club
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
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

export default ClubDiscover;
