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

  const canChat = Boolean(user && user.id && conversationId);

  const loadHistory = async () => {
    if (!canChat) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/dms/${conversationId}/messages`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data || []);
    } catch (e) {
      console.error("Error loading DM history:", e);
      setError(e.message || "Failed to load messages");
    } finally {
      setLoading(false);
      setTimeout(() => {
        listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
      }, 0);
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
    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
      setConnecting(false);
      setError("Could not connect to DM chat.");
    });

    socket.on("recieve_dm", (msg) => {
      setMessages((prev) => [...prev, msg]);
      listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
    });

    return () => socket.disconnect();
  }, [conversationId, user?.id, apiBase]);

  const handleSend = () => {
    if (!canChat || !socketRef.current) return;
    const content = text.trim();
    if (!content) return;

    socketRef.current.emit("send_dm", { conversationId, senderId: user.id, receiverId: friend.id, content });
    setText("");
  };

  if (!conversationId) return null;

  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={
              friend?.profile?.profilePicture
                ? friend.profile.profilePicture.startsWith("http")
                  ? friend.profile.profilePicture
                  : `${apiBase}${friend.profile.profilePicture}`
                : "https://via.placeholder.com/40"
            }
            alt={friend?.name || "Friend"}
            className="w-10 h-10 rounded-full border border-[#d7c4a9]"
          />
          <h2
            className="text-lg font-semibold text-gray-800"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            {friend?.name || "Direct Message"}
          </h2>
        </div>
        {(loading || connecting) && (
          <span className="text-xs text-gray-500">
            {loading ? "Loading…" : "Connecting…"}
          </span>
        )}
      </div>

      {/* Chat Messages */}
      <div
        ref={listRef}
        className="h-[22rem] overflow-y-auto bg-[#faf6ed] border border-[#e3d8c8] rounded-lg p-3 space-y-3"
      >
        {messages.length === 0 && !loading ? (
          <p
            className="text-sm text-gray-500 text-center italic"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
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
                className={`inline-block max-w-[70%] px-3 py-2 rounded-xl text-sm border ${
                  m.senderId === user.id
                    ? "bg-[#efe6d7] border-[#ddcdb7]"
                    : "bg-white border-[#e3d8c8]"
                }`}
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message…"
          className="flex-1 border border-[#ddcdb7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d7bfa2]"
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
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
