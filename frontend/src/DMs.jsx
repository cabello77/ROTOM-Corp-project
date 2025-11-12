import { useState } from "react";
import DMList from "./DMList";
import DMChat from "./components/chat/DMChat";
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
      {/* ===== HEADER (Matches UserHome) ===== */}
      <header
        className="text-white shadow"
        style={{ backgroundColor: "#774C30" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Left: App Name */}
            <div
              className="text-6xl md:text-8xl italic"
              style={{ fontFamily: "Kapakana, cursive" }}
            >
              Plotline
            </div>

            {/* Right: Profile Dropdown */}
            <div className="flex items-center space-x-3">
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-grow max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 px-6 py-10">
        {/* Friend List */}
        <div className="lg:col-span-4 bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-4 h-[70vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Your Friends</h2>
          <DMList onSelect={(friend) => setSelectedFriend(friend)} />
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-8">
          {selectedFriend ? (
            <DMChat
              conversationId={conversationId || selectedFriend.id} // placeholder
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
