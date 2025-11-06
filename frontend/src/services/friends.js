const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

/**
 * Get all friends for a user
 */
export async function getFriends(userId) {
  const res = await fetch(`${API_BASE}/api/friends/${userId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch friends');
  }
  const data = await res.json();
  return data.friends || [];
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(userId, friendId) {
  const res = await fetch(`${API_BASE}/api/friends`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, friendId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send friend request');
  }
  return data;
}

/**
 * Respond to a friend request (accept or decline)
 */
export async function respondToFriendRequest(userId, friendId, status) {
  const res = await fetch(`${API_BASE}/api/friends/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, friendId, friendStatus: status }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to respond to friend request');
  }
  return data;
}

/**
 * Remove a friend
 */
export async function removeFriend(userId, friendId) {
  const res = await fetch(`${API_BASE}/api/friends/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ friendId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to remove friend');
  }
  return data;
}

/**
 * Get all users (for Add Friend page)
 */
export async function getAllUsers() {
  try {
    // Add cache-busting query parameter to ensure fresh data
    const timestamp = Date.now();
    const res = await fetch(`${API_BASE}/api/users?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch users: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // Ensure we return an array and filter out any invalid users
    const validUsers = Array.isArray(data) ? data.filter(user => user && user.id) : [];
    return validUsers;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
}

/**
 * Get pending friend requests sent by a user
 */
export async function getPendingFriendRequests(userId) {
  const res = await fetch(`${API_BASE}/api/friends/${userId}/pending`);
  if (!res.ok) {
    throw new Error('Failed to fetch pending friend requests');
  }
  const data = await res.json();
  return data.pendingRequests || [];
}

/**
 * Get pending friend requests received by a user (for notifications)
 */
export async function getReceivedFriendRequests(userId) {
  const res = await fetch(`${API_BASE}/api/friends/${userId}/received`);
  if (!res.ok) {
    throw new Error('Failed to fetch received friend requests');
  }
  const data = await res.json();
  return data.receivedRequests || [];
}

