// Delete club
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

// Join club
export async function joinClub(apiBase, clubId, userId) {
  const res = await fetch(`${apiBase}/api/clubs/${clubId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok && res.status !== 400)
    throw new Error(data.error || "Failed to join club.");

  return { status: res.status, ok: res.ok, data };
}

// Leave club
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

// Update member progress
export async function updateMemberProgress(apiBase, clubId, userId, progress) {
  const res = await fetch(
    `${apiBase}/api/clubs/${clubId}/members/${userId}/progress`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update progress.");
  return data;
}

// ⭐ UPDATED: Update reading goal + page ranges ⭐
export async function updateClubGoal(
  apiBase,
  clubId,
  userId,
  readingGoal,
  goalDeadline,
  readingGoalPageStart,
  readingGoalPageEnd
) {
  const res = await fetch(`${apiBase}/api/clubs/${clubId}/goal`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      readingGoal,
      goalDeadline,
      readingGoalPageStart:
        readingGoalPageStart !== "" ? Number(readingGoalPageStart) : null,
      readingGoalPageEnd:
        readingGoalPageEnd !== "" ? Number(readingGoalPageEnd) : null,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update goal.");
  return data;
}

// ⭐ UPDATED: Assign book to club with page ranges ⭐
export async function assignBookToClub(
  apiBase,
  clubId,
  userId,
  bookDetails,
  readingGoal,
  goalDeadline,
  readingGoalPageStart,
  readingGoalPageEnd
) {
  const res = await fetch(`${apiBase}/api/clubs/${clubId}/book`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      bookDetails,
      readingGoal,
      goalDeadline,
      readingGoalPageStart:
        readingGoalPageStart !== "" ? Number(readingGoalPageStart) : null,
      readingGoalPageEnd:
        readingGoalPageEnd !== "" ? Number(readingGoalPageEnd) : null,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to assign book.");
  return data;
}
