import { useEffect, useMemo, useRef, useState } from 'react';
import { createReply, fetchThread, isNewBadge, setLastSeen, editReply as apiEditReply, deleteReply as apiDeleteReply, getDiscussionVotes, voteDiscussion, getReplyVotes, voteReply } from '../../services/discussions';

function buildTree(replies) {
  const byParent = new Map();
  replies.forEach((r) => {
    const key = r.parentId || 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(r);
  });
  // Sort replies newest first within each parent bucket
  for (const arr of byParent.values()) arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const attach = (parentId, depth = 0) => (byParent.get(parentId || 'root') || []).map((r) => ({ ...r, depth, children: attach(r.id, depth + 1) }));
  return attach(null, 0);
}

function ReplyNode({ node, currentUser, isMember, locked, threadId, onReplied, onEdit, onDelete, voteSummary, onVote }) {
  const [collapsed, setCollapsed] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const isOwner = currentUser && node.author && currentUser.id === node.author.id;
  const canEditWindow = (() => {
    const created = new Date(node.createdAt).getTime();
    return Date.now() - created <= 30 * 60 * 1000;
  })();

  const handleChildReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !isMember || locked) return;
    await createReply({ threadId, parentId: node.id, body: replyText.trim(), author: { id: currentUser.id, name: currentUser.name } });
    setReplyText('');
    setReplyOpen(false);
    if (onReplied) onReplied();
  };

  return (
    <div className="mt-3" style={{ marginLeft: `${Math.min(node.depth, 3) * 16}px` }}>
      <div className="p-3 rounded border border-[#e6dac8] bg-[#faf6ed]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600" style={{}}>
            {node.author?.name || 'Unknown'} · {new Date(node.createdAt).toLocaleString()}
          </p>
          <div className="flex items-center gap-3">
            {voteSummary && (
              <div className="flex items-center gap-1" title="Vote">
                <button
                  type="button"
                  disabled={!currentUser}
                  className={`px-1 text-xs border rounded ${voteSummary?.userVote === 1 ? 'bg-[#ffeec2] border-yellow-400' : 'border-[#ddcdb7]'}`}
                  onClick={() => onVote?.(node.id, voteSummary?.userVote === 1 ? 0 : 1)}
                >▲</button>
              <span className="text-xs text-gray-700 text-center" title="Up | Down">{(voteSummary?.upvotes ?? 0)} | {(voteSummary?.downvotes ?? 0)}</span>
                <button
                  type="button"
                  disabled={!currentUser}
                  className={`px-1 text-xs border rounded ${voteSummary?.userVote === -1 ? 'bg-[#ffeec2] border-yellow-400' : 'border-[#ddcdb7]'}`}
                  onClick={() => onVote?.(node.id, voteSummary?.userVote === -1 ? 0 : -1)}
                >▼</button>
              </div>
            )}
            {isNewBadge(node.updatedAt || node.createdAt) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 border border-green-300 text-green-800">New</span>
            )}
            {isMember && !locked && (
              <button className="text-xs text-gray-600 hover:underline" onClick={() => setReplyOpen((v) => !v)}>Reply</button>
            )}
            {isOwner && canEditWindow && (
              <>
                <button className="text-xs text-gray-600 hover:underline" onClick={() => onEdit(node)}>Edit</button>
                <button className="text-xs text-red-600 hover:underline" onClick={() => onDelete(node)}>Delete</button>
              </>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-800 mt-1" style={{}}>{node.body}</div>
      </div>
      {replyOpen && (
        <form onSubmit={handleChildReply} className="mt-2 space-y-2" style={{ marginLeft: `${Math.min(node.depth, 3) * 16}px` }}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            placeholder={locked ? 'Thread is locked' : 'Write a reply…'}
            disabled={!isMember || locked}
            className="w-full border border-[#ddcdb7] rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60"
            style={{backgroundColor: '#FDFBF6' }}
          />
          <div className="flex items-center gap-2 justify-end">
            <button type="button" className="text-xs text-gray-600 hover:underline" onClick={() => { setReplyOpen(false); setReplyText(''); }}>Cancel</button>
            <button
              type="submit"
              disabled={!isMember || locked || !replyText.trim()}
              className="px-2 py-1 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] text-xs disabled:opacity-60"
              style={{}}
            >
              Post reply
            </button>
          </div>
        </form>
      )}
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
            <ReplyNode
              key={child.id}
              node={child}
              currentUser={currentUser}
              isMember={isMember}
              locked={locked}
              threadId={threadId}
              onReplied={onReplied}
              onEdit={onEdit}
              onDelete={onDelete}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ThreadDetail({ threadId, currentUser, isMember, isHost }) {
  const [thread, setThread] = useState(null);
  const [allReplies, setAllReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [threadVotes, setThreadVotes] = useState({ upvotes: 0, downvotes: 0, score: 0, userVote: 0 });
  const [replyVotes, setReplyVotes] = useState({});
  const composerRef = useRef(null);
  const initialVisibleCount = 3;
  const pollMs = 30000;
  

  const load = async () => {
    setLoading(true);
    const data = await fetchThread(threadId);
    if (!data) return setLoading(false);
    setThread(data.thread);
    setAllReplies(data.replies || []);
    setLoading(false);
  };

  useEffect(() => {
    setExpanded(false);
    load();
    setLastSeen(threadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    const id = setInterval(() => load(), pollMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  // Load votes for thread and replies whenever replies or user changes
  useEffect(() => {
    const uid = currentUser?.id;
    if (!threadId) return;
    (async () => {
      try {
        const tv = await getDiscussionVotes(threadId, uid);
        setThreadVotes(tv);
      } catch {}
      try {
        const list = allReplies || [];
        const results = await Promise.all(
          list.map(async (r) => {
            try {
              const v = await getReplyVotes(r.id, uid);
              return [r.id, v];
            } catch {
              return [r.id, { upvotes: 0, downvotes: 0, score: 0, userVote: 0 }];
            }
          })
        );
        setReplyVotes(Object.fromEntries(results));
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, allReplies, currentUser?.id]);

  // Build a tree and paginate only top-level comments like Instagram
  const tree = useMemo(() => buildTree(allReplies), [allReplies]);
  const topLevelVisible = useMemo(() => (
    expanded ? tree : tree.slice(0, initialVisibleCount)
  ), [expanded, tree]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !isMember || thread?.locked) return;
    await createReply({ threadId, body: replyText.trim(), author: { id: currentUser.id, name: currentUser.name } });
    setReplyText('');
    setComposerOpen(false);
    await load();
  };

  const openComposer = () => {
    if (!isMember || thread?.locked) return;
    setComposerOpen(true);
    setTimeout(() => composerRef.current?.focus(), 0);
  };

  const onEdit = async (node) => {
    // Placeholder: open a simple prompt; full editor could be added later
    const next = window.prompt('Edit your reply:', node.body);
    if (next == null) return;
    // We call fetchThread again after mock to refresh
    await apiEditReply({ replyId: node.id, body: next, userId: currentUser?.id });
    await load();
  };

  const onDelete = async (node) => {
    if (!window.confirm('Delete this reply?')) return;
    await apiDeleteReply({ replyId: node.id, userId: currentUser?.id });
    await load();
  };

  const onThreadVote = async (value) => {
    if (!currentUser) return;
    try {
      const res = await voteDiscussion(threadId, { userId: currentUser.id, value });
      setThreadVotes(res);
    } catch {}
  };

  const onReplyVote = async (replyId, value) => {
    if (!currentUser) return;
    try {
      const res = await voteReply(replyId, { userId: currentUser.id, value });
      setReplyVotes((prev) => ({ ...prev, [replyId]: res }));
    } catch {}
  };

  if (!thread) return (
    <p className="text-sm text-gray-600" style={{}}>Loading…</p>
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
        <h4 className="text-lg font-semibold text-gray-800 mt-1" style={{}}>{thread.title}</h4>
        <p className="text-xs text-gray-600" style={{}}>
          by {thread.author?.name || 'Unknown'} · {new Date(thread.createdAt).toLocaleString()}
        </p>
        <div className="text-sm text-gray-800 mt-3 whitespace-pre-wrap" style={{}}>{thread.body}</div>
        <div className="mt-2 flex items-center gap-1" title="Vote">
          <button
            type="button"
            disabled={!currentUser}
            className={`px-1 text-xs border rounded ${threadVotes?.userVote === 1 ? 'bg-[#ffeec2] border-yellow-400' : 'border-[#ddcdb7]'}`}
            onClick={() => onThreadVote(threadVotes?.userVote === 1 ? 0 : 1)}
          >▲</button>
          <span className="text-xs text-gray-700 text-center" title="Up | Down">{(threadVotes?.upvotes ?? 0)} | {(threadVotes?.downvotes ?? 0)}</span>
          <button
            type="button"
            disabled={!currentUser}
            className={`px-1 text-xs border rounded ${threadVotes?.userVote === -1 ? 'bg-[#ffeec2] border-yellow-400' : 'border-[#ddcdb7]'}`}
            onClick={() => onThreadVote(threadVotes?.userVote === -1 ? 0 : -1)}
          >▼</button>
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={openComposer}
            disabled={!isMember || thread.locked}
            title={thread.locked ? 'Thread is locked' : 'Reply'}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] text-xs disabled:opacity-60"
            style={{}}
          >
            <span role="img" aria-label="reply">💬</span>
            Reply
          </button>
        </div>
      </div>

      {/* Replies */}
      <div className="mt-2">
        {composerOpen && (
          <form onSubmit={handleReply} className="mb-3 space-y-2">
            <textarea
              ref={composerRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              placeholder={thread.locked ? 'Thread is locked' : 'Add a comment…'}
              disabled={!isMember || thread.locked}
              className="w-full border border-[#ddcdb7] rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60"
              style={{backgroundColor: '#FDFBF6' }}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="px-3 py-2 rounded border border-[#ddcdb7] bg-white text-sm"
                style={{}}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isMember || thread.locked || !replyText.trim()}
                className="px-3 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] text-sm disabled:opacity-60"
                style={{}}
              >
                Post
              </button>
            </div>
          </form>
        )}
        {topLevelVisible.map((n) => (
          <ReplyNode
            key={n.id}
            node={n}
            currentUser={currentUser}
            isMember={Boolean(isMember)}
            locked={Boolean(thread.locked)}
            threadId={threadId}
            onReplied={load}
            onEdit={onEdit}
            onDelete={onDelete}
            voteSummary={replyVotes[n.id]}
            onVote={onReplyVote}
          />
        ))}
        {tree.length > initialVisibleCount && (
          <div className="mt-3">
            {!expanded ? (
              <button
                type="button"
                className="text-sm text-gray-700 underline"
                onClick={() => setExpanded(true)}
                style={{}}
              >
                Show more comments ({tree.length - initialVisibleCount} more)
              </button>
            ) : (
              <button
                type="button"
                className="text-sm text-gray-700 underline"
                onClick={() => setExpanded(false)}
                style={{}}
              >
                Show fewer comments
              </button>
            )}
          </div>
        )}
        {loading && (
          <p className="text-xs text-gray-500" style={{}}>Loading…</p>
        )}
      </div>
      {/* Composer removed per request; use the Reply button above to add comments via prompt. */}
    </div>
  );
}
