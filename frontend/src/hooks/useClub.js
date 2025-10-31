import { useEffect, useMemo, useState } from 'react';
import { assignBook, getClub, removeBook, updateGoal, updateProgress } from '../services/api/clubs';

export default function useClub(clubId, user) {
  const [club, setClub] = useState(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [readingGoal, setReadingGoal] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [userProgress, setUserProgress] = useState(0);

  useEffect(() => {
    if (!clubId) return;
    (async () => {
      const c = await getClub(clubId);
      setClub(c);
      if (c.currentBookData) setCurrentBook(c.currentBookData);
      if (c.readingGoal) setReadingGoal(c.readingGoal);
      if (c.goalDeadline) setGoalDeadline(new Date(c.goalDeadline).toISOString().split('T')[0]);
    })();
  }, [clubId]);

  const isHost = useMemo(() => Boolean(user && club && user.id === club.creatorId), [user, club]);

  const assignClubBook = async ({ bookData, readingGoal, goalDeadline }) => {
    const { ok } = await assignBook(clubId, { userId: user.id, bookData, readingGoal, goalDeadline });
    if (ok) setCurrentBook(bookData);
    return ok;
  };

  const removeClubBook = async () => {
    const { ok } = await removeBook(clubId, user.id);
    if (ok) setCurrentBook(null);
    return ok;
  };

  const updateClubGoal = async () => {
    return updateGoal(clubId, { userId: user.id, readingGoal, goalDeadline });
  };

  const setProgress = async (value) => {
    setUserProgress(value);
    return updateProgress(clubId, user.id, value);
  };

  return {
    club,
    isHost,
    currentBook,
    readingGoal,
    setReadingGoal,
    goalDeadline,
    setGoalDeadline,
    userProgress,
    setUserProgress,
    assignClubBook,
    removeClubBook,
    updateClubGoal,
    setProgress,
  };
}

