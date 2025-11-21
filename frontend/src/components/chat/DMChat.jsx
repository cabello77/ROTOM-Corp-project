import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function DMChat({user, apiBase, friend }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const listRef = useRef(null);
  const socketRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    list.scrollTo({
      top: list.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);


  const canChat = Boolean(user && user.id && conversationId);

  const loadConversation = async () => {
  try {
    const res = await fetch(
      `${apiBase}/api/dm/conversation?userId=${user.id}&friendId=${friend.id}`
    );
    if (!res.ok) throw new Error("Failed to load conversation");
    const data = await res.json();
    setConversationId(data.conversationId);
  } catch (e) {
    setError(e.message);
  }
};

const loadHistory = async (cid) => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/dm/messages/${cid}`);
      if (!res.ok) throw new Error("Failed to load messages");

      const data = await res.json();
      setMessages(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setTimeout(() => {
        listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  };

  useEffect(() => {
    setConversationId(null);
    setMessages([]);
    loadConversation();
  }, [friend.id]);

  useEffect(() => {
    if (!conversationId) return;

    loadHistory(conversationId);

    setConnecting(true);

    const socket = io(apiBase, { query: { userId: user.id } });
    socketRef.current = socket;

    socket.emit("join_dm", { conversationId });

    socket.on("connect", () => setConnecting(false));

    socket.on("receive_dm", (msg) => {
      setMessages((prev) => [...prev, msg]);
      listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
    });

    return () => socket.disconnect();
  }, [conversationId]);


  const handleSend = () => {
    const content = text.trim();
    if (!content || !canChat) return;
    socketRef.current.emit("send_dm", {
      conversationId,
      senderId: user.id,
      receiverId: friend.id,
      content
    });
    setText("");
  };

  const avatar = friend?.profile?.profilePicture
    ? (friend.profile.profilePicture.startsWith("http")
        ? friend.profile.profilePicture
        : `${apiBase}${friend.profile.profilePicture}`)
    : null;

  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#e3d8c8]">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#d7c4a9]">
          {avatar ? (
            <img src={avatar} className="w-full h-full object-cover" />
          ) : (
            <div className="bg-[#efe2cf] w-full h-full flex items-center justify-center text-sm text-gray-700 font-semibold">
              {friend?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "Times New Roman, serif" }}>
            {friend?.name}
          </h2>
          <p className="text-xs text-gray-500 italic">Direct Message</p>
        </div>

        {(loading || connecting) && (
          <span className="text-xs text-gray-500 ml-auto">
            {loading ? "Loading…" : "Connecting…"}
          </span>
        )}
      </div>

      {/* CHAT WINDOW */}
      <div
        ref={listRef}
        className="h-[22rem] overflow-y-auto bg-[#faf6ed] border border-[#e3d8c8] rounded-lg p-3 space-y-3"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.senderId === user.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`inline-block max-w-[70%] px-3 py-2 rounded-xl text-sm border`}
              style={{
                backgroundColor: m.senderId === user.id ? "#efe6d7" : "#ffffff",
                borderColor: "#ddcdb7",
                fontFamily: "Times New Roman, serif",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message…"
          className="flex-1 border border-[#ddcdb7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d7bfa2]"
          style={{ fontFamily: "Times New Roman, serif" }}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-lg bg-[#774C30] text-white hover:opacity-90 text-sm"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Send
        </button>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
// import refile
