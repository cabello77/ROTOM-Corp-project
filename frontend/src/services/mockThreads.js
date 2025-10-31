// Frontend-only mock thread service (in-memory) with localStorage lastSeen tracking
// This is a placeholder API surface intended to be replaced by real backend calls later.

const _state = {
  threads: [], // array of thread objects
  replies: [], // array of reply objects
  seq: 1,
};

const nowIso = () => new Date().toISOString();

const genId = () => `${Date.now()}_${_state.seq++}`;

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

// Seed with a small sample so UI has something to render
function seedIfEmpty() {
  if (_state.threads.length) return;
  const author = { id: 1, name: 'Demo Host' };
  const t1 = {
    id: genId(),
    clubId: 1,
    title: 'Welcome to the club! Introductions',
    body: 'Say hi and share your favorite book.',
    author,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    chapterIndex: null,
    tags: ['welcome'],
    pinned: true,
    locked: false,
    lastActivityAt: nowIso(),
  };
  const t2 = {
    id: genId(),
    clubId: 1,
    title: 'Discuss Chapter 1',
    body: 'Thoughts on the opening chapter? Spoilers allowed.',
    author,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    chapterIndex: 1,
    tags: ['chapter-1'],
    pinned: false,
    locked: false,
    lastActivityAt: nowIso(),
  };
  _state.threads.push(t1, t2);
}

seedIfEmpty();

// Sorting helpers
function sortThreadsForList(list) {
  // Keep ordering stable based on original creation time (newest threads first)
  const pinned = list
    .filter((t) => t.pinned)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const others = list
    .filter((t) => !t.pinned)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return [...pinned, ...others];
}

export async function fetchThreads(clubId, { page = 1, size = 10, sort = 'activity' } = {}) {
  const all = _state.threads.filter((t) => Number(t.clubId) === Number(clubId));
  const ordered = sort === 'activity' ? sortThreadsForList(all) : all;
  const start = (page - 1) * size;
  const items = ordered.slice(start, start + size);
  const total = all.length;
  return { items, total, page, size, hasMore: start + size < total };
}

export async function createThread({ clubId, title, body, author, chapterIndex = null, tags = [] }) {
  const now = nowIso();
  const thread = {
    id: genId(),
    clubId: Number(clubId),
    title: String(title).slice(0, 120),
    body: String(body).slice(0, 10000),
    author,
    createdAt: now,
    updatedAt: now,
    chapterIndex: chapterIndex != null ? Math.max(1, parseInt(chapterIndex, 10) || 1) : null,
    tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
    pinned: false,
    locked: false,
    lastActivityAt: now,
  };
  _state.threads.unshift(thread);
  return thread;
}

export async function fetchThread(threadId) {
  const t = _state.threads.find((x) => x.id === threadId);
  if (!t) return null;
  const replies = _state.replies.filter((r) => r.threadId === threadId);
  return { thread: t, replies };
}

export async function createReply({ threadId, parentId = null, body, author }) {
  const now = nowIso();
  const t = _state.threads.find((x) => x.id === threadId);
  if (!t || t.locked) throw new Error('Thread not found or locked');
  const reply = {
    id: genId(),
    threadId,
    parentId,
    body: String(body).slice(0, 10000),
    author,
    createdAt: now,
    updatedAt: now,
  };
  _state.replies.push(reply);
  // Do not bump thread ordering on reply; keep createdAt ordering stable
  return reply;
}

// Placeholders for future moderation features
export async function togglePin(threadId) {
  const t = _state.threads.find((x) => x.id === threadId);
  if (!t) return null;
  t.pinned = !t.pinned;
  return t;
}

export async function toggleLock(threadId) {
  const t = _state.threads.find((x) => x.id === threadId);
  if (!t) return null;
  t.locked = !t.locked;
  return t;
}

export async function editThread() { /* no-op for now */ }
export async function deleteThread() { /* no-op for now */ }
export async function editReply({ replyId, body }) {
  const r = _state.replies.find((x) => x.id === replyId);
  if (!r) return null;
  r.body = String(body).slice(0, 10000);
  r.updatedAt = nowIso();
  return r;
}

export async function deleteReply({ replyId }) {
  const idx = _state.replies.findIndex((x) => x.id === replyId);
  if (idx === -1) return false;
  const r = _state.replies[idx];
  _state.replies.splice(idx, 1);
  return true;
}

export function isNewBadge(lastActivityAt, windowHours = 12) {
  try {
    const delta = Date.now() - new Date(lastActivityAt).getTime();
    return delta <= windowHours * 3600 * 1000;
  } catch {
    return false;
  }
}
