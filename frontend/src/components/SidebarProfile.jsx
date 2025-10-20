import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function SidebarProfile() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatarSrc = useMemo(() => {
    const path = user?.profile?.profilePicture;
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${API_BASE}${path}`;
  }, [user?.profile?.profilePicture]);

  const memberSince = user?.profile?.joinDate
    ? new Date(user.profile.joinDate).toLocaleDateString()
    : "—";

  return (
    <aside className="lg:col-span-3 space-y-4 sticky top-6 self-start">
      {/* Profile Summary Card */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm overflow-hidden">
        <div className="bg-[#d7c4a9] h-20 relative">
          <div className="absolute left-6 -bottom-10 w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-lg">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                <span
                  className="text-2xl text-gray-700"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="px-6 pt-12 pb-6 space-y-4">
          <div>
            <h2
              className="text-xl font-semibold text-gray-800 capitalize"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              {user?.name}
            </h2>
            <p
              className="text-sm text-gray-500 mt-1"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              {user?.email}
            </p>
          </div>
          <div
            className="text-sm text-gray-600 space-y-1"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            <p>Member since — {memberSince}</p>
            <p>{user?.friends ?? 0} friends</p>
            <p>
              {user?.profile?.bio ||
                "Add a bio to let other readers know what you love."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="w-full px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* My Bookshelf */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
        <h3
          className="text-base font-semibold text-gray-800"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          My Bookshelf
        </h3>
        <p
          className="text-sm text-gray-600"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Track books to build your shelf.
        </p>
        <button
          type="button"
          className="w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Update Shelf
        </button>
      </div>

      {/* Logout */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default SidebarProfile;
