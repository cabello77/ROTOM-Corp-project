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

  const canChat = Boolean(user && user.id && conversationId && friend && friend.id);

  const loadHistory = async () => {
    if (!canChat) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/dms/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
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
      }, 100);
    }
  };

  useEffect(() => {
    if (!canChat) return;

    loadHistory();
    setConnecting(true);

    const socket = io(apiBase, { query: { userId: user.id } });
    socketRef.current = socket;

    socket.emit("join_dm", conversationId);

    socket.on("connect", () => {
      console.log("Socket connected");
      setConnecting(false);
    });
    
    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
      setConnecting(false);
      setError("Could not connect to chat.");
    });

    socket.on("receive_dm", (msg) => {
      console.log("Received DM:", msg);
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => {
        listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => {
      console.log("Disconnecting socket");
      socket.disconnect();
    };
  }, [conversationId, user?.id, apiBase, canChat]);

  const handleSend = () => {
    if (!canChat || !socketRef.current) {
      console.log("Cannot send - not ready", { canChat, hasSocket: !!socketRef.current });
      return;
    }
    
    const content = text.trim();
    if (!content) return;

    console.log("Sending DM:", {
      conversationId,
      senderId: user.id,
      receiverId: friend.id,
      content
    });

    socketRef.current.emit("send_dm", {
      conversationId,
      senderId: user.id,
      receiverId: friend.id,
      content,
    });

    setText("");
  };

  if (!conversationId) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <img
          src={
            friend?.profile?.profilePicture
              ? (friend.profile.profilePicture.startsWith("http")
                  ? friend.profile.profilePicture
                  : `${apiBase}${friend.profile.profilePicture}`)
              : "https://via.placeholder.com/40"
          }
          alt={friend?.name || "Friend"}
          className="w-12 h-12 rounded-full border-2 border-amber-100 object-cover"
        />

        <div className="flex flex-col flex-1">
          <h2 className="text-lg font-semibold text-gray-800">
            {friend?.name || "Chat"}
          </h2>
          <p className="text-xs text-gray-500 italic">
            Direct Message
          </p>
        </div>

        {(loading || connecting) && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <span className="animate-pulse">●</span>
            {loading ? "Loading…" : "Connecting…"}
          </span>
        )}
      </div>

      {/* Chat Messages */}
      <div
        ref={listRef}
        className="h-96 overflow-y-auto bg-amber-50/30 border border-gray-200 rounded-lg p-4 space-y-3 mb-4"
      >
        {messages.length === 0 && !loading ? (
          <p className="text-sm text-gray-500 text-center italic mt-8">
            No messages yet. Say hello! 👋
          </p>
        ) : (
          messages.map((m, idx) => {
            const isMine = m.senderId === user.id;
            return (
              <div
                key={m.id || idx}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`inline-block max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    isMine
                      ? "bg-amber-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                  }`}
                >
                  <p className="break-words">{m.content}</p>
                  {m.createdAt && (
                    <p className={`text-xs mt-1 ${
                      isMine ? "text-amber-100" : "text-gray-400"
                    }`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message…"
          disabled={!canChat || connecting}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={!canChat || !text.trim() || connecting}
          className="px-6 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          Send
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}