import { useEffect, useMemo, useRef, useState } from 'react';
import { createReply, fetchThread, isNewBadge, setLastSeen } from '../../services/mockThreads';

function buildTree(replies) {
  const byParent = new Map();
  replies.forEach((r) => {
    const key = r.parentId || 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(r);
  });
  for (const arr of byParent.values()) arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const attach = (parentId, depth = 0) => (byParent.get(parentId || 'root') || []).map((r) => ({ ...r, depth, children: attach(r.id, depth + 1) }));
  return attach(null, 0);
}

function ReplyNode({ node, currentUser, onEdit, onDelete }) {
  const [collapsed, setCollapsed] = useState(false);
  const isOwner = currentUser && node.author && currentUser.id === node.author.id;
  const canEditWindow = (() => {
    const created = new Date(node.createdAt).getTime();
    return Date.now() - created <= 30 * 60 * 1000;
  })();

  return (
    <div className="mt-3" style={{ marginLeft: `${Math.min(node.depth, 3) * 16}px` }}>
      <div className="p-3 rounded border border-[#e6dac8] bg-[#faf6ed]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
            {node.author?.name || 'Unknown'} · {new Date(node.createdAt).toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            {isNewBadge(node.updatedAt || node.createdAt) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 border border-green-300 text-green-800">New</span>
            )}
            {isOwner && canEditWindow && (
              <>
                <button className="text-xs text-gray-600 hover:underline" onClick={() => onEdit(node)}>Edit</button>
                <button className="text-xs text-red-600 hover:underline" onClick={() => onDelete(node)}>Delete</button>
              </>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-800 mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>{node.body}</div>
      </div>
      {node.children && node.children.length > 0 && node.depth < 3 && (
        <div className="mt-1">
          <button className="text-xs text-gray-600 hover:underline" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? `Expand ${node.children.length} repl${node.children.length === 1 ? 'y' : 'ies'}` : 'Collapse'}
          </button>
        </div>
      )}
      {!collapsed && node.children && node.children.length > 0 && node.depth < 3 && (
        <div>
          {node.children.map((child) => (
            <ReplyNode key={child.id} node={child} currentUser={currentUser} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ThreadDetail({ threadId, currentUser, isMember, isHost }) {
  const [thread, setThread] = useState(null);
  const [allReplies, setAllReplies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [replyText, setReplyText] = useState('');
  const pageSize = 20;
  const pollMs = 30000;
  const sentinel = useRef(null);

  const load = async () => {
    setLoading(true);
    const data = await fetchThread(threadId);
    if (!data) return setLoading(false);
    setThread(data.thread);
    setAllReplies(data.replies || []);
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    load();
    setLastSeen(threadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    const id = setInterval(() => load(), pollMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const tree = useMemo(() => buildTree(allReplies), [allReplies]);

  const flatVisible = useMemo(() => {
    // Flatten the tree preserving order to do simple paging
    const out = [];
    const walk = (nodes) => {
      for (const n of nodes) {
        out.push(n);
        if (n.depth < 3 && n.children) walk(n.children);
      }
    };
    walk(tree);
    return out;
  }, [tree]);

  const visible = flatVisible.slice(0, page * pageSize);
  useEffect(() => {
    setHasMore(flatVisible.length > visible.length);
  }, [flatVisible, visible]);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setPage((p) => p + 1);
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !isMember || thread?.locked) return;
    await createReply({ threadId, body: replyText.trim(), author: { id: currentUser.id, name: currentUser.name } });
    setReplyText('');
    await load();
  };

  const onEdit = async (node) => {
    // Placeholder: open a simple prompt; full editor could be added later
    const next = window.prompt('Edit your reply:', node.body);
    if (next == null) return;
    // We call fetchThread again after mock to refresh
    const { editReply } = await import('../../services/mockThreads');
    await editReply({ replyId: node.id, body: next });
    await load();
  };

  const onDelete = async (node) => {
    if (!window.confirm('Delete this reply?')) return;
    const { deleteReply } = await import('../../services/mockThreads');
    await deleteReply({ replyId: node.id });
    await load();
  };

  if (!thread) return (
    <p className="text-sm text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>Loading…</p>
  );

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          {thread.pinned && (
            <span className="text-xs px-2 py-1 rounded bg-yellow-100 border border-yellow-300 text-yellow-800">Pinned</span>
          )}
          {thread.locked && (
            <span className="text-xs px-2 py-1 rounded bg-red-100 border border-red-300 text-red-800">Locked</span>
          )}
        </div>
        <h4 className="text-lg font-semibold text-gray-800 mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>{thread.title}</h4>
        <p className="text-xs text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
          by {thread.author?.name || 'Unknown'} · {new Date(thread.createdAt).toLocaleString()}
        </p>
        <div className="text-sm text-gray-800 mt-3 whitespace-pre-wrap" style={{ fontFamily: 'Times New Roman, serif' }}>{thread.body}</div>
      </div>

      {/* Reply composer */}
      <form onSubmit={handleReply} className="space-y-2">
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          rows={4}
          placeholder={thread.locked ? 'Thread is locked' : 'Write a reply…'}
          disabled={!isMember || thread.locked}
          className="w-full border border-[#ddcdb7] rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60"
          style={{ fontFamily: 'Times New Roman, serif', backgroundColor: '#FDFBF6' }}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isMember || thread.locked || !replyText.trim()}
            className="px-3 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] text-sm disabled:opacity-60"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Reply
          </button>
        </div>
      </form>

      {/* Replies */}
      <div className="mt-2">
        {visible.map((n) => (
          <ReplyNode key={n.id} node={n} currentUser={currentUser} onEdit={onEdit} onDelete={onDelete} />
        ))}
        <div ref={sentinel} />
        {loading && (
          <p className="text-xs text-gray-500" style={{ fontFamily: 'Times New Roman, serif' }}>Loading…</p>
        )}
      </div>
    </div>
  );
}
