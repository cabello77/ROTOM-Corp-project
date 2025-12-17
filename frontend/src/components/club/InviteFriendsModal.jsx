import { useState, useEffect } from "react";
import { getFriends } from "../../services/friends";
import { sendClubInvitation } from "../../services/clubInvitations";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function InviteFriendsModal({ isOpen, onClose, clubId, inviterId, onInviteSent }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [clubMembers, setClubMembers] = useState([]);

  useEffect(() => {
    if (!isOpen || !inviterId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch friends
        const friendsList = await getFriends(inviterId);
        
        // Fetch club members to exclude them from the list
        const membersRes = await fetch(`${API_BASE}/api/clubs/${clubId}/members`);
        const membersData = await membersRes.json();
        const memberIds = new Set((membersData || []).map((m) => m.userId));
        
        // Filter out members and the inviter themselves
        const availableFriends = friendsList.filter(
          (friend) => {
            const friendId = friend.friend?.id || friend.id;
            return friendId !== inviterId && !memberIds.has(friendId);
          }
        );
        
        setFriends(availableFriends);
        setClubMembers(membersData || []);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError("Failed to load friends. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, clubId, inviterId]);

  const handleToggleFriend = (friendId) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }
      return next;
    });
  };

  const handleSendInvitations = async () => {
    if (selectedFriends.size === 0) {
      setError("Please select at least one friend to invite");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const invitations = Array.from(selectedFriends).map((friendId) =>
        sendClubInvitation(clubId, inviterId, friendId)
      );

      await Promise.all(invitations);
      console.log(`Successfully sent ${selectedFriends.size} invitation(s)`);
      
      if (onInviteSent) {
        onInviteSent();
      }
      
      onClose();
      setSelectedFriends(new Set());
    } catch (err) {
      console.error("Error sending invitations:", err);
      setError(err.message || "Failed to send invitations. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const getAvatarSrc = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
      return profilePicture;
    }
    return `${API_BASE}${profilePicture}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e3d8c8]">
          <div className="flex justify-between items-center">
            <h2
              className="text-2xl font-semibold text-gray-800"
              style={{}}
            >
              Invite Friends to Book Club
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#774C30] mx-auto"></div>
              <p className="mt-4 text-gray-600" style={{}}>
                Loading friends...
              </p>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600" style={{}}>
                No friends available to invite. All your friends are already members of this club.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => {
                const friendData = friend.friend || friend;
                const friendId = friendData.id;
                const avatarSrc = getAvatarSrc(friendData.profile?.profilePicture);
                const isSelected = selectedFriends.has(friendId);

                return (
                  <div
                    key={friendId}
                    onClick={() => handleToggleFriend(friendId)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      isSelected
                        ? "border-[#774C30] bg-[#efe6d7]"
                        : "border-[#e3d8c8] bg-white hover:bg-[#f7f1e2]"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full border-2 border-[#d7c4a9] overflow-hidden flex-shrink-0">
                        {avatarSrc ? (
                          <img src={avatarSrc} alt={friendData.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                            <span className="text-lg text-gray-700 font-semibold" style={{}}>
                              {friendData.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-gray-800 truncate"
                          style={{}}
                        >
                          {friendData.name}
                        </h3>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-[#774C30] bg-[#774C30]"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e3d8c8] flex justify-between items-center">
          <p className="text-sm text-gray-600" style={{}}>
            {selectedFriends.size} friend{selectedFriends.size !== 1 ? "s" : ""} selected
          </p>
          <div className="space-x-3">
            <button
              onClick={onClose}
              disabled={sending}
              className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              style={{}}
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvitations}
              disabled={sending || selectedFriends.size === 0}
              className="px-4 py-2 rounded border border-[#774C30] bg-[#774C30] text-white hover:bg-[#5a3a24] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{}}
            >
              {sending ? "Sending..." : `Send Invitation${selectedFriends.size !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

