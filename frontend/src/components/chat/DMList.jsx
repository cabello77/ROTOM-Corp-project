//DMList.jsx
import React from "react";

export default function DMList({ friends, onSelectFriend }) {
  if (!friends?.length) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-semibold text-gray-800">Your Messages</h1>
        <p className="text-gray-600 mt-2">
          When you start messaging friends, your conversations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-semibold text-gray-800 mb-3">Direct Messages</h1>

      <div className="space-y-2">
        {friends.map((f) => (
          <div
            key={f.id}
            onClick={() => onSelectFriend(f)}
            className="cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-gray-700">
              {f.name?.charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-col">
              <span className="font-medium">{f.name}</span>
              <span className="text-xs text-gray-500">Click to chat</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// import refile 
