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
                  style={{ fontFamily: "Times New Roman, serif" }}
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
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              {user.name}
            </h2>
            <p
              className="text-sm text-gray-500 mt-1"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              {user.email}
            </p>
          </div>

          {/* VIEW PROFILE BUTTON */}
          <Link
            to={`/profile/${user.id}`}
            className="block w-full text-center text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            View Profile
          </Link>

          {/* MEMBER INFO */}
          <div
            className="text-sm text-gray-600 space-y-1"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            <p>Member since - {memberSince}</p>
            <p>
              {friendsCount} {friendsCount === 1 ? "friend" : "friends"}
            </p>
            <p>{user.profile?.bio || "Add a bio to show your reading style."}</p>
          </div>

          {/* READING PROGRESS */}
          <div className="pt-4 border-t border-[#e3d8c8]">
            <h3
              className="text-sm font-semibold text-gray-800 mb-3"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Reading Progress
            </h3>

            <div className="space-y-3">
              {(() => {
                const clubsWithGoals = clubsJoined.filter((club) => {
                  return (
                    club.readingGoalPageStart != null &&
                    club.readingGoalPageEnd != null &&
                    club.goalDeadline != null
                  );
                });

                if (clubsJoined.length > 0 && clubsWithGoals.length === 0) {
                  return (
                    <p
                      className="text-xs text-gray-500"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      No reading goals yet.
                    </p>
                  );
                }

                if (clubsJoined.length === 0) {
                  return (
                    <p
                      className="text-xs text-gray-500"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      No progress yet. Join a club to get started!
                    </p>
                  );
                }

                return clubsWithGoals.map((club) => {
                  const title = club.currentBookData?.title || "Untitled Book";
                  const clubName = club.name || "Book Club";

                  const start = club.readingGoalPageStart;
                  const end = club.readingGoalPageEnd;

                  const currentPage = club.membershipPageNumber ?? start;
                  const totalPages = end - start;
                  const pagesRead = Math.max(0, currentPage - start);
                  const percent = Math.min(100, Math.round((pagesRead / totalPages) * 100));

                  const daysRemaining = getDaysRemainingDays(club.goalDeadline);

                  return (
                    <div key={club.id} className="space-y-1">
                      <p
                        className="text-xs font-medium text-gray-700 truncate"
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        {clubName}: <span className="italic">{title}</span> ·{" "}
                        {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left ·{" "}
                        {percent}% complete
                      </p>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#774C30] h-2 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* MY BOOKSHELF */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-4">
        <h2
          className="text-lg font-semibold text-gray-800"
          style={{ fontFamily: "Times New Roman, serif" }}
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
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Logout
        </button>
      </div>

    </aside>
  );
}
