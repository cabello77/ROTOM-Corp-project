import { getDaysRemainingDays } from "../../utils/date";
import UserBookshelf from "../../UserBookshelf";
import { Link } from "react-router-dom";

export default function HomeRightSidebar({
  user,
  avatarSrc,
  memberSince,
  clubsJoined = [],
  friendsCount = 0,
  onLogout
}) {
  return (
    <aside className="lg:col-span-3 space-y-4">

      {/* PROFILE CARD */}
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
                  style={{}}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pt-12 pb-6 space-y-4">
          <div>
            <h2
              className="text-xl font-semibold text-gray-800"
              style={{}}
            >
              {user.name}
            </h2>
            <p
              className="text-sm text-gray-500 mt-1"
              style={{}}
            >
              {user.email}
            </p>
          </div>

          {/* VIEW PROFILE BUTTON */}
          <Link
            to={`/profile/${user.id}`}
            className="block w-full text-center text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
            style={{}}
          >
            View Profile
          </Link>

          {/* MEMBER INFO */}
          <div
            className="text-sm text-gray-600 space-y-1"
            style={{}}
          >
            <p>Member since - {memberSince}</p>
            <p>
              {friendsCount} {friendsCount === 1 ? "friend" : "friends"}
            </p>
            <p>{user.profile?.bio || "Add a bio to show your reading style."}</p>
          </div>

        </div>
      </div>

      {/* MY CLUB PROGRESS */}
      {clubsJoined.length > 0 && (
        <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800" style={{}}>
            My Club Reading Goals
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {clubsJoined.map((club) => {
              const percent =
                typeof club.progressPercent === "number"
                  ? Math.min(100, Math.max(0, Math.round(club.progressPercent)))
                  : 0;

              return (
                <div
                  key={club.id}
                  className="space-y-1 border border-[#e3d8c8] rounded-lg p-3 bg-[#faf6ed]"
                >
                  <div className="flex justify-between items-center text-xs text-gray-700">
                    <span className="font-semibold">{club.name}</span>
                    <span>{percent}%</span>
                  </div>

                  {club.currentBookData?.title && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Book:</span>{" "}
                      {club.currentBookData.title}
                    </p>
                  )}

                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: "#774C30",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MY BOOKSHELF */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-4">
        <h2
          className="text-lg font-semibold text-gray-800"
          style={{}}
        >
          My Bookshelf
        </h2>

        <UserBookshelf userId={user.id} />
      </div>

      {/* LOGOUT BUTTON */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
        <button
          type="button"
          onClick={onLogout}
          className="w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
          style={{}}
        >
          Logout
        </button>
      </div>

    </aside>
  );
}
