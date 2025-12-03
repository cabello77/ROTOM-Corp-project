import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function LiveChat({ clubId, user, isMember, apiBase }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const listRef = useRef(null);
  const socketRef = useRef(null);

  const canChat = Boolean(isMember && user && user.id && clubId);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    list.scrollTop = list.scrollHeight;
  }, [messages]);

  function resolveAvatar(apiBase, user) {
    const path = user?.profilePicture;

    if (!path) {
      const firstLetter =
      user?.profile?.username?.charAt(0)?.toUpperCase() ||
      user?.username?.charAt(0)?.toUpperCase() ||
      "U";

      return `https://ui-avatars.com/api/?name=${firstLetter}&background=EEE&color=555&size=64&rounded=true`;
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    return `${apiBase}${path}`;
  }

  // ✅ FIX: Proper loadHistory restored
  const loadHistory = async () => {
    if (!canChat) return;

    try {
      setLoading(true);
      const res = await fetch(
        `${apiBase}/api/clubs/${clubId}/messages?userId=${user.id}`
      );

      if (!res.ok) throw new Error("Failed to load chat history");

      const data = await res.json();
      setMessages(data || []);

      // Scroll to bottom after history loads
      setTimeout(() => {
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
      }, 0);
    } catch (e) {
      console.error("History load error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Socket setup
  useEffect(() => {
    if (!canChat) return;

    loadHistory(); // 🔥 This fixes your reconnect issue

    if (socketRef.current) {
      console.log("⚠️ Socket already exists, skipping new connection");
      return;
    }

    setConnecting(true);

    const socket = io(apiBase, {
      query: { userId: user.id },
      transports: ["websocket"],
      forceNew: true
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnecting(false);
      console.log("✅ LiveChat socket connected:", socket.id);
    });

    socket.emit("joinClub", { clubId });

    socket.on("newMessage", (msg) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // ✅ Auto-scroll on new message
      setTimeout(() => {
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
      }, 0);
    });

    return () => {
      console.log("🧹 Cleaning socket for club:", clubId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [clubId, user?.id, apiBase, isMember]);

  const handleSend = () => {
    if (!canChat || !socketRef.current) return;

    const content = text.trim();
    if (!content) return;

    socketRef.current.emit("sendMessage", { clubId, content }, (ack) => {
      if (ack && !ack.ok) {
        console.error("Send failed:", ack.error);
      }
    });

    setText("");
  };

  if (!clubId) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-[26rem]">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "Times New Roman, serif" }}>
          Live Chat
        </h2>
        {(loading || connecting) && (
          <span className="text-xs text-gray-500">
            {loading ? "Loading messages…" : "Connecting…"}
          </span>
        )}
      </div>

      {!canChat ? (
        <div className="flex-1 flex items-center justify-center bg-[#faf6ed] border rounded-md p-4">
          <p className="text-sm text-gray-600 text-center">
            Join this club to participate in the live chat.
          </p>
        </div>
      ) : (
        <>
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto bg-[#faf6ed] border rounded-md p-3 space-y-2"
          >
            {messages.length === 0 && !loading && (
              <p className="text-xs text-gray-500 text-center">
                No messages yet.
              </p>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2 mb-3">
                <img
                  src={resolveAvatar(apiBase, msg.user)}
                  className="w-8 h-8 rounded-full border"
                />

                <div>
                  <p className="text-xs text-gray-600 mb-1 font-semibold">
                    {msg.user?.profile?.username || msg.user?.username || "Member"}
                  </p>


                  <div className="bg-white border rounded px-3 py-2 text-sm max-w-[32rem]">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 rounded bg-[#774C30] text-white text-sm"
            >
              Send
            </button>
          </div>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </>
      )}
    </div>
  );
}
