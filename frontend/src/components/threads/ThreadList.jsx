import { useEffect, useMemo, useRef, useState } from 'react';
import ThreadListItem from './ThreadListItem';
import ThreadCreateModal from './ThreadCreateModal';
import ThreadDetail from './ThreadDetail';
import { canCreateThread } from '../../utils/roles';
import { createThread, fetchThreads } from '../../services/mockThreads';

export default function ThreadList({ clubId, currentUser, isHost = false, isMember = false }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState(null);

  const canCreate = useMemo(() => canCreateThread({ isHost }), [isHost]);
  const pageSize = 10;
  const pollMs = 30000;
  const scrollSentinel = useRef(null);

  const load = async (nextPage) => {
    setLoading(true);
    const res = await fetchThreads(clubId, { page: nextPage, size: pageSize, sort: 'activity' });
    setItems((prev) => (nextPage === 1 ? res.items : [...prev, ...res.items]));
    setHasMore(res.hasMore);
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  // polling
  useEffect(() => {
    const id = setInterval(() => {
      load(1);
    }, pollMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  // infinite scroll
  useEffect(() => {
    if (!hasMore) return;
    const el = scrollSentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        const np = page + 1;
        setPage(np);
        load(np);
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollSentinel.current, hasMore, page, clubId]);

  const handleCreate = async (data) => {
    await createThread(data);
    await load(1);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800" style={{ fontFamily: 'Times New Roman, serif' }}>Discussions</h3>
        {canCreate ? (
          <button
            type="button"
            className="px-3 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] text-sm"
            style={{ fontFamily: 'Times New Roman, serif' }}
            onClick={() => setModalOpen(true)}
          >
            New Discussion
          </button>
        ) : (
          <button
            type="button"
            className="px-3 py-2 rounded border border-[#ddcdb7] bg-white text-sm opacity-70 cursor-not-allowed"
            title="Only hosts can create threads right now."
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            New Discussion
          </button>
        )}
      </div>
      {items.length === 0 && !loading && (
        <div className="text-center py-3 border border-[#e6dac8] bg-[#efe6d7] rounded" style={{ fontFamily: 'Times New Roman, serif' }}>
          <p className="text-sm text-gray-600">No discussions yet</p>
        </div>
      )}
      <div className="space-y-2">
        {items.map((t) => (
          <div key={t.id} className="space-y-2">
            <ThreadListItem
              thread={t}
              isHost={isHost}
              onClick={() => setSelectedThreadId((cur) => (cur === t.id ? null : t.id))}
            />
            {selectedThreadId === t.id && (
              <div className="border border-[#e6dac8] rounded-lg p-4 bg-white">
                <ThreadDetail
                  threadId={t.id}
                  currentUser={currentUser}
                  isHost={isHost}
                  isMember={Boolean(isMember || isHost)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div ref={scrollSentinel} />
      {loading && (
        <p className="text-xs text-gray-500" style={{ fontFamily: 'Times New Roman, serif' }}>Loading…</p>
      )}

      <ThreadCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        canCreate={canCreate}
        clubId={clubId}
        currentUser={currentUser}
      />
    </div>
  );
}
