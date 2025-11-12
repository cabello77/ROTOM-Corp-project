import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "./contexts/UserContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function DMList({ onSelect }) {
  const { user } = useUser();
  const [friends, setFriends] = useState([]); // ✅ always an array

  useEffect(() => {
    if (!user?.id) return;
    axios
      .get(`${API_BASE}/api/friends/${user.id}`)
      .then((res) => {
        // ✅ Defensive handling
        const list = res.data?.friends;
        setFriends(Array.isArray(list) ? list : []); 
      })
      .catch((err) => {
        console.error("Error fetching friends:", err);
        setFriends([]); // ✅ fallback to empty array
      });
  }, [user?.id]);

  return (
    <div className="space-y-3">
      {friends.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No friends yet.</p>
      ) : (
        friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-[#e3d8c8] bg-white hover:bg-[#f8f2e9] cursor-pointer"
            onClick={() => onSelect(friend)}
          >
            <img
              src={
                friend.profile?.profilePicture
                  ? friend.profile.profilePicture.startsWith("http")
                    ? friend.profile.profilePicture
                    : `${API_BASE}${friend.profile.profilePicture}`
                  : "https://via.placeholder.com/40"
              }
              alt={friend.name}
              className="w-10 h-10 rounded-full border border-[#d7c4a9]"
            />
            <div>
              <p
                className="font-medium text-gray-800"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {friend.name}
              </p>
              <p
                className="text-xs text-gray-500"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {friend.profile?.bio || "No bio"}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
