import { useEffect, useMemo, useState } from 'react';
import { fetchThreads } from '../../services/mockThreads';

export default function RecentThreadsByClub({ clubIds = [], limit = 5 }) {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const out = {};
      for (const id of clubIds) {
        const res = await fetchThreads(id, { page: 1, size: limit, sort: 'activity' });
        out[id] = res.items;
      }
      setGroups(out);
      setLoading(false);
    };
    load();
  }, [clubIds, limit]);

  const totalCount = useMemo(() => Object.values(groups).reduce((acc, arr) => acc + arr.length, 0), [groups]);
  if (!clubIds.length) return null;

  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-4">
      <h3 className="text-base font-semibold text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>Recent Discussions</h3>
      {loading && <p className="text-sm text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>Loading…</p>}
      {!loading && totalCount === 0 && (
        <p className="text-sm text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>No recent threads.</p>
      )}
      {!loading && Object.entries(groups).map(([clubId, threads]) => (
        <div key={clubId} className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Times New Roman, serif' }}>Club {clubId}</h4>
          <ul className="space-y-2">
            {threads.slice(0, limit).map((t) => (
              <li key={t.id} className="px-3 py-2 rounded border border-[#ddcdb7] bg-[#faf6ed]">
                <div className="text-sm text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>{t.title}</div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>by {t.author?.name || 'Unknown'} · {new Date(t.lastActivityAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
