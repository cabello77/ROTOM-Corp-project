const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export async function getClub(id) {
  const res = await fetch(`${API_BASE}/api/clubs/${id}`);
  if (!res.ok) throw new Error('Failed to fetch club');
  return res.json();
}

export async function getMembers(id) {
  const res = await fetch(`${API_BASE}/api/clubs/${id}/members`);
  if (!res.ok) throw new Error('Failed to fetch members');
  return res.json();
}

export async function joinClub(id, userId) {
  const res = await fetch(`${API_BASE}/api/clubs/${id}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

export async function leaveClub(id, userId) {
  const res = await fetch(`${API_BASE}/api/clubs/${id}/leave`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

export async function assignBook(id, payload) {
  const res = await fetch(`${API_BASE}/api/clubs/${id}/book`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

export async function removeBook(id, userId) {
  const res = await fetch(`${API_BASE}/api/clubs/${id}/book`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

export async function updateGoal(id, { userId, readingGoal, goalDeadline }) {
  const res = await fetch(`${API_BASE}/api/clubs/${id}/goal`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, readingGoal, goalDeadline }),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

export async function updateProgress(id, userId, progress) {
  const res = await fetch(`${API_BASE}/api/clubs/${id}/members/${userId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress }),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

