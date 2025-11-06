const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

/**
 * Send a club invitation to a friend
 */
export async function sendClubInvitation(clubId, inviterId, inviteeId) {
  const res = await fetch(`${API_BASE}/api/clubs/${clubId}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inviterId, inviteeId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to send club invitation");
  }
  return data;
}

/**
 * Get club invitations received by a user
 */
export async function getClubInvitations(userId) {
  const res = await fetch(`${API_BASE}/api/users/${userId}/club-invitations`);
  if (!res.ok) {
    throw new Error("Failed to fetch club invitations");
  }
  const data = await res.json();
  return data.invitations || [];
}

/**
 * Respond to a club invitation (accept or reject)
 */
export async function respondToClubInvitation(clubId, invitationId, userId, status) {
  const res = await fetch(`${API_BASE}/api/clubs/${clubId}/invitations/${invitationId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, status }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to respond to invitation");
  }
  return data;
}

