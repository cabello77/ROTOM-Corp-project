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

  const canChat = Boolean(isMember && user && user.id && clubId);\

  function resolveAvatar(apiBase, user) {
  const path = user?.profilePicture;

  // 1. If user does NOT have a picture → use generated "initial" avatar
  if (!path) {
      const firstLetter = user?.name?.charAt(0)?.toUpperCase() || "U";
      // Return the same placeholder style you use on UserHome
      return `https://ui-avatars.com/api/?name=${firstLetter}&background=EEE&color=555&size=64&rounded=true`;
    }

    // 2. If full URL → return as is
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // 3. If relative path → prefix backend URL
    return `${apiBase}${path}`;
  }


  // Load initial history
  const loadHistory = async () => {
    if (!canChat) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${apiBase}/api/clubs/${clubId}/messages?userId=${user.id}`
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load messages");
      }

      const data = await res.json();
      setMessages(data || []);
    } catch (e) {
      console.error("Error loading chat history:", e);
      setError(e.message || "Failed to load chat");
    } finally {
        setLoading(false);
        // scroll to bottom of the chat container only
        setTimeout(() => {
          const list = listRef.current;
          if (list) {
            list.scrollTop = list.scrollHeight;
          }
        }, 0);
      }
  };

  // Socket.IO setup
  useEffect(() => {
    if (!canChat) return;

    loadHistory();

    setConnecting(true);
    const socket = io(apiBase, {
      query: { userId: user.id },
    });
    socketRef.current = socket;

    socket.emit("joinClub", { clubId });

    socket.on("connect", () => {
      setConnecting(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
      setConnecting(false);
      setError("Live chat connection failed.");
    });

  socket.on("newMessage", (msg) => {
    setMessages((prev) => {
      const list = listRef.current;
      const isNearBottom =
        list &&
        list.scrollHeight - list.scrollTop - list.clientHeight < 100;

      const updated = [...prev, msg];

      if (isNearBottom && list) {
        setTimeout(() => {
          const l = listRef.current;
          if (l) {
            l.scrollTop = l.scrollHeight;
          }
        }, 50);
      }

      return updated;
    });
  });

  return () => {
    socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, user?.id, apiBase, isMember]);

  const handleSend = () => {
    if (!canChat || !socketRef.current) return;
    const content = text.trim();
    if (!content) return;

    const socket = socketRef.current;

    socket.emit("sendMessage", { clubId, content }, (ack) => {
      if (ack && !ack.ok) {
        console.error("Send failed:", ack.error);
        setError(ack.error || "Failed to send message");
      }
    });

    setText("");
  };

  if (!clubId) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-[26rem]">
      <div className="flex justify-between items-center mb-3">
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
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
          <p
            className="text-sm text-gray-600 text-center"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
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
                No messages yet. Start the conversation!
              </p>
            )}

              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2 mb-3">
                  {/* Avatar */}
                  <img
                    src={resolveAvatar(apiBase, msg.user)}
                    alt={msg.user?.name || "User"}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 border"
                  />


                  {/* Message content */}
                  <div>
                    <p
                      className="text-xs text-gray-600 mb-1"
                      style={{ fontFamily: "Times New Roman, serif" }}
                    >
                      {msg.user?.name ?? "Member"}
                    </p>
                    <div
                      className="bg-white border rounded-md px-3 py-2 text-sm max-w-[32rem]"
                      style={{
                        whiteSpace: "normal",            // Collapse any accidental newlines
                        wordBreak: "normal",             // Don't break inside words
                        overflowWrap: "break-word",      // Only break *very* long words/URLs
                      }}
                    >
                      {msg.content}
                    </div>

                  </div>
                </div>
              ))}
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message…"
              className="flex-1 border rounded-md px-3 py-2 bg-white text-sm"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 rounded-md text-white hover:opacity-90 text-sm"
              style={{
                backgroundColor: "#774C30",
                fontFamily: "Times New Roman, serif",
              }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
