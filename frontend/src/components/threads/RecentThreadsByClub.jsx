import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useRecentThreadsByClubs from '../../hooks/useRecentThreadsByClubs';

export default function RecentThreadsByClub({ clubIds = [], limit = 3, clubMap = {} }) {
  const { groups, loading } = useRecentThreadsByClubs({ clubIds, limit, pollMs: 30000 });
  if (!clubIds.length) return null;

  if (loading) {
    return (
      <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
        <p className="text-sm text-gray-600" style={{}}>Loading…</p>
      </div>
    );
  }

  return (
    <>
      {clubIds.map((clubId) => {
        const threads = groups[clubId] || [];
        const hasThreads = threads.length > 0;

        return (
          <div
            key={clubId}
            className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3"
          >
            <h3 className="text-base font-semibold text-gray-800" style={{}}>
              {clubMap[clubId]?.name || `Club ${clubId}`} • Recent Discussions
            </h3>

            {hasThreads ? (
              <>
                <ul className="space-y-2">
                  {threads.slice(0, limit).map((t) => (
                    <li
                      key={t.id}
                      className="px-3 py-2 rounded border border-[#ddcdb7] bg-[#faf6ed]"
                    >
                      <div className="text-sm text-gray-800" style={{}}>
                        {t.title}
                      </div>
                      <div className="text-xs text-gray-600" style={{}}>
                        by {t.author?.name || "Unknown"} •{" "}
                        {new Date(t.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/clubs/${clubId}`}
                    className="text-sm underline text-gray-700 hover:text-gray-900"
                    style={{}}
                  >
                    View all discussions
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600" style={{}}>
                No discussions yet.
              </p>
            )}
          </div>
        );
      })}
    </>
  );
}
