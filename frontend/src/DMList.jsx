import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "./contexts/UserContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function DMList({ onSelect }) {
  const { user } = useUser();
  const [friends, setFriends] = useState([]);
  const [dmData, setDmData] = useState({});

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/friends/${user.id}`);
        const list = Array.isArray(res.data?.friends) ? res.data.friends : [];
        setFriends(list);

        const mapped = {};

        for (const f of list) {
          const user1Id = Math.min(user.id, f.id);
          const user2Id = Math.max(user.id, f.id);

          // backend must return: { id, lastMessage, unreadCount }
          const convo = await axios.post(`${API_BASE}/api/dm/get-or-create`, {
            user1Id,
            user2Id
          });

          mapped[f.id] = convo.data;
        }

        setDmData(mapped);

      } catch (err) {
        console.error("DMList error:", err);
      }
    };

    load();
  }, [user?.id]);

  return (
    <div className="space-y-3">
      {friends.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No friends yet.</p>
      ) : (
        friends.map(friend => {
          const convo = dmData[friend.id];
          const last = convo?.lastMessage?.content || "No messages yet";

          return (
            <div
              key={friend.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-[#e3d8c8] bg-white hover:bg-[#f8f2e9] cursor-pointer"
              onClick={() =>
                onSelect(friend, convo?.id || convo?.conversationId)
              }
            >
              <img
                src={
                  friend.profile?.profilePicture
                    ? friend.profile.profilePicture.startsWith("http")
                      ? friend.profile.profilePicture
                      : `${API_BASE}${friend.profile.profilePicture}`
                    : "https://via.placeholder.com/40"
                }
                className="w-10 h-10 rounded-full border border-[#d7c4a9]"
              />

              <div className="flex flex-col flex-grow">
                <p className="font-medium text-gray-800">{friend.name}</p>
                <p className="text-xs text-gray-500 truncate max-w-[160px]">
                  {last}
                </p>
              </div>

              {convo?.unreadCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  {convo.unreadCount}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
