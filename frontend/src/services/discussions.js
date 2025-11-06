// Real backend-backed discussion service with local lastSeen tracking

const API_BASE = '';

const nowIso = () => new Date().toISOString();

// Utilities for localStorage lastSeen per thread
const LS_KEY = 'thread_last_seen_v1';
const readLastSeenMap = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};
const writeLastSeenMap = (map) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {}
};

export function getLastSeen(threadId) {
  const map = readLastSeenMap();
  return map[threadId] || null;
}

export function setLastSeen(threadId, timestamp = nowIso()) {
  const map = readLastSeenMap();
  map[threadId] = timestamp;
  writeLastSeenMap(map);
}

export function isNewBadge(lastActivityAt, windowHours = 12) {
  try {
    const delta = Date.now() - new Date(lastActivityAt).getTime();
    return delta <= windowHours * 3600 * 1000;
  } catch {
    return false;
  }
}

export async function fetchThreads(clubId, { page = 1, size = 10 } = {}) {
  const res = await fetch(`${API_BASE}/api/clubs/${clubId}/discussions?page=${page}&size=${size}`);
  if (!res.ok) throw new Error('Failed to fetch threads');
  return res.json();
}

export async function createThread({ clubId, title, body, author, chapterIndex = null, tags = [] }) {
  const payload = {
    clubId,
    userId: author?.id,
    title,
    message: body,
    chapterIndex,
    tags,
    media: [],
  };
  const res = await fetch(`${API_BASE}/api/discussion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = 'Failed to create thread';
    try {
      const data = await res.json();
      if (data && data.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  return data.discussion;
}

export async function fetchThread(threadId) {
  const res = await fetch(`${API_BASE}/api/discussion/${threadId}`);
  if (!res.ok) throw new Error('Failed to fetch thread');
  return res.json();
}

export async function createReply({ threadId, parentId = null, body, author }) {
  const res = await fetch(`${API_BASE}/api/discussion/${threadId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: author?.id, parentId, body }),
  });
  if (!res.ok) throw new Error('Failed to create reply');
  return res.json();
}

export async function editReply({ replyId, body, userId }) {
  const res = await fetch(`${API_BASE}/api/replies/${replyId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, body }),
  });
  if (!res.ok) throw new Error('Failed to edit reply');
  return res.json();
}

export async function deleteReply({ replyId, userId }) {
  const res = await fetch(`${API_BASE}/api/replies/${replyId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to delete reply');
  return res.json();
}

// Voting APIs
export async function getDiscussionVotes(threadId, userId) {
  const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const res = await fetch(`${API_BASE}/api/discussion/${threadId}/votes${q}`);
  if (!res.ok) throw new Error('Failed to fetch discussion votes');
  return res.json();
}

export async function voteDiscussion(threadId, { userId, value }) {
  const res = await fetch(`${API_BASE}/api/discussion/${threadId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, value }),
  });
  if (!res.ok) throw new Error('Failed to vote');
  return res.json();
}

export async function getReplyVotes(replyId, userId) {
  const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const res = await fetch(`${API_BASE}/api/replies/${replyId}/votes${q}`);
  if (!res.ok) throw new Error('Failed to fetch reply votes');
  return res.json();
}

export async function voteReply(replyId, { userId, value }) {
  const res = await fetch(`${API_BASE}/api/replies/${replyId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, value }),
  });
  if (!res.ok) throw new Error('Failed to vote');
  return res.json();
}

