import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../UserDropdown";
import DMChat from "./DMChat";

export default function DMs() {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  const [user, setUser] = useState(null);
  const [friendsList, setFriendsList] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load logged-in user
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return navigate("/login");
    setUser(JSON.parse(stored));
  }, []);

  // Load friends
  useEffect(() => {
    if (!user?.id) return;

    const loadFriends = async () => {
      try {
        const res = await fetch(`${apiBase}/api/friends/${user.id}`);
        const data = await res.json();

        const list = (data.friends || []).map(f =>
          f.friend ? f.friend : f
        );

        setFriendsList(list);
      } catch (e) {
        console.error("Error loading friends:", e);
        setFriendsList([]);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [user?.id]);

  // Create or get an existing DM
  const openChat = async (friend) => {
    try {
      const res = await fetch(`${apiBase}/api/dm/get-or-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          user1Id: user.id,
          user2Id: friend.id
        })
      });

      const data = await res.json();
      setSelectedConversation(data.conversationId);
      setSelectedFriend(friend);
    } catch (e) {
      console.error("Error creating DM:", e);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F1E2" }}>

      {/* HEADER */}
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

      {/* BODY */}
      <div className="max-w-7xl mx-auto p-6 w-full">

        <h1
          className="text-2xl font-semibold text-gray-800 mb-6"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Messages
        </h1>

        <div className="grid grid-cols-12 gap-6">

          {/* FRIEND SIDEBAR */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <div className="bg-white rounded-xl border border-[#e3d8c8] shadow-sm p-4 space-y-2">

              <h2
                className="text-lg font-semibold text-gray-800 mb-2"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Your Friends
              </h2>

              {loading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : friendsList.length === 0 ? (
                <p className="text-sm text-gray-600 italic">
                  No friends yet.
                </p>
              ) : (
                friendsList.map(f => {
                  const avatar = f.profile?.profilePicture
                    ? (f.profile.profilePicture.startsWith("http")
                        ? f.profile.profilePicture
                        : `${apiBase}${f.profile.profilePicture}`)
                    : null;

                  return (
                    <div
                      key={f.id}
                      onClick={() => openChat(f)}
                      className={`flex items-center gap-3 p-2 cursor-pointer rounded transition ${
                        selectedFriend?.id === f.id ? "bg-[#f4ebdf]" : "hover:bg-[#f4ebdf]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[#d7c4a9]">
                        {avatar ? (
                          <img src={avatar} className="w-full h-full object-cover" />
                        ) : (
                          <div className="bg-[#efe2cf] w-full h-full flex items-center justify-center text-sm font-semibold text-gray-700">
                            {f.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <p
                        className="text-sm font-medium text-gray-800"
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        {f.name}
                      </p>
                    </div>
                  );
                })
              )}

            </div>
          </div>

          {/* CHAT PANEL */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9">
            {selectedConversation ? (
              <DMChat
                conversationId={selectedConversation}
                friend={selectedFriend}
                user={user}
                apiBase={apiBase}
              />
            ) : (
              <div
                className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-10 text-center text-gray-600"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Select a friend to start messaging.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
