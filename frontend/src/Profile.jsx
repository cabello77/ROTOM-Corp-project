import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import ProfileEdit from "./ProfileEdit";

function Profile() {
  const { user: contextUser, updateUser, logout, isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const user = contextUser;

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSaveProfile = (updatedData) => {
    updateUser(updatedData);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isDemoUser = Boolean(user.isDemo);
  const friendPool = Array.isArray(user.friendsList) && user.friendsList.length
    ? user.friendsList
    : [];
  const displayedFriends = friendPool.length
    ? friendPool.slice(0, 8)
    : (isDemoUser ? ["Jess", "Kai", "Morgan", "Tala"] : []);
  const bookClubs = Array.isArray(user.bookClubs) ? user.bookClubs : [];
  const readingProgress = Array.isArray(user.readingProgress) ? user.readingProgress : [];

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <header className="text-white" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div
              className="text-6xl md:text-8xl italic"
              style={{ fontFamily: "Kapakana, cursive" }}
            >
              Plotline
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center">
                      <span
                        className="text-white font-bold text-sm"
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-1 text-white hover:text-gray-200 transition-colors">
                  <span
                    className="text-sm font-medium"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    {user.name}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>
                    <Link
                      to="/dashboard"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Home</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-blue-400"></div>
      </header>

      <main className="flex-grow bg-amber-50 px-4 py-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="w-full lg:w-64 space-y-5">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                <h2
                  className="text-lg font-semibold text-gray-800 mb-4"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  My Book Clubs
                </h2>
                <div className="space-y-3">
                  {bookClubs.length ? (
                    bookClubs.map((club) => (
                      <button
                        key={club.id}
                        className="w-full text-left px-4 py-2 rounded border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        {club.name}
                      </button>
                    ))
                  ) : (
                    <p
                      className="text-sm text-gray-600"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      Join a club to see it here.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
                <div>
                  <h3
                    className="text-base font-semibold text-gray-800"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    Discover
                  </h3>
                  <p
                    className="text-sm text-gray-600 mt-1"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    Explore trending clubs and discussions.
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full text-gray-800 px-4 py-2 rounded border border-gray-300 hover:opacity-80 transition-opacity"
                  style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#D9D9D9" }}
                >
                  Discover Clubs
                </button>
                <button
                  type="button"
                  className="w-full text-gray-800 px-4 py-2 rounded border border-dashed border-gray-400 hover:border-blue-400 transition-colors"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  Or Create Your Own
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-base font-semibold text-gray-800"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    Friends
                  </h3>
                  <button
                    onClick={() => navigate("/friends")}
                    className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    View all
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {displayedFriends.length ? (
                    displayedFriends.map((friend, idx) => {
                      const initial =
                        typeof friend === "string"
                          ? friend.slice(0, 2).toUpperCase()
                          : (friend?.name || `F${idx + 1}`).slice(0, 2).toUpperCase();
                      return (
                        <div
                          key={`${initial}-${idx}`}
                          className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold"
                          style={{ fontFamily: "Times New Roman, serif" }}
                        >
                          {initial}
                        </div>
                      );
                    })
                  ) : (
                    <p
                      className="col-span-4 text-sm text-gray-600 text-center"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      No friends yet. Add friends to see them here.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="w-full text-gray-800 px-3 py-2 rounded border border-gray-300 hover:opacity-80 transition-opacity text-sm"
                  style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#D9D9D9" }}
                >
                  Add Friends
                </button>
              </div>
            </aside>

            <section className="flex-1 space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
                  <input
                    type="search"
                    placeholder="Search posts, clubs, or friends"
                    className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  />
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                      </svg>
                    </button>
                    <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.654 0 3-1.346 3-3S13.654 2 12 2 9 3.346 9 5s1.346 3 3 3zm0 2c-2.206 0-4 1.794-4 4v4h8v-4c0-2.206-1.794-4-4-4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {bookClubs.length ? (
                bookClubs.map((club, idx) => (
                  <div
                    key={club.id || idx}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h2
                          className="text-xl font-semibold text-gray-800"
                          style={{ fontFamily: "Times New Roman, serif" }}
                        >
                          {club.name}
                        </h2>
                        <p
                          className="text-sm text-gray-500"
                          style={{ fontFamily: "Times New Roman, serif" }}
                        >
                          {club.active
                            ? "Active discussions waiting for you."
                            : "This club is quiet — start a new thread!"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-gray-800 px-4 py-2 rounded border border-gray-300 hover:opacity-80 transition-opacity text-sm"
                        style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#D9D9D9" }}
                      >
                        See all posts
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Array.from({ length: 3 }).map((_, cardIdx) => (
                        <div
                          key={cardIdx}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:border-blue-400 transition-colors"
                        >
                          <h3
                            className="font-semibold text-gray-800 mb-2"
                            style={{ fontFamily: "Times New Roman, serif" }}
                          >
                            {club.name} Discussion #{cardIdx + 1}
                          </h3>
                          <p
                            className="text-sm text-gray-600"
                            style={{ fontFamily: "Times New Roman, serif" }}
                          >
                            Share insights from your latest read or start a new conversation.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-gray-600"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  Join a book club to see curated discussions here.
                </div>
              )}

              <div
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center text-sm text-gray-600"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                You're all caught up! :)
              </div>
            </section>

            <aside className="w-full lg:w-72 space-y-5">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl text-gray-600 font-semibold"
                          style={{ fontFamily: "Times New Roman, serif" }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h2
                      className="text-xl font-semibold text-gray-800"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      {user.name}
                    </h2>
                    <p
                      className="text-sm text-gray-600 flex items-center space-x-1"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <span>{user.email}</span>
                    </p>
                  </div>
                </div>
                <div
                  className="text-sm text-gray-600 space-y-2"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  <p className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Member since {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : "—"}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h8m-8 4h6" />
                    </svg>
                    <span>{user.friends ?? 0} friends</span>
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {user.bio?.trim()
                      ? user.bio
                      : "Add a bio to let other readers know what you love."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full text-gray-800 px-4 py-2 rounded border border-gray-300 hover:opacity-80 transition-opacity"
                  style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#D9D9D9" }}
                >
                  Edit Profile
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h3
                  className="text-lg font-semibold text-gray-800 mb-4"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  My Bookshelf
                </h3>
                <div className="space-y-3">
                  {readingProgress.length ? (
                    readingProgress.map((item, idx) => (
                      <div key={idx}>
                        <div
                          className="flex items-center justify-between text-sm text-gray-700 mb-1"
                          style={{ fontFamily: "Times New Roman, serif" }}
                        >
                          <span className="font-medium">{item.book}</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p
                      className="text-sm text-gray-600"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      Track books to build your shelf.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-gray-800 px-4 py-2 rounded border border-gray-300 hover:opacity-80 transition-opacity font-medium"
                  style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#D9D9D9" }}
                >
                  Logout
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="text-white py-8" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p style={{ fontFamily: "Times New Roman, serif" }}>
            &copy; 2025 Plotline brought to you by ROTOM Corporation
          </p>
        </div>
      </footer>

      <ProfileEdit
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

export default Profile;
