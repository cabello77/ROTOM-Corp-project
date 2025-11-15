//DMList.jsx
import React from 'react';

export default function DMList() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-800">Your Messages</h1>
      <p className="text-gray-600 mt-2">
        When you start messaging friends, your conversations will appear here.
      </p>

      <div className="mt-4 border rounded-xl bg-white p-4">
        <p className="text-sm text-gray-500">
          Tip: Direct messages are only between friends.
        </p>
      </div>
    </div>
  );
}
// import refile 
