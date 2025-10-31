import { useEffect, useMemo, useState } from 'react';
import { getMembers, joinClub, leaveClub } from '../services/api/clubs';

export default function useClubMembers(clubId, user, club) {
  const [members, setMembers] = useState([]);
  const isHost = useMemo(() => Boolean(user && club && user.id === club.creatorId), [user, club]);

  const refresh = async () => {
    if (!clubId) return;
    const m = await getMembers(clubId);
    setMembers(m);
  };

  useEffect(() => { refresh(); }, [clubId]);

  const isMember = useMemo(() => {
    if (!user) return false;
    if (isHost) return true;
    return members.some((m) => m.userId === user.id);
  }, [members, user, isHost]);

  const join = async () => {
    const { ok } = await joinClub(clubId, user.id);
    if (ok) await refresh();
    return ok;
  };

  const leave = async () => {
    const { ok } = await leaveClub(clubId, user.id);
    if (ok) await refresh();
    return ok;
  };

  return { members, isMember, isHost, refresh, join, leave };
}

