import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function DMChat({ conversationId, user, apiBase, friend }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const listRef = useRef(null);

  // Scroll to bottom helper
  const scrollBottom = () => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  // Load past messages
  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/dm/messages/${conversationId}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
      setTimeout(scrollBottom, 100);
    }
  };

  // Setup socket + load messages on conversation change
  useEffect(() => {
    if (!conversationId) return;

    loadHistory();

    const socket = io(apiBase, { query: { userId: user.id } });
    socketRef.current = socket;

    socket.emit("join_dm", conversationId);

    socket.on("receive_dm", (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollBottom();
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId]);

  // Send a message
  const sendMessage = () => {
    if (!text.trim()) return;

    socketRef.current.emit("send_dm", {
      convoId: conversationId,
      senderId: user.id,
      receiverId: friend.id,
      content: text.trim(),
    });

    setText("");
  };

  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow p-6 h-full flex flex-col">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#e3d8c8]">
        <h2
          className="text-xl font-semibold"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          {friend?.name}
        </h2>
      </div>

      {/* MESSAGE AREA */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto bg-[#faf6ed] border border-[#e3d8c8] rounded-lg p-4 space-y-3"
      >
        {/* LOADING STATE */}
        {loading && (
          <p className="text-center text-gray-500 text-sm italic">
            Loading chat…
          </p>
        )}

        {/* EMPTY CHAT MESSAGE */}
        {!loading && messages.length === 0 && (
          <p className="text-center text-gray-600 text-lg italic mt-20"
             style={{ fontFamily: "Times New Roman, serif" }}>
            New chat. Start the conversation!
          </p>
        )}

        {/* CHAT MESSAGES */}
        {messages.map((m) => {
          const mine = m.senderId === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-4 py-2 max-w-[70%] rounded-xl text-sm shadow ${
                  mine
                    ? "bg-[#e7d4c3]"
                    : "bg-white border border-[#e3d8c8]"
                }`}
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT BAR */}
      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 border border-[#d7c4a9] rounded-lg px-3 py-2 text-sm"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ fontFamily: "Times New Roman, serif" }}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-[#774C30] text-white rounded-lg hover:opacity-90 text-sm"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
