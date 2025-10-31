import { Link } from "react-router-dom";

export default function HomeLeftSidebar({ allClubs = [], friendsList = [] }) {
  return (
    <aside className="lg:col-span-3 space-y-4">
      {/* My Book Clubs */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
          My Book Clubs
        </h2>
        <div className="space-y-3">
          {allClubs.length ? (
            allClubs.map((club) => (
              <Link
                key={club.id}
                to={`/clubs/${club.id}`}
                className="block text-left px-4 py-2 rounded border border-[#e6dac8] bg-[#faf6ed] hover:bg-[#efe5d5] transition-colors"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {club.name}
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
              Join or create a club to see it here.
            </p>
          )}
        </div>
      </div>

      {/* Discover */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
            Discover
          </h3>
          <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: "Times New Roman, serif" }}>
            Explore trending clubs and discussions.
          </p>
        </div>
        <Link
          to="/clubs"
          className="block text-center w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Discover Clubs
        </Link>
        <Link
          to="/clubs/new"
          className="block text-center w-full text-gray-700 px-4 py-2 rounded border border-[#ddcdb7] bg-white hover:bg-[#f7ecda] transition-colors"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Or Create Your Own
        </Link>
      </div>

      {/* Friends */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
          Friends
        </h2>
        <div className="flex flex-wrap gap-3">
          {friendsList.length ? (
            friendsList.map((friend) => (
              <span
                key={friend}
                className="px-4 py-2 rounded-full border border-[#ddcdb7] bg-[#faf6ed] text-sm text-gray-700"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {friend}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
              Add friends to see them here.
            </p>
          )}
        </div>
        <button
          type="button"
          className="w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Add Friends
        </button>
      </div>
    </aside>
  );
}

