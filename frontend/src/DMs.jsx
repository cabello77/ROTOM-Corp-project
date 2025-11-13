import { useState } from "react";
import DMList from "./DMList";
import DMChat from "./components/dmchat/DMChat";
import { useUser } from "./contexts/UserContext";
import UserDropdown from "./components/UserDropdown";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function DMs() {
  const { user } = useUser();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#faf6ed",
        fontFamily: "Times New Roman, serif",
      }}
    >
      {/* ===== HEADER ===== */}
      <header className="text-white shadow" style={{ backgroundColor: "#774C30" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div
              className="text-6xl md:text-8xl italic"
              style={{ fontFamily: "Kapakana, cursive" }}
            >
              Plotline
            </div>
            <div className="flex items-center space-x-3">
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-grow max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Sidebar = col-span-3 */}
        <div className="lg:col-span-3 bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-4 h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Your Messages</h2>

          <DMList
            onSelect={(friend, convoId) => {
              setSelectedFriend(friend);
              setConversationId(convoId);
            }}
          />
        </div>

        {/* Chat Panel = col-span-9 */}
        <div className="lg:col-span-9">
          {selectedFriend ? (
            <DMChat
              conversationId={conversationId}
              user={user}
              apiBase={API_BASE}
              friend={selectedFriend}
            />
          ) : (
            <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-10 text-center text-gray-600 italic">
              Select a friend to start chatting.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
