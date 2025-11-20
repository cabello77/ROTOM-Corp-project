import { useParams, Link } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import ClubHeader from "./components/club/ClubHeader";
import UserBookshelf from "./UserBookshelf";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function UserProfile() {
  const { id } = useParams();
  const { user } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "Times New Roman, serif" }}>Loading profile...</p>
      </div>
    );
  }

  // Viewing own profile?
  const isOwnProfile = String(user.id) === String(id);

  // For avatar images
  const avatarSrc =
    user.profile?.profilePicture &&
    (user.profile.profilePicture.startsWith("http")
      ? user.profile.profilePicture
      : `${API_BASE}${user.profile.profilePicture}`);

  return (
    <>
      <ClubHeader />

      <main
        className="min-h-screen px-4 py-10"
        style={{ backgroundColor: "#F7F1E2" }}
      >
        <div className="max-w-4xl mx-auto">

          {/* PROFILE HEADER */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-start gap-6">

              {/* AVATAR */}
              <div className="w-32 h-32 rounded-full border-4 border-[#d7c4a9] overflow-hidden shadow-lg">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                    <span
                      className="text-4xl text-gray-700 font-semibold"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* TEXT AREA */}
              <div>
                <h1
                  className="text-3xl font-semibold text-gray-800 mb-2"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  {user.name}
                </h1>

                <p
                  className="text-lg text-gray-500 mb-4"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  @{user.profile?.username || `user_${user.id}`}
                </p>

                <p
                  className="text-gray-700 mb-3"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  {user.profile?.bio || "This user has not added a bio yet."}
                </p>

                {isOwnProfile && (
                  <Link
                    to="/edit-profile"
                    className="inline-block px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2]"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* BOOKSHELF */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 mb-8">
            <h2
              className="text-2xl font-semibold text-gray-800 mb-4"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Bookshelf
            </h2>

            {/* Uses SAME UI as on friend profile */}
            <UserBookshelf userId={user.id} />
          </div>

          {/* BOOK CLUBS SECTION */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 mb-8">
            <h2
              className="text-2xl font-semibold text-gray-800 mb-4"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Book Clubs
            </h2>

            <p
              className="text-gray-600"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Book club information will appear here once backend support exists.
            </p>
          </div>

          {/* FRIENDS SECTION */}
          <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6">
            <h2
              className="text-2xl font-semibold text-gray-800 mb-4"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Friends
            </h2>

            <p
              className="text-gray-600"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Friends will appear here after backend routes are added.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
