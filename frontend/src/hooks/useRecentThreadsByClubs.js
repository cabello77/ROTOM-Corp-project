import { useEffect, useMemo, useState, useRef } from 'react';
import { fetchThreads } from '../services/discussions';

export default function useRecentThreadsByClubs({ clubIds = [], limit = 5, pollMs = 30000 }) {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(false);
  const idsRef = useRef(clubIds.join(','));

  const load = async () => {
    setLoading(true);
    const out = {};
    for (const id of clubIds) {
      try {
        const res = await fetchThreads(id, { page: 1, size: limit, sort: 'activity' });
        out[id] = res.items;
      } catch (_) {
        out[id] = [];
      }
    }
    setGroups(out);
    setLoading(false);
  };

  useEffect(() => {
    const key = clubIds.join(',');
    if (idsRef.current !== key) idsRef.current = key;
    load();
    const t = setInterval(load, pollMs);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubIds.join(','), limit, pollMs]);

  const totalCount = useMemo(() => Object.values(groups).reduce((acc, arr) => acc + arr.length, 0), [groups]);

  return { groups, loading, totalCount, reload: load };
}
