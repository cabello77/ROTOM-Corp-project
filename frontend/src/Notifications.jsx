import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import UserDropdown from "./components/UserDropdown";
import ProfileEdit from "./ProfileEdit";
import { getReceivedFriendRequests, respondToFriendRequest, getPendingFriendRequests } from "./services/friends";
import { getClubInvitations, respondToClubInvitation } from "./services/clubInvitations";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

function Notifications() {
  const { user, isAuthenticated, isLoading, updateProfile, uploadAvatar } = useUser();
  const navigate = useNavigate();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [clubInvitations, setClubInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [returnPath, setReturnPath] = useState(null);

  // Handle save profile from edit modal
  const handleSaveProfile = async (updatedData) => {
    try {
      const { name, email, bio, avatarFile, removeAvatar } = updatedData;
      
      await updateProfile(user.id, {
        name,
        email,
        profile: {
          bio,
          fullName: name,
          username: user.profile?.username || `user_${user.id}`,
        },
      });

      if (avatarFile) {
        await uploadAvatar(user.id, avatarFile);
      } else if (removeAvatar) {
        await updateProfile(user.id, {
          profile: {
            bio,
            fullName: name,
            username: user.profile?.username || `user_${user.id}`,
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

  // Fetch received friend requests
  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const [receivedData, sentData, clubInvitesData] = await Promise.all([
          getReceivedFriendRequests(user.id).catch(() => []),
          getPendingFriendRequests(user.id).catch(() => []),
          getClubInvitations(user.id).catch(() => [])
        ]);
        setReceivedRequests(Array.isArray(receivedData) ? receivedData : []);
        setSentRequests(Array.isArray(sentData) ? sentData : []);
        setClubInvitations(Array.isArray(clubInvitesData) ? clubInvitesData : []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setReceivedRequests([]);
        setSentRequests([]);
        setClubInvitations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Refresh notifications every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [user?.id, isLoading, isAuthenticated, navigate]);

  const handleAcceptClubInvitation = async (clubId, invitationId) => {
    if (processing.has(invitationId)) return;
    
    setProcessing((prev) => new Set(prev).add(invitationId));
    
    try {
      await respondToClubInvitation(clubId, invitationId, user.id, "ACCEPTED");
      console.log("Club invitation accepted");
      setClubInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      navigate(`/clubs/${clubId}`);
    } catch (err) {
      console.error("Error accepting club invitation:", err);
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(invitationId);
        return next;
      });
    }
  };

  const handleRejectClubInvitation = async (clubId, invitationId) => {
    if (processing.has(invitationId)) return;
    
    setProcessing((prev) => new Set(prev).add(invitationId));
    
    try {
      await respondToClubInvitation(clubId, invitationId, user.id, "REJECTED");
      console.log("Club invitation rejected");
      setClubInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (err) {
      console.error("Error rejecting club invitation:", err);
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(invitationId);
        return next;
      });
    }
  };

  const handleAccept = async (requesterId) => {
    if (!user?.id || processing.has(requesterId)) return;
    
    setProcessing(prev => new Set(prev).add(requesterId));
    
    try {
      await respondToFriendRequest(user.id, requesterId, "ACCEPTED");
      // Remove the request from the list
      setReceivedRequests(prev => prev.filter(req => req.user.id !== requesterId));
      console.log("Friend request accepted!");
    } catch (err) {
      console.error("Error accepting friend request:", err);
      console.error("Failed to accept friend request:", err.message || err);
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(requesterId);
        return next;
      });
    }
  };

  const handleReject = async (requesterId) => {
    if (!user?.id || processing.has(requesterId)) return;
    
    setProcessing(prev => new Set(prev).add(requesterId));
    
    try {
      await respondToFriendRequest(user.id, requesterId, "DECLINED");
      // Remove the request from the list
      setReceivedRequests(prev => prev.filter(req => req.user.id !== requesterId));
    } catch (err) {
      console.error("Error rejecting friend request:", err);
      console.error("Failed to reject friend request:", err.message || err);
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(requesterId);
        return next;
      });
    }
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F1E2" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
            Loading notifications...
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
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-3xl font-semibold mb-8"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Notifications
          </h1>

          {/* Empty State - Show only if ALL notification types are empty */}
          {receivedRequests.length === 0 && sentRequests.length === 0 && clubInvitations.length === 0 ? (
            <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                No notifications.
              </p>
            </div>
          ) : (
            <>
          {/* Friend Requests Received */}
          {receivedRequests.length > 0 && (
            <div className="mb-8">
              <h2
                className="text-xl font-semibold text-gray-800 mb-4"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Friend Requests Received
              </h2>
              <div className="space-y-4">
                {receivedRequests.map((request) => {
                  const requester = request.user;
                  const avatarSrc = getAvatarSrc(requester?.profile?.profilePicture);
                  const isProcessing = processing.has(requester.id);
                  
                  return (
                    <div key={request.id} className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-full border-2 border-[#d7c4a9] overflow-hidden shadow-lg flex-shrink-0">
                          {avatarSrc ? (
                            <img src={avatarSrc} alt={requester.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                              <span className="text-2xl text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>
                                {requester.name?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                            {requester.name}
                          </h3>
                          {/* Removed @username */}
                          <p className="text-sm text-gray-700 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
                            wants to be your friend
                          </p>
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={() => handleAccept(requester.id)}
                              disabled={isProcessing}
                              className="px-6 py-2 rounded border border-green-600 bg-green-50 hover:bg-green-100 text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              style={{ fontFamily: "Times New Roman, serif" }}
                            >
                              {isProcessing ? "Processing..." : "Accept"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(requester.id)}
                              disabled={isProcessing}
                              className="px-6 py-2 rounded border border-red-600 bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              style={{ fontFamily: "Times New Roman, serif" }}
                            >
                              {isProcessing ? "Processing..." : "Reject"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sent Friend Requests Section */}
          {sentRequests.length > 0 && (
            <div className="mb-8">
              <h2
                className="text-xl font-semibold text-gray-800 mb-4"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Pending Friend Requests Sent
              </h2>
              <div className="space-y-4">
                {sentRequests.map((request) => {
                  const friendUser = request.friend;
                  const avatarSrc = getAvatarSrc(friendUser?.profile?.profilePicture);
                  
                  return (
                    <div key={request.id} className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-full border-2 border-[#d7c4a9] overflow-hidden shadow-lg flex-shrink-0">
                          {avatarSrc ? (
                            <img src={avatarSrc} alt={friendUser.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                              <span className="text-2xl text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>
                                {friendUser.name?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                            {friendUser.name}
                          </h3>
                          {/* Removed @username */}
                          <p className="text-sm text-gray-700 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
                            Waiting for response
                          </p>
                          <div className="flex items-center justify-center px-4 py-2 rounded border border-[#ddcdb7] bg-[#f7ecda] text-gray-600 w-fit">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm" style={{ fontFamily: "Times New Roman, serif" }}>
                              Request Pending
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Club Invitations Section */}
          {clubInvitations.length > 0 && (
            <div className="mb-8">
              <h2
                className="text-xl font-semibold text-gray-800 mb-4"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Book Club Invitations
              </h2>
              <div className="space-y-4">
                {clubInvitations.map((invitation) => {
                  const inviter = invitation.inviter;
                  const club = invitation.club;
                  const avatarSrc = getAvatarSrc(inviter?.profile?.profilePicture);
                  const isProcessing = processing.has(invitation.id);
                  
                  return (
                    <div key={invitation.id} className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-full border-2 border-[#d7c4a9] overflow-hidden shadow-lg flex-shrink-0">
                          {avatarSrc ? (
                            <img src={avatarSrc} alt={inviter.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#efe2cf] flex items-center justify-center">
                              <span className="text-2xl text-gray-700" style={{ fontFamily: "Times New Roman, serif" }}>
                                {inviter.name?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1" style={{ fontFamily: "Times New Roman, serif" }}>
                            {inviter.name}
                          </h3>
                          {/* Removed @username */}
                          <p className="text-sm text-gray-700 mb-4" style={{ fontFamily: "Times New Roman, serif" }}>
                            invited you to join <span className="font-semibold">{club.name}</span>
                          </p>
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={() => handleAcceptClubInvitation(club.id, invitation.id)}
                              disabled={isProcessing}
                              className="px-6 py-2 rounded border border-green-600 bg-green-50 hover:bg-green-100 text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              style={{ fontFamily: "Times New Roman, serif" }}
                            >
                              {isProcessing ? "Processing..." : "Accept"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectClubInvitation(club.id, invitation.id)}
                              disabled={isProcessing}
                              className="px-6 py-2 rounded border border-red-600 bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              style={{ fontFamily: "Times New Roman, serif" }}
                            >
                              {isProcessing ? "Processing..." : "Reject"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

            </>
          )}
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

export default Notifications;

