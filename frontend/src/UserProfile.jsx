import { useParams, Link } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import UserBookshelf from "./UserBookshelf";

export default function UserProfile() {
  const { id } = useParams();
  const { user } = useUser();

  // If someone tries to view another user's profile (route: /profile/:id)
  const isOwnProfile = String(user.id) === String(id);

  // Temporary fallback for missing backend routes
  const placeholderClubs = [];
  const placeholderFriends = [];

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: "#F7F1E2" }}>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER CARD */}
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#d7c4a9] h-28 relative">
            <div className="absolute left-8 -bottom-12 w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg">
              {user.profile?.profilePicture ? (
                <img
                  src={user.profile.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="bg-[#efe2cf] w-full h-full flex items-center justify-center">
                  <span
                    className="text-3xl text-gray-700"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="px-8 pt-16 pb-8 space-y-3">
            <h1
              className="text-2xl font-semibold text-gray-800"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              {isOwnProfile ? user.name : "User"}
            </h1>

            <p
              className="text-sm text-gray-600"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              {isOwnProfile ? user.email : "Email unavailable"}
            </p>

            <p
              className="text-sm text-gray-700 mt-1"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              {user.profile?.bio || "This user has not added a bio yet."}
            </p>

            {/* EDIT BUTTON — ONLY FOR OWN PROFILE */}
            {isOwnProfile && (
              <Link
                to="/edit-profile"
                className="inline-block mt-3 text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* BOOKSHELF SECTION */}
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6">
          <h2
            className="text-xl font-semibold text-gray-800 mb-4"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Bookshelf
          </h2>

          <UserBookshelf userId={user.id} />
        </div>

        {/* CLUBS SECTION (PLACEHOLDER) */}
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6">
          <h2
            className="text-xl font-semibold text-gray-800 mb-3"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Book Clubs
          </h2>

          {placeholderClubs.length === 0 ? (
            <p
              className="text-sm text-gray-600"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Book club information will appear here once backend support is added.
            </p>
          ) : (
            placeholderClubs.map((club) => (
              <div key={club.id}>{club.name}</div>
            ))
          )}
        </div>

        {/* FRIENDS SECTION (PLACEHOLDER) */}
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6">
          <h2
            className="text-xl font-semibold text-gray-800 mb-3"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Friends
          </h2>

          {placeholderFriends.length === 0 ? (
            <p
              className="text-sm text-gray-600"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Friends list will be displayed here after backend routes are implemented.
            </p>
          ) : (
            placeholderFriends.map((f) => (
              <div key={f.id}>{f.username}</div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
