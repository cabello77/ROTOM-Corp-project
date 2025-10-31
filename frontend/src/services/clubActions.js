export async function deleteClub(apiBase, clubId, userId) {
  const res = await fetch(`${apiBase}/api/clubs/${clubId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete club.");
  return data;
}

export async function joinClub(apiBase, clubId, userId) {
  const res = await fetch(`${apiBase}/api/clubs/${clubId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok && res.status !== 400) throw new Error(data.error || "Failed to join club.");
  return { status: res.status, ok: res.ok, data };
}

export async function leaveClub(apiBase, clubId, userId) {
  const res = await fetch(`${apiBase}/api/clubs/${clubId}/leave`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to leave club.");
  return data;
}

export async function updateMemberProgress(apiBase, clubId, userId, progress) {
  const res = await fetch(`${apiBase}/api/clubs/${clubId}/members/${userId}/progress`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progress }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update progress.");
  return data;
}

export async function updateClubGoal(apiBase, clubId, userId, readingGoal, goalDeadline) {
  const res = await fetch(`${apiBase}/api/clubs/${clubId}/goal`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, readingGoal, goalDeadline }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update goal.");
  return data;
}

export async function assignBookToClub(apiBase, clubId, userId, bookDetails, readingGoal, goalDeadline) {
  const res = await fetch(`${apiBase}/api/clubs/${clubId}/book`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, bookData: bookDetails, readingGoal, goalDeadline }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to assign book.");
  return data;
}

