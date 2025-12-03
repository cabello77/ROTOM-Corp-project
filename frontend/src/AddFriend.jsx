import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import UserDropdown from "./components/UserDropdown";
import ProfileEdit from "./ProfileEdit";
import { getAllUsers, sendFriendRequest, getFriends, getPendingFriendRequests, getReceivedFriendRequests } from "./services/friends";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

function AddFriend() {
  const { user, isAuthenticated, isLoading, updateProfile, uploadAvatar } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]); // Requests sent by current user
  const [receivedRequests, setReceivedRequests] = useState([]); // Requests received by current user
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [returnPath, setReturnPath] = useState(null);
  const [sendingRequests, setSendingRequests] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Handle save profile from edit modal
  const handleSaveProfile = async (payload) => {
    try {
      console.log("Received Payload in handleSaveProfile:", payload);
      const { name, email, avatarFile, removeAvatar, profile } = payload;
      
      // Logging profile data for further inspection
      console.log("Profile:", profile);
      console.log("Profile bio:", profile?.bio);
      console.log("Profile username:", profile?.username);

      const bio = profile?.bio || null; // Ensure bio is safely accessed from profile

      // Sending data to updateProfile
      await updateProfile(user.id, {
        name,
        email,
        profile: {
          bio,               // Pass the bio correctly
          username: profile?.username || '',  // Ensure username is passed properly
        },
      });

      if (avatarFile) {
        await uploadAvatar(user.id, avatarFile);
      } else if (removeAvatar) {
        await updateProfile(user.id, {
          profile: {
            bio,               // Pass bio if removing avatar as well
            username: profile?.username || '',  // Ensure username is passed
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

  // Fetch all users and friends
  useEffect(() => {
    if (isLoading) return; // Wait for user context to load
    
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [usersList, friendsList, pendingRequestsList, receivedRequestsList] = await Promise.all([
          getAllUsers(),
          getFriends(user.id).catch(() => []), // Don't fail if friends fetch fails
          getPendingFriendRequests(user.id).catch(() => []), // Don't fail if pending requests fetch fails
          getReceivedFriendRequests(user.id).catch(() => []), // Don't fail if received requests fetch fails
        ]);
        
        console.log("Fetched users:", usersList);
        console.log("Current user ID:", user.id);
        
        // Ensure usersList is an array
        const usersArray = Array.isArray(usersList) ? usersList : [];
        
        // Filter out current user
        const otherUsers = usersArray.filter(u => u && u.id !== user.id);
        console.log("Other users after filtering:", otherUsers);
        
        setUsers(otherUsers);
        setFriends(Array.isArray(friendsList) ? friendsList.map(f => f?.friend?.id).filter(Boolean) : []);
        // Set pending requests IDs (for button state only, not displayed)
        const pendingArray = Array.isArray(pendingRequestsList) ? pendingRequestsList : [];
        const pendingIds = pendingArray.map(p => p?.friend?.id).filter(Boolean);
        setPendingRequests(pendingIds);
        // Set received requests IDs (users who sent requests to current user)
        const receivedArray = Array.isArray(receivedRequestsList) ? receivedRequestsList : [];
        const receivedIds = receivedArray.map(r => r?.user?.id).filter(Boolean);
        setReceivedRequests(receivedIds);
      } catch (err) {
        console.error("Error fetching data:", err);
        console.error("Error details:", err.message, err.stack);
        setUsers([]);
        setFriends([]);
        setPendingRequests([]);
        setReceivedRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, isLoading, isAuthenticated, navigate]);

  const handleAddFriend = async (friendId) => {
    if (!user?.id) return;
    
    // Don't allow sending if already pending (sent by user), friend, or if user has received a request from them
    if (isPending(friendId) || isFriend(friendId) || hasReceivedRequest(friendId)) {
      return;
    }
    
    setSendingRequests(prev => new Set(prev).add(friendId));
    
    try {
      await sendFriendRequest(user.id, friendId);
      // Add to pending requests - this will update the button state
      setPendingRequests(prev => {
        if (prev.includes(friendId)) return prev;
        return [...prev, friendId];
      });
      // Note: A notification is sent to the target user via the backend
      // The friend request is stored with status "PENDING" and can be retrieved
      // by the recipient through the pending requests endpoint
    } catch (err) {
      console.error("Error sending friend request:", err);
      console.error("Failed to send friend request:", err.message || err);
      
      // If error is "already exists", update state to reflect that
      if (err.message && err.message.includes("already exists")) {
        // Check if we received a request from them
        const receivedIds = receivedRequests;
        if (!receivedIds.includes(friendId)) {
          // It might be a pending request we sent but didn't track, or they sent us one
          // Refresh the data to get the latest state
          const [pendingList, receivedList] = await Promise.all([
            getPendingFriendRequests(user.id).catch(() => []),
            getReceivedFriendRequests(user.id).catch(() => [])
          ]);
          const newPendingIds = Array.isArray(pendingList) ? pendingList.map(p => p?.friend?.id).filter(Boolean) : [];
          const newReceivedIds = Array.isArray(receivedList) ? receivedList.map(r => r?.user?.id).filter(Boolean) : [];
          setPendingRequests(newPendingIds);
          setReceivedRequests(newReceivedIds);
        }
      }
    } finally {
      setSendingRequests(prev => {
        const next = new Set(prev);
        next.delete(friendId);
        return next;
      });
    }
  };

  const isFriend = (userId) => friends.includes(userId);
  const isPending = (userId) => pendingRequests.includes(userId);
  const hasReceivedRequest = (userId) => receivedRequests.includes(userId);
  const isSending = (userId) => sendingRequests.has(userId);

  // Filter users based on search query (case-insensitive search by username)
  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const username =
      (user?.profile?.username || user?.username || "").toLowerCase();

    return username.includes(query);
  });

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F1E2" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getAvatarSrc = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
      return profilePicture;
    }
    return `${API_BASE}${profilePicture}`;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F1E2" }}>
      {/* Header */}
      <header className="text-white shadow" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-6xl md:text-8xl italic" style={{ fontFamily: "Kapakana, cursive" }}>
              Plotline
            </div>
            <div className="flex items-center space-x-3">
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
          <div className="flex items-center justify-between mb-6">
            <h1
              className="text-3xl font-semibold"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Add Friends
            </h1>
            <button
              type="button"
              onClick={() => navigate("/friends")}
              className="px-6 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              View Friends
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400"
                  style={{ fontFamily: "Times New Roman, serif", backgroundColor: "transparent" }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* All Users Section */}
          <div>
            <h2
              className="text-xl font-semibold text-gray-800 mb-4"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              All Users
            </h2>
            {filteredUsers.length === 0 ? (
              <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                  {searchQuery ? `No users found matching "${searchQuery}"` : "No other users found."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsers.map((otherUser) => {
                  const avatarSrc = getAvatarSrc(otherUser.profile?.profilePicture);
                  const alreadyFriend = isFriend(otherUser.id);
                  const pending = isPending(otherUser.id);
                  const received = hasReceivedRequest(otherUser.id);
                  const sending = isSending(otherUser.id);

                  return (
                    <div key={otherUser.id}
                      className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 flex flex-col"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full border-2 border-[#d7c4a9] overflow-hidden shadow-lg mr-4">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={otherUser?.profile?.username || otherUser?.username || "avatar"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                              <span className="text-xl text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>
                                {otherUser?.profile?.username?.charAt(0)?.toUpperCase()
                                  || otherUser?.username?.charAt(0)?.toUpperCase()
                                  || "?"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-lg font-semibold text-gray-800 truncate"
                            style={{ fontFamily: "Times New Roman, serif" }}
                          >
                            {otherUser?.profile?.username || otherUser?.username || ""}
                          </h3>
                        </div>
                      </div>

                      {otherUser.profile?.bio && (
                        <p className="text-xs text-gray-600 mb-4 line-clamp-2"
                          style={{ fontFamily: "Times New Roman, serif" }}>
                          {otherUser.profile.bio}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => handleAddFriend(otherUser.id)}
                        disabled={alreadyFriend || pending || received || sending}
                        className={`w-full px-4 py-2 rounded border transition-colors ${
                          alreadyFriend
                            ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                            : pending || received || sending
                            ? "border-[#ddcdb7] bg-[#f7ecda] text-gray-600 cursor-not-allowed"
                            : "border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] text-gray-800"
                        }`}
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        {alreadyFriend
                          ? "Already Friends"
                          : pending
                          ? "Friend Request Sent"
                          : received
                          ? "Request Pending"
                          : sending
                          ? "Sending..."
                          : "Add"}
                      </button>
                    </div>
                  );
                })}

              </div>
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

export default AddFriend;

