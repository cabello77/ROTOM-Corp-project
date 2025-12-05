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
    if (!conversationId || !user?.id) return;

    loadHistory(conversationId);

    // Check if socket already exists
    if (socketRef.current) {
      console.log("⚠️ DM Socket already exists, skipping new connection");
      return;
    }

    setConnecting(true);

    const socket = io(apiBase, {
      query: { userId: user.id },
      transports: ["websocket"],
      forceNew: true
    });
    
    socketRef.current = socket;

    // Set a timeout for connection
    let connectionTimeout = setTimeout(() => {
      if (socket && !socket.connected) {
        console.error("⏱️ DM socket connection timeout");
        setConnecting(false);
        setError("Connection timeout. Please check your internet connection and refresh.");
        socket.disconnect();
        socketRef.current = null;
      }
    }, 10000); // 10 second timeout

    socket.on("connect", () => {
      clearTimeout(connectionTimeout);
      setConnecting(false);
      setError(null);
      console.log("✅ DM socket connected:", socket.id);
      // Emit join_dm after connection is established
      socket.emit("join_dm", { conversationId });
    });

    socket.on("connect_error", (error) => {
      clearTimeout(connectionTimeout);
      console.error("❌ DM socket connection error:", error);
      setConnecting(false);
      setError("Failed to connect to chat server. Please refresh the page.");
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 DM socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected, reconnect manually
        socket.connect();
      } else {
        setConnecting(true);
      }
    });

    socket.on("receive_dm", (msg) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => {
        listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    });

    return () => {
      console.log("🧹 Cleaning DM socket");
      clearTimeout(connectionTimeout);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [conversationId, user?.id, apiBase]);


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
          <h2 className="text-lg font-semibold text-gray-800" style={{}}>
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
                borderColor: "#ddcdb7",}}
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
          style={{}}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-lg bg-[#774C30] text-white hover:opacity-90 text-sm"
          style={{}}
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
