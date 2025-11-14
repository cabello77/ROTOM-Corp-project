
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function DMChat({ conversationId, user, apiBase, friend }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const listRef = useRef(null);
  const socketRef = useRef(null);

  const canChat = Boolean(user?.id && conversationId);

  const loadHistory = async () => {
    if (!canChat) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/dm/${conversationId}/messages`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
      setTimeout(() => {
        listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  useEffect(() => {
    if (!canChat) return;

    loadHistory();
    setConnecting(true);

    const socket = io(apiBase, { query: { userId: user.id } });
    socketRef.current = socket;

    socket.emit("join_dm", conversationId);

    socket.on("connect", () => setConnecting(false));

    socket.on("receive_dm", (msg) => {
      setMessages((prev) => [...prev, msg]);
      listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
    });

    return () => socket.disconnect();
  }, [conversationId, user?.id]);

  const sendMessage = () => {
    if (!text.trim()) return;

    socketRef.current.emit("send_dm", {
      conversationId,
      senderId: user.id,
      content: text.trim(),
    });

    setText("");
  };

  if (!conversationId) return null;

  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={
            friend?.profile?.profilePicture
              ? friend.profile.profilePicture.startsWith("http")
                ? friend.profile.profilePicture
                : `${apiBase}${friend.profile.profilePicture}`
              : "https://via.placeholder.com/40"
          }
          className="w-12 h-12 rounded-full border border-[#d7c4a9]"
        />

        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {friend?.name}
          </h2>
          <p className="text-xs text-gray-500 italic">
            Direct Message
          </p>
        </div>

        {(loading || connecting) && (
          <span className="ml-auto text-xs text-gray-500">
            {loading ? "Loading…" : "Connecting…"}
          </span>
        )}
      </div>

      {/* CHAT MESSAGES */}
      <div
        ref={listRef}
        className="h-[28rem] overflow-y-auto bg-[#faf6ed] border border-[#e3d8c8] rounded-lg p-3 space-y-3"
      >
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.senderId === user.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 max-w-[70%] text-sm rounded-xl border ${
                  m.senderId === user.id
                    ? "bg-[#efe6d7] border-[#ddcdb7]"
                    : "bg-white border-[#e3d8c8]"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* INPUT */}
      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message…"
          className="flex-1 border border-[#ddcdb7] rounded-lg px-3 py-2 text-sm"
        />

        <button
          onClick={sendMessage}
          className="px-4 py-2 rounded-lg bg-[#774C30] text-white hover:opacity-90 text-sm"
        >
          Send
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
