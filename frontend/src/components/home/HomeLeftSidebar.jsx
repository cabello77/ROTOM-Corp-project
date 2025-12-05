import { Link, useNavigate } from "react-router-dom";

export default function HomeLeftSidebar({ clubsCreated = [], clubsJoined = [], friendsList = [] }) {
  const navigate = useNavigate();
  
  // Filter out clubs from clubsJoined that are also in clubsCreated (to avoid duplicates)
  const memberClubsOnly = clubsJoined.filter(
    joinedClub => !clubsCreated.some(createdClub => createdClub.id === joinedClub.id)
  );
  
  const isHost = clubsCreated.length > 0;
  
  return (
    <aside className="lg:col-span-3 space-y-4">
      
      {/* My Book Clubs */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4" style={{}}>
          My Book Clubs
        </h2>
        
        {/* Book Clubs I Host */}
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-700 mb-3" style={{}}>
            Host
          </h3>
          <div className="space-y-3">
            {clubsCreated.length ? (
              clubsCreated.map((club) => (
                <Link
                  key={club.id}
                  to={`/clubs/${club.id}`}
                  className="block text-left px-4 py-2 rounded border border-[#e6dac8] bg-[#faf6ed] hover:bg-[#efe5d5] transition-colors"
                  style={{}}
                >
                  {club.name}
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-600" style={{}}>
                No clubs hosted yet.
              </p>
            )}
          </div>
        </div>

        {/* Book Clubs I'm In */}
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-3" style={{}}>
            Member
          </h3>
          <div className="space-y-3">
            {memberClubsOnly.length ? (
              memberClubsOnly.map((club) => (
                <Link
                  key={club.id}
                  to={`/clubs/${club.id}`}
                  className="block text-left px-4 py-2 rounded border border-[#e6dac8] bg-[#faf6ed] hover:bg-[#efe5d5] transition-colors"
                  style={{}}
                >
                  {club.name}
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-600" style={{}}>
                You're not a member of any other clubs.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Discover */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800" style={{}}>
            Discover
          </h3>
          <p className="text-sm text-gray-600 mt-1" style={{}}>
            Explore trending clubs and discussions.
          </p>
        </div>
        <Link
          to="/clubs"
          className="block text-center w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
          style={{}}
        >
          Discover Clubs
        </Link>
        <Link
          to="/clubs/new"
          className="block text-center w-full text-gray-700 px-4 py-2 rounded border border-[#ddcdb7] bg-white hover:bg-[#f7ecda] transition-colors"
          style={{}}
        >
          Or Create Your Own
        </Link>
      </div>

      {/* Friends */}
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800" style={{}}>
          Friends
        </h2>
        <div className="flex flex-wrap gap-3">
          {friendsList.length ? (
            friendsList.map((friend) => {
              const friendData = friend.friend || friend;
              const profilePicture = friendData.profile?.profilePicture;
              const avatarSrc = profilePicture 
                ? (profilePicture.startsWith("http://") || profilePicture.startsWith("https://") 
                    ? profilePicture 
                    : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"}${profilePicture}`)
                : null;
              const name = friendData.name || friendData.profile?.username || 'Unknown';
              
              return (
                <div
                  key={friendData.id || friend.id || name}
                  className="relative group cursor-pointer"
                  title={name}
                  onClick={() => navigate(`/friends/${friendData.id || friend.id}`)}
                >
                  <div className="w-12 h-12 rounded-full border-2 border-[#d7c4a9] overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                        <span className="text-lg text-gray-700 font-semibold" style={{}}>
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-600" style={{}}>
              Add friends to see them here.
            </p>
          )}
        </div>
        <Link
          to="/add-friend"
          className="block w-full text-center text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
          style={{}}
        >
          Add Friends
        </Link>

        {/* ⭐ Direct Messages Section */}
        <div
          onClick={() => navigate("/dms")}
          className="block w-full text-center text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#faf6ed] hover:bg-[#efe5d5] transition-colors cursor-pointer"
          style={{}}
        >
          Direct Messages
        </div>

      </div>
    </aside>
  );
}
