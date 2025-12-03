import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createReply,
  fetchThread,
  isNewBadge,
  setLastSeen,
  editReply as apiEditReply,
  deleteReply as apiDeleteReply,
  getDiscussionVotes,
  voteDiscussion,
  getReplyVotes,
  voteReply
} from '../../services/discussions';

// Build reply tree
function buildTree(replies) {
  const byParent = new Map();
  replies.forEach((r) => {
    const key = r.parentId || 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(r);
  });

  for (const arr of byParent.values()) {
    arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const attach = (parentId, depth = 0) =>
    (byParent.get(parentId || 'root') || []).map((r) => ({
      ...r,
      depth,
      children: attach(r.id, depth + 1)
    }));

  return attach(null, 0);
}

// ---------- Reply Node ----------
function ReplyNode({
  node,
  currentUser,
  isMember,
  locked,
  threadId,
  onReplied,
  onEdit,
  onDelete,
  voteSummary,
  onVote
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  // FIXED NAME SYSTEM
  const authorName =
    node.author?.profile?.fullName ||
    node.author?.username ||
    node.author?.name ||
    'Unknown';

  const isOwner = currentUser && node.author && currentUser.id === node.author.id;

  const canEditWindow = () => {
    const created = new Date(node.createdAt).getTime();
    return Date.now() - created <= 30 * 60 * 1000;
  };

  const handleChildReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !isMember || locked) return;

    const curName =
      currentUser?.profile?.fullName ||
      currentUser?.username ||
      currentUser?.name;

    await createReply({
      threadId,
      parentId: node.id,
      body: replyText.trim(),
      author: { id: currentUser.id, name: curName }
    });

    setReplyText('');
    setReplyOpen(false);
    onReplied?.();
  };

  return (
    <div className="mt-3" style={{ marginLeft: `${Math.min(node.depth, 3) * 16}px` }}>
      <div className="p-3 rounded border border-[#e6dac8] bg-[#faf6ed]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
            {authorName} · {new Date(node.createdAt).toLocaleString()}
          </p>

          <div className="flex items-center gap-3">

            {/* Votes */}
            {voteSummary && (
              <div className="flex items-center gap-1" title="Vote">
                <button
                  type="button"
                  disabled={!currentUser}
                  className={`px-1 text-xs border rounded ${
                    voteSummary?.userVote === 1
                      ? 'bg-[#ffeec2] border-yellow-400'
                      : 'border-[#ddcdb7]'
                  }`}
                  onClick={() => onVote?.(node.id, voteSummary?.userVote === 1 ? 0 : 1)}
                >
                  ▲
                </button>
                <span className="text-xs text-gray-700 text-center">
                  {(voteSummary?.upvotes ?? 0)} | {(voteSummary?.downvotes ?? 0)}
                </span>
                <button
                  type="button"
                  disabled={!currentUser}
                  className={`px-1 text-xs border rounded ${
                    voteSummary?.userVote === -1
                      ? 'bg-[#ffeec2] border-yellow-400'
                      : 'border-[#ddcdb7]'
                  }`}
                  onClick={() => onVote?.(node.id, voteSummary?.userVote === -1 ? 0 : -1)}
                >
                  ▼
                </button>
              </div>
            )}

            {isNewBadge(node.updatedAt || node.createdAt) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 border border-green-300 text-green-800">
                New
              </span>
            )}

            {isMember && !locked && (
              <button className="text-xs text-gray-600 hover:underline" onClick={() => setReplyOpen((v) => !v)}>
                Reply
              </button>
            )}

            {isOwner && canEditWindow() && (
              <>
                <button className="text-xs text-gray-600 hover:underline" onClick={() => onEdit(node)}>
                  Edit
                </button>
                <button className="text-xs text-red-600 hover:underline" onClick={() => onDelete(node)}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-800 mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
          {node.body}
        </div>
      </div>

      {/* Reply box */}
      {replyOpen && (
        <form
          onSubmit={handleChildReply}
          className="mt-2 space-y-2"
          style={{ marginLeft: `${Math.min(node.depth, 3) * 16}px` }}
        >
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            placeholder={locked ? 'Thread is locked' : 'Write a reply…'}
            disabled={!isMember || locked}
            className="w-full border border-[#ddcdb7] rounded-lg px-3 py-2 text-gray-700"
            style={{ fontFamily: 'Times New Roman, serif', backgroundColor: '#FDFBF6' }}
          />

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              className="text-xs text-gray-600 hover:underline"
              onClick={() => {
                setReplyOpen(false);
                setReplyText('');
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isMember || locked || !replyText.trim()}
              className="px-2 py-1 rounded border border-[#ddcdb7] bg-[#efe6d7]"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Post reply
            </button>
          </div>
        </form>
      )}

      {/* Child replies */}
      {node.children && node.children.length > 0 && node.depth < 3 && (
        <div className="mt-1">
          <button className="text-xs text-gray-600 hover:underline" onClick={() => setCollapsed((c) => !c)}>
            {collapsed
              ? `Expand ${node.children.length} repl${node.children.length === 1 ? 'y' : 'ies'}`
              : 'Collapse'}
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
              voteSummary={voteSummary}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Main Thread Detail ----------
export default function ThreadDetail({ threadId, currentUser, isMember, isHost }) {
  const [thread, setThread] = useState(null);
  const [allReplies, setAllReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [threadVotes, setThreadVotes] = useState({ upvotes: 0, downvotes: 0, userVote: 0 });
  const [replyVotes, setReplyVotes] = useState({});
  const composerRef = useRef(null);
  const initialVisibleCount = 3;
  const pollMs = 30000;

  // Load thread + replies
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
  }, [threadId]);

  useEffect(() => {
    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [threadId]);

  // Load votes
  useEffect(() => {
    const uid = currentUser?.id;
    if (!threadId) return;

    (async () => {
      try {
        const tv = await getDiscussionVotes(threadId, uid);
        setThreadVotes(tv);
      } catch {}

      try {
        const results = await Promise.all(
          allReplies.map(async (r) => {
            try {
              const v = await getReplyVotes(r.id, uid);
              return [r.id, v];
            } catch {
              return [r.id, { upvotes: 0, downvotes: 0, userVote: 0 }];
            }
          })
        );
        setReplyVotes(Object.fromEntries(results));
      } catch {}
    })();
  }, [threadId, allReplies, currentUser?.id]);

  // Tree structure
  const tree = useMemo(() => buildTree(allReplies), [allReplies]);
  const topLevelVisible = useMemo(
    () => (expanded ? tree : tree.slice(0, initialVisibleCount)),
    [expanded, tree]
  );

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !isMember || thread?.locked) return;

    const curName =
      currentUser?.profile?.fullName ||
      currentUser?.username ||
      currentUser?.name;

    await createReply({
      threadId,
      body: replyText.trim(),
      author: { id: currentUser.id, name: curName }
    });

    setReplyText('');
    setComposerOpen(false);
    load();
  };

  const openComposer = () => {
    if (!isMember || thread?.locked) return;
    setComposerOpen(true);
    setTimeout(() => composerRef.current?.focus(), 0);
  };

  const onEdit = async (node) => {
    const next = window.prompt('Edit your reply:', node.body);
    if (next == null) return;
    await apiEditReply({ replyId: node.id, body: next, userId: currentUser?.id });
    load();
  };

  const onDelete = async (node) => {
    if (!window.confirm('Delete this reply?')) return;
    await apiDeleteReply({ replyId: node.id, userId: currentUser?.id });
    load();
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

  if (!thread)
    return (
      <p className="text-sm text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
        Loading…
      </p>
    );

  // FIXED NAME SYSTEM
  const threadAuthorName =
    thread.author?.profile?.fullName ||
    thread.author?.username ||
    thread.author?.name ||
    'Unknown';

  return (
    <div className="space-y-4">
      {/* Thread header */}
      <div>
        <div className="flex items-center gap-2">
          {thread.pinned && (
            <span className="text-xs px-2 py-1 rounded bg-yellow-100 border border-yellow-300 text-yellow-800">
              Pinned
            </span>
          )}
          {thread.locked && (
            <span className="text-xs px-2 py-1 rounded bg-red-100 border border-red-300 text-red-800">
              Locked
            </span>
          )}
        </div>

        <h4
          className="text-lg font-semibold text-gray-800 mt-1"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          {thread.title}
        </h4>

        <p
          className="text-xs text-gray-600"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          by {threadAuthorName} · {new Date(thread.createdAt).toLocaleString()}
        </p>

        <div
          className="text-sm text-gray-800 mt-3 whitespace-pre-wrap"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          {thread.body}
        </div>

        {/* Votes */}
        <div className="mt-2 flex items-center gap-1" title="Vote">
          <button
            type="button"
            disabled={!currentUser}
            className={`px-1 text-xs border rounded ${
              threadVotes?.userVote === 1 ? 'bg-[#ffeec2] border-yellow-400' : 'border-[#ddcdb7]'
            }`}
            onClick={() => onThreadVote(threadVotes?.userVote === 1 ? 0 : 1)}
          >
            ▲
          </button>
          <span className="text-xs text-gray-700 text-center">
            {(threadVotes?.upvotes ?? 0)} | {(threadVotes?.downvotes ?? 0)}
          </span>
          <button
            type="button"
            disabled={!currentUser}
            className={`px-1 text-xs border rounded ${
              threadVotes?.userVote === -1
                ? 'bg-[#ffeec2] border-yellow-400'
                : 'border-[#ddcdb7]'
            }`}
            onClick={() => onThreadVote(threadVotes?.userVote === -1 ? 0 : -1)}
          >
            ▼
          </button>
        </div>

        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={openComposer}
            disabled={!isMember || thread.locked}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] text-xs disabled:opacity-60"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            💬 Reply
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
              className="w-full border border-[#ddcdb7] rounded-lg px-3 py-2 text-gray-700"
              style={{ fontFamily: 'Times New Roman, serif', backgroundColor: '#FDFBF6' }}
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="px-3 py-2 rounded border border-[#ddcdb7] bg-white text-sm"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isMember || thread.locked || !replyText.trim()}
                className="px-3 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] text-sm disabled:opacity-60"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Post
              </button>
            </div>
          </form>
        )}

        {/* Render visible replies */}
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
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Show more comments ({tree.length - initialVisibleCount} more)
              </button>
            ) : (
              <button
                type="button"
                className="text-sm text-gray-700 underline"
                onClick={() => setExpanded(false)}
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Show fewer comments
              </button>
            )}
          </div>
        )}

        {loading && (
          <p className="text-xs text-gray-500" style={{ fontFamily: 'Times New Roman, serif' }}>
            Loading…
          </p>
        )}
      </div>
    </div>
  );
}
